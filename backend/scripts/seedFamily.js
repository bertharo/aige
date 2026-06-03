#!/usr/bin/env node
/**
 * Seed a family account linked to the first resident at the facility.
 * Usage: node scripts/seedFamily.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const bcrypt = require('bcryptjs');
const { db, randomUUID } = require('../db');

async function main() {
  const email = process.env.FAMILY_SEED_EMAIL || 'family@kinness.app';
  const password = process.env.FAMILY_SEED_PASSWORD || 'family12345';
  const name = process.env.FAMILY_SEED_NAME || 'Family Member';
  const facilityCode = process.env.FACILITY_CODE || 'KINNESS2024';

  const facility = db.prepare('SELECT * FROM facilities WHERE upper(facility_code) = upper(?)').get(facilityCode);
  if (!facility) {
    console.error(`Facility not found for code: ${facilityCode}`);
    process.exit(1);
  }

  let resident = db.prepare('SELECT * FROM residents WHERE facility_id = ? LIMIT 1').get(facility.id);
  if (!resident) {
    const residentId = randomUUID();
    db.prepare(`
      INSERT INTO residents (id, facility_id, first_name, last_name, room_number)
      VALUES (?, ?, ?, ?, ?)
    `).run(residentId, facility.id, 'Mary', 'Chen', '201');
    resident = db.prepare('SELECT * FROM residents WHERE id = ?').get(residentId);
    console.log('Created demo resident: Mary Chen (Room 201)');
  }

  let userId;
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    userId = existing.id;
    db.prepare('INSERT OR IGNORE INTO user_roles (id, user_id, role, facility_id) VALUES (?, ?, ?, ?)').run(
      randomUUID(),
      userId,
      'family',
      facility.id
    );
  } else {
    userId = randomUUID();
    const hashed = await bcrypt.hash(password, 12);
    db.prepare('INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)').run(userId, name, email, hashed);
    db.prepare('INSERT INTO user_roles (id, user_id, role, facility_id) VALUES (?, ?, ?, ?)').run(
      randomUUID(),
      userId,
      'family',
      facility.id
    );
  }

  db.prepare(`
    INSERT OR IGNORE INTO family_members (id, user_id, resident_id, relationship) VALUES (?, ?, ?, ?)
  `).run(randomUUID(), userId, resident.id, 'Daughter');

  console.log('Family account ready:');
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${password}`);
  console.log(`  Linked:   ${resident.first_name} ${resident.last_name}`);
  console.log('  Route after login: /family/feed');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
