const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { randomUUID } = require('crypto');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'kinness.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS facilities (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT,
      admin_user_id TEXT,
      facility_code TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (admin_user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS residents (
      id TEXT PRIMARY KEY,
      facility_id TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      room_number TEXT,
      photo_url TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS family_members (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      resident_id TEXT NOT NULL,
      relationship TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (resident_id) REFERENCES residents(id) ON DELETE CASCADE,
      UNIQUE(user_id, resident_id)
    );

    CREATE TABLE IF NOT EXISTS updates (
      id TEXT PRIMARY KEY,
      facility_id TEXT NOT NULL,
      resident_id TEXT NOT NULL,
      staff_user_id TEXT NOT NULL,
      content TEXT NOT NULL,
      photo_url TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (facility_id) REFERENCES facilities(id),
      FOREIGN KEY (resident_id) REFERENCES residents(id),
      FOREIGN KEY (staff_user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS user_roles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'staff', 'family')),
      facility_id TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE,
      UNIQUE(user_id, facility_id)
    );

    CREATE TABLE IF NOT EXISTS feed_reads (
      user_id TEXT NOT NULL,
      update_id TEXT NOT NULL,
      read_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, update_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (update_id) REFERENCES updates(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS pending_invites (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      facility_id TEXT NOT NULL,
      resident_id TEXT,
      role TEXT NOT NULL CHECK (role IN ('staff', 'family')),
      relationship TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (facility_id) REFERENCES facilities(id),
      FOREIGN KEY (resident_id) REFERENCES residents(id)
    );
  `);
}

function seedIfEmpty() {
  const facilityCount = db.prepare('SELECT COUNT(*) as c FROM facilities').get().c;
  if (facilityCount > 0) return;

  const facilityCode = process.env.FACILITY_CODE || 'KINNESS2024';
  const facilityId = randomUUID();
  const adminId = randomUUID();
  const bcrypt = require('bcryptjs');
  const adminPassword = bcrypt.hashSync(process.env.ADMIN_SEED_PASSWORD || 'admin12345', 12);

  db.prepare(`
    INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)
  `).run(adminId, 'Facility Admin', process.env.ADMIN_SEED_EMAIL || 'admin@kinness.app', adminPassword);

  db.prepare(`
    INSERT INTO facilities (id, name, address, admin_user_id, facility_code)
    VALUES (?, ?, ?, ?, ?)
  `).run(facilityId, 'Sunrise Care Home', '123 Oak Street', adminId, facilityCode);

  db.prepare(`
    INSERT INTO user_roles (id, user_id, role, facility_id) VALUES (?, ?, ?, ?)
  `).run(randomUUID(), adminId, 'admin', facilityId);

  db.prepare(`
    INSERT INTO residents (id, facility_id, first_name, last_name, room_number)
    VALUES (?, ?, ?, ?, ?)
  `).run(randomUUID(), facilityId, 'Mary', 'Chen', '201');

  console.log(`Seeded facility "${facilityCode}" with admin ${process.env.ADMIN_SEED_EMAIL || 'admin@kinness.app'}`);
}

initSchema();
seedIfEmpty();

module.exports = { db, randomUUID };
