#!/usr/bin/env node
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const bcrypt = require('bcryptjs');
const { initDatabase, getDb, randomUUID } = require('../db');

async function main() {
  await initDatabase();
  const db = getDb();

  const email = (process.env.STAFF_SEED_EMAIL || 'staff@kinness.app').toLowerCase();
  const password = process.env.STAFF_SEED_PASSWORD || 'staff12345';
  const name = process.env.STAFF_SEED_NAME || 'Care Staff';
  const facilityCode = process.env.FACILITY_CODE || 'KINNESS2024';

  const facility = db.prepare('SELECT * FROM facilities WHERE upper(facility_code) = upper(?)').get(facilityCode);
  if (!facility) {
    console.error(`Facility not found for code: ${facilityCode}`);
    process.exit(1);
  }

  const existing = db.prepare('SELECT id FROM users WHERE lower(email) = ?').get(email);
  if (existing) {
    const role = db.prepare('SELECT role FROM user_roles WHERE user_id = ? AND facility_id = ?').get(existing.id, facility.id);
    if (role?.role === 'staff') {
      console.log(`Staff already exists: ${email}`);
      process.exit(0);
    }
    db.prepare('INSERT OR IGNORE INTO user_roles (id, user_id, role, facility_id) VALUES (?, ?, ?, ?)').run(
      randomUUID(),
      existing.id,
      'staff',
      facility.id
    );
    console.log(`Linked existing user ${email} as staff at ${facility.name}`);
    process.exit(0);
  }

  const userId = randomUUID();
  const hashed = await bcrypt.hash(password, 12);

  db.prepare('INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)').run(userId, name, email, hashed);
  db.prepare('INSERT INTO user_roles (id, user_id, role, facility_id) VALUES (?, ?, ?, ?)').run(
    randomUUID(),
    userId,
    'staff',
    facility.id
  );

  db.prepare('DELETE FROM pending_invites WHERE lower(email) = lower(?) AND facility_id = ?').run(email, facility.id);

  console.log('Staff account created:');
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${password}`);
  console.log(`  Facility: ${facility.name} (${facility.facility_code})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
