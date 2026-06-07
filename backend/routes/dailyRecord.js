const { assertFamilyAccess } = require('../lib/familyAccess');

function emptyRecord(recordDate) {
  return {
    record_date: recordDate,
    breakfast: null,
    lunch: null,
    dinner: null,
    hydration: null,
    mood_morning: null,
    mood_evening: null,
    activities_attended: [],
    staff_note: null,
  };
}

function registerDailyRecordRoutes(app, { db, authenticateToken, requireRole }) {
  app.get('/api/daily-record/:residentId/:date', authenticateToken, requireRole('family'), (req, res) => {
    try {
      const { residentId, date } = req.params;
      assertFamilyAccess(db, req.user.userId, residentId);

      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ success: false, message: 'Invalid date format' });
      }

      const row = db.prepare(
        'SELECT * FROM daily_records WHERE resident_id = ? AND record_date = ?'
      ).get(residentId, date);

      let staffNote = row?.staff_note || null;
      if (!staffNote) {
        const update = db.prepare(`
          SELECT content FROM updates
          WHERE resident_id = ? AND date(created_at) = date(?)
          ORDER BY created_at DESC LIMIT 1
        `).get(residentId, date);
        staffNote = update?.content || null;
      }

      if (!row) {
        return res.json({ success: true, ...emptyRecord(date), staff_note: staffNote });
      }

      let activities = [];
      if (row.activities_attended) {
        try {
          activities = JSON.parse(row.activities_attended);
        } catch {
          activities = [];
        }
      }

      res.json({
        success: true,
        record_date: row.record_date,
        breakfast: row.breakfast,
        lunch: row.lunch,
        dinner: row.dinner,
        hydration: row.hydration,
        mood_morning: row.mood_morning,
        mood_evening: row.mood_evening,
        activities_attended: activities,
        staff_note: staffNote,
      });
    } catch (err) {
      const status = err.status || 500;
      res.status(status).json({ success: false, message: err.message || 'Could not load daily record' });
    }
  });
}

module.exports = { registerDailyRecordRoutes };
