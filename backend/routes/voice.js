const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const { transcribe, structure } = require('../lib/ai');
const { sendUpdateNotification } = require('../mail');

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getTargetLanguage(db, residentId) {
  const row = db.prepare(`
    SELECT fm.preferred_language
    FROM family_members fm
    WHERE fm.resident_id = ?
    ORDER BY fm.created_at
    LIMIT 1
  `).get(residentId);
  return row?.preferred_language || 'en';
}

function mergeStaffNote(db, residentId, careNote, staffUserId, randomUUID) {
  const recordDate = todayKey();
  const existing = db.prepare(
    'SELECT id, staff_note FROM daily_records WHERE resident_id = ? AND record_date = ?'
  ).get(residentId, recordDate);

  const note = careNote.trim();
  if (!note) return;

  if (existing) {
    const merged = existing.staff_note ? `${existing.staff_note}\n\n${note}` : note;
    db.prepare(`
      UPDATE daily_records SET staff_note = ?, logged_by = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(merged, staffUserId, existing.id);
    return;
  }

  db.prepare(`
    INSERT INTO daily_records (id, resident_id, record_date, staff_note, logged_by, updated_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
  `).run(randomUUID(), residentId, recordDate, note, staffUserId);
}

function registerVoiceRoutes(app, { db, authenticateToken, requireRole, randomUUID, voiceUpload }) {
  app.post(
    '/api/staff/voice/draft',
    authenticateToken,
    requireRole('staff', 'admin'),
    voiceUpload.single('audio'),
    async (req, res) => {
      let audioPath = req.file?.path;
      try {
        const { residentId } = req.body;
        if (!residentId) {
          return res.status(400).json({ success: false, message: 'Please select a resident first' });
        }
        if (!req.file) {
          return res.status(400).json({ success: false, message: 'No audio received — try recording again' });
        }

        const resident = db.prepare(
          'SELECT * FROM residents WHERE id = ? AND facility_id = ?'
        ).get(residentId, req.user.facilityId);
        if (!resident) {
          return res.status(404).json({ success: false, message: 'Resident not found' });
        }

        const staff = db.prepare('SELECT name FROM users WHERE id = ?').get(req.user.userId);
        const facility = db.prepare('SELECT name FROM facilities WHERE id = ?').get(req.user.facilityId);
        const residentName = `${resident.first_name} ${resident.last_name}`;
        const targetLanguage = getTargetLanguage(db, residentId);

        const { text: transcript, detectedLanguage } = await transcribe(
          req.file.path,
          req.file.mimetype
        );

        const structured = await structure(
          transcript,
          {
            residentName,
            staffName: staff?.name || 'Staff',
            facilityName: facility?.name || 'Care home',
          },
          targetLanguage
        );

        const audioUrl = `/uploads/voice/${path.basename(req.file.path)}`;

        res.json({
          success: true,
          transcript,
          detectedLanguage,
          targetLanguage,
          careNote: structured.careNote,
          familyUpdate: structured.familyUpdate,
          parseFailed: structured.parseFailed,
          audioUrl,
          residentName,
        });
      } catch (err) {
        if (audioPath && fs.existsSync(audioPath)) {
          fs.unlinkSync(audioPath);
        }
        console.error('Voice draft error:', err);
        const status = err.status || 500;
        res.status(status).json({
          success: false,
          message: err.message || 'Could not process voice note',
        });
      }
    }
  );

  app.post(
    '/api/staff/voice/approve',
    authenticateToken,
    requireRole('staff', 'admin'),
    body('residentId').notEmpty(),
    body('familyUpdate').trim().notEmpty(),
    body('careNote').optional().trim(),
    body('transcript').optional().trim(),
    body('audioUrl').optional().trim(),
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ success: false, message: 'Please review the update before sending' });
        }

        const { residentId, familyUpdate, careNote, transcript, audioUrl } = req.body;

        const resident = db.prepare(
          'SELECT * FROM residents WHERE id = ? AND facility_id = ?'
        ).get(residentId, req.user.facilityId);
        if (!resident) {
          return res.status(404).json({ success: false, message: 'Resident not found' });
        }

        const content = familyUpdate.trim();
        const updateId = randomUUID();
        const staffId = req.user.userId;

        db.prepare(`
          INSERT INTO updates (id, facility_id, resident_id, staff_user_id, content, photo_url, transcript, audio_url)
          VALUES (?, ?, ?, ?, ?, NULL, ?, ?)
        `).run(
          updateId,
          req.user.facilityId,
          residentId,
          staffId,
          content,
          transcript?.trim() || null,
          audioUrl?.trim() || null
        );

        if (careNote?.trim()) {
          mergeStaffNote(db, residentId, careNote.trim(), staffId, randomUUID);
        }

        const staff = db.prepare('SELECT name FROM users WHERE id = ?').get(staffId);
        const facility = db.prepare('SELECT name FROM facilities WHERE id = ?').get(req.user.facilityId);
        const residentName = `${resident.first_name} ${resident.last_name}`;

        const familyRows = db.prepare(`
          SELECT u.email FROM family_members fm
          JOIN users u ON u.id = fm.user_id
          WHERE fm.resident_id = ?
        `).all(residentId);

        const feedUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/family/feed`;
        try {
          await sendUpdateNotification({
            familyEmails: familyRows.map((r) => r.email),
            residentName,
            facilityName: facility.name,
            content,
            feedUrl,
          });
        } catch (mailErr) {
          console.error('Email notification failed:', mailErr);
        }

        res.status(201).json({
          success: true,
          message: 'Update posted — family will be notified',
          update: {
            id: updateId,
            content,
            residentName,
            staffName: staff?.name,
            createdAt: new Date().toISOString(),
          },
        });
      } catch (err) {
        console.error('Voice approve error:', err);
        res.status(500).json({ success: false, message: 'Could not post update — please try again' });
      }
    }
  );
}

module.exports = { registerVoiceRoutes };
