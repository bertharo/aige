const { assertFamilyAccess } = require('../lib/familyAccess');

function registerPhotosRoutes(app, { db, authenticateToken, requireRole }) {
  app.get('/api/photos/:residentId', authenticateToken, requireRole('family'), (req, res) => {
    try {
      const { residentId } = req.params;
      assertFamilyAccess(db, req.user.userId, residentId);

      const rows = db.prepare(`
        SELECT u.id, u.photo_url, u.content, u.created_at, s.name as staff_name
        FROM updates u
        JOIN users s ON s.id = u.staff_user_id
        WHERE u.resident_id = ? AND u.photo_url IS NOT NULL AND u.photo_url != ''
        ORDER BY u.created_at DESC
      `).all(residentId);

      const photos = rows.map((r) => ({
        id: r.id,
        photo_url: r.photo_url,
        caption: r.content,
        created_at: r.created_at,
        staff_name: r.staff_name,
      }));

      res.json({ success: true, photos });
    } catch (err) {
      const status = err.status || 500;
      res.status(status).json({ success: false, message: err.message || 'Could not load photos' });
    }
  });
}

module.exports = { registerPhotosRoutes };
