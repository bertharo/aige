const express = require('express');
const { body, validationResult } = require('express-validator');
const { assertFamilyAccess } = require('../lib/familyAccess');

function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function attendanceForActivity(db, residentId, recordDate, title) {
  const row = db.prepare(
    'SELECT activities_attended FROM daily_records WHERE resident_id = ? AND record_date = ?'
  ).get(residentId, recordDate);
  if (!row?.activities_attended) return null;
  try {
    const list = JSON.parse(row.activities_attended);
    return Array.isArray(list) && list.includes(title) ? 'Attended' : 'Missed';
  } catch {
    return null;
  }
}

function registerCalendarRoutes(app, { db, authenticateToken, requireRole, randomUUID }) {
  const router = express.Router();

  router.post(
    '/visit',
    authenticateToken,
    requireRole('family'),
    body('resident_id').notEmpty(),
    body('visit_date').matches(/^\d{4}-\d{2}-\d{2}$/),
    body('visit_time').isIn(['morning', 'afternoon', 'evening']),
    body('visitor_name').trim().notEmpty(),
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ success: false, message: 'Please check your visit details' });
        }

        const { resident_id, visit_time, visitor_name, notes } = req.body;
        const visit_date = String(req.body.visit_date).slice(0, 10);

        assertFamilyAccess(db, req.user.userId, resident_id);

        const id = randomUUID();
        db.prepare(`
          INSERT INTO family_visits (
            id, resident_id, family_user_id, visit_date, visit_time,
            visitor_name, notes, status, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))
        `).run(id, resident_id, req.user.userId, visit_date, visit_time, visitor_name, notes || null);

        res.status(201).json({
          success: true,
          id,
          status: 'pending',
          message: 'Visit request sent',
          visit: {
            id,
            visit_date,
            visit_time,
            visitor_name,
            notes: notes || null,
            status: 'pending',
          },
        });
      } catch (err) {
        const status = err.status || 500;
        res.status(status).json({ success: false, message: err.message || 'Could not schedule visit' });
      }
    }
  );

  router.get('/:residentId', authenticateToken, requireRole('family'), (req, res) => {
    try {
      const { residentId } = req.params;
      const link = assertFamilyAccess(db, req.user.userId, residentId);

      const schedules = db.prepare(`
        SELECT id, title, day_of_week, start_time, location
        FROM activity_schedules
        WHERE facility_id = ?
        ORDER BY day_of_week, start_time
      `).all(link.facility_id);

      const visits = db.prepare(`
        SELECT id, visit_date, visit_time, visitor_name, status, notes
        FROM family_visits
        WHERE resident_id = ? AND family_user_id = ?
        ORDER BY visit_date ASC
      `).all(residentId, req.user.userId);

      const todayStr = formatDate(new Date());
      const schedulesWithMeta = schedules.map((s) => ({ ...s }));

      res.json({
        success: true,
        schedules: schedulesWithMeta,
        visits,
        today: todayStr,
      });
    } catch (err) {
      const status = err.status || 500;
      res.status(status).json({ success: false, message: err.message || 'Could not load calendar' });
    }
  });

  app.use('/api/calendar', router);

  app.get('/api/calendar-events/:residentId/:date', authenticateToken, requireRole('family'), (req, res) => {
    try {
      const { residentId, date } = req.params;
      const link = assertFamilyAccess(db, req.user.userId, residentId);

      const d = new Date(`${date}T12:00:00`);
      const dayOfWeek = d.getDay();
      const todayStr = formatDate(new Date());
      const isPast = date < todayStr;
      const isFuture = date > todayStr;

      const schedules = db.prepare(`
        SELECT id, title, day_of_week, start_time, location
        FROM activity_schedules
        WHERE facility_id = ? AND day_of_week = ?
        ORDER BY start_time
      `).all(link.facility_id, dayOfWeek);

      const facility = schedules.map((s) => {
        let status = '';
        if (isFuture) status = 'Scheduled';
        else if (isPast) {
          const att = attendanceForActivity(db, residentId, date, s.title);
          status = att || 'Missed';
        }
        return {
          id: s.id,
          time: s.start_time,
          name: s.title,
          location: s.location || '',
          status,
        };
      });

      const visits = db.prepare(`
        SELECT id, visit_date, visit_time, visitor_name, status, notes
        FROM family_visits
        WHERE resident_id = ? AND family_user_id = ? AND visit_date = ?
      `).all(residentId, req.user.userId, date).map((v) => ({
        id: v.id,
        visitor: v.visitor_name,
        relationship: 'Family',
        time: v.visit_time,
        duration: '1 hour',
        status: v.status === 'confirmed' ? 'Confirmed' : v.status === 'pending' ? 'Pending' : 'Declined',
        notes: v.notes,
      }));

      res.json({ success: true, facility, family: visits });
    } catch (err) {
      const status = err.status || 500;
      res.status(status).json({ success: false, message: err.message || 'Could not load events' });
    }
  });
}

module.exports = { registerCalendarRoutes };
