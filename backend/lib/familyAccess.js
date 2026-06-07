function assertFamilyAccess(db, userId, residentId) {
  const link = db.prepare(`
    SELECT fm.id, r.id as resident_id, r.first_name, r.last_name, r.facility_id
    FROM family_members fm
    JOIN residents r ON r.id = fm.resident_id
    WHERE fm.user_id = ? AND fm.resident_id = ?
  `).get(userId, residentId);

  if (!link) {
    const err = new Error('You are not linked to this resident');
    err.status = 403;
    throw err;
  }
  return link;
}

function getFamilyResidents(db, userId) {
  return db.prepare(`
    SELECT r.id, r.first_name, r.last_name, r.facility_id, fm.relationship
    FROM family_members fm
    JOIN residents r ON r.id = fm.resident_id
    WHERE fm.user_id = ?
    ORDER BY r.last_name, r.first_name
  `).all(userId);
}

module.exports = { assertFamilyAccess, getFamilyResidents };
