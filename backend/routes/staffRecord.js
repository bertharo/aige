const { body, validationResult } = require('express-validator');

const MEAL_VALUES = ['ate_well', 'partial', 'skipped'];
const HYDRATION_VALUES = ['good', 'fair', 'low'];
const MOOD_VALUES = ['good', 'okay', 'low', 'tired'];

function registerStaffRecordRoutes(app, { db, authenticateToken, requireRole, randomUUID }) {
  app.get('/api/staff/today-activities', authenticateToken, requireRole('staff', 'admin'), (req, res) => {
    try {
      const facilityId = req.user.facilityId;
      const dayOfWeek = new Date().getDay();

      const schedules = db.prepare(`
        SELECT id, title, start_time, location
        FROM activity_schedules
        WHERE facility_id = ? AND day_of_week = ?
        ORDER BY start_time
      `).all(facilityId, dayOfWeek);

      res.json({ success: true, activities: schedules });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Could not load activities' });
    }
  });

  app.post(
    '/api/staff/daily-record',
    authenticateToken,
    requireRole('staff', 'admin'),
    body('resident_id').notEmpty(),
    body('record_date').matches(/^\d{4}-\d{2}-\d{2}$/),
    body('breakfast').optional().isIn(MEAL_VALUES),
    body('lunch').optional().isIn(MEAL_VALUES),
    body('dinner').optional().isIn(MEAL_VALUES),
    body('hydration').optional().isIn(HYDRATION_VALUES),
    body('mood_morning').optional().isIn(MOOD_VALUES),
    body('mood_evening').optional().isIn(MOOD_VALUES),
    body('activities_attended').optional().isArray(),
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ success: false, message: 'Invalid daily record data' });
        }

        const {
          resident_id,
          record_date,
          breakfast,
          lunch,
          dinner,
          hydration,
          mood_morning,
          mood_evening,
          activities_attended,
        } = req.body;

        const resident = db.prepare(
          'SELECT id FROM residents WHERE id = ? AND facility_id = ?'
        ).get(resident_id, req.user.facilityId);
        if (!resident) {
          return res.status(404).json({ success: false, message: 'Resident not found' });
        }

        const activitiesJson = JSON.stringify(activities_attended || []);
        const existing = db.prepare(
          'SELECT id FROM daily_records WHERE resident_id = ? AND record_date = ?'
        ).get(resident_id, record_date);

        if (existing) {
          db.prepare(`
            UPDATE daily_records SET
              breakfast = COALESCE(?, breakfast),
              lunch = COALESCE(?, lunch),
              dinner = COALESCE(?, dinner),
              hydration = COALESCE(?, hydration),
              mood_morning = COALESCE(?, mood_morning),
              mood_evening = COALESCE(?, mood_evening),
              activities_attended = ?,
              logged_by = ?,
              updated_at = datetime('now')
            WHERE id = ?
          `).run(
            breakfast ?? null,
            lunch ?? null,
            dinner ?? null,
            hydration ?? null,
            mood_morning ?? null,
            mood_evening ?? null,
            activitiesJson,
            req.user.userId,
            existing.id
          );
        } else {
          db.prepare(`
            INSERT INTO daily_records (
              id, resident_id, record_date, breakfast, lunch, dinner, hydration,
              mood_morning, mood_evening, activities_attended, logged_by, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
          `).run(
            randomUUID(),
            resident_id,
            record_date,
            breakfast ?? null,
            lunch ?? null,
            dinner ?? null,
            hydration ?? null,
            mood_morning ?? null,
            mood_evening ?? null,
            activitiesJson,
            req.user.userId
          );
        }

        res.json({ success: true, record_date });
      } catch (err) {
        console.error('Daily record save error:', err);
        res.status(500).json({ success: false, message: 'Could not save daily record' });
      }
    }
  );
}

module.exports = { registerStaffRecordRoutes };
