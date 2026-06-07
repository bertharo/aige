const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const dataDir = process.env.DATA_DIR || path.join(__dirname, 'data');
const dbPath = path.join(dataDir, 'kinness.db');

let sqlDb = null;

function persist() {
  if (!sqlDb) return;
  fs.writeFileSync(dbPath, Buffer.from(sqlDb.export()));
}

class Statement {
  constructor(sql) {
    this.sql = sql;
  }

  get(...params) {
    const stmt = sqlDb.prepare(this.sql);
    try {
      if (params.length) stmt.bind(params);
      if (stmt.step()) return stmt.getAsObject();
      return undefined;
    } finally {
      stmt.free();
    }
  }

  all(...params) {
    const stmt = sqlDb.prepare(this.sql);
    const rows = [];
    try {
      if (params.length) stmt.bind(params);
      while (stmt.step()) rows.push(stmt.getAsObject());
      return rows;
    } finally {
      stmt.free();
    }
  }

  run(...params) {
    const stmt = sqlDb.prepare(this.sql);
    try {
      if (params.length) stmt.bind(params);
      stmt.step();
    } finally {
      stmt.free();
    }
    persist();
  }
}

const db = {
  prepare(sql) {
    return new Statement(sql);
  },
  exec(sql) {
    sqlDb.exec(sql);
    persist();
  },
  transaction(fn) {
    sqlDb.run('BEGIN TRANSACTION');
    try {
      fn();
      sqlDb.run('COMMIT');
    } catch (err) {
      sqlDb.run('ROLLBACK');
      throw err;
    }
    persist();
  },
};

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

    CREATE TABLE IF NOT EXISTS activity_schedules (
      id TEXT PRIMARY KEY,
      facility_id TEXT NOT NULL,
      title TEXT NOT NULL,
      day_of_week INTEGER NOT NULL,
      start_time TEXT NOT NULL,
      location TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS family_visits (
      id TEXT PRIMARY KEY,
      resident_id TEXT NOT NULL,
      family_user_id TEXT NOT NULL,
      visit_date TEXT NOT NULL,
      visit_time TEXT NOT NULL,
      visitor_name TEXT NOT NULL,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (resident_id) REFERENCES residents(id) ON DELETE CASCADE,
      FOREIGN KEY (family_user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS daily_records (
      id TEXT PRIMARY KEY,
      resident_id TEXT NOT NULL,
      record_date TEXT NOT NULL,
      breakfast TEXT,
      lunch TEXT,
      dinner TEXT,
      hydration TEXT,
      mood_morning TEXT,
      mood_evening TEXT,
      activities_attended TEXT,
      staff_note TEXT,
      logged_by TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(resident_id, record_date),
      FOREIGN KEY (resident_id) REFERENCES residents(id) ON DELETE CASCADE,
      FOREIGN KEY (logged_by) REFERENCES users(id)
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
  const adminEmail = (process.env.ADMIN_SEED_EMAIL || 'admin@kinness.app').toLowerCase();

  db.prepare('INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)').run(
    adminId,
    'Facility Admin',
    adminEmail,
    adminPassword
  );
  db.prepare(`
    INSERT INTO facilities (id, name, address, admin_user_id, facility_code)
    VALUES (?, ?, ?, ?, ?)
  `).run(facilityId, 'Sunrise Care Home', '123 Oak Street', adminId, facilityCode);
  db.prepare('INSERT INTO user_roles (id, user_id, role, facility_id) VALUES (?, ?, ?, ?)').run(
    randomUUID(),
    adminId,
    'admin',
    facilityId
  );
  db.prepare(`
    INSERT INTO residents (id, facility_id, first_name, last_name, room_number)
    VALUES (?, ?, ?, ?, ?)
  `).run(randomUUID(), facilityId, 'Rosa', 'Haro', '201');

  console.log(`Seeded facility "${facilityCode}" with admin ${adminEmail}`);
}

function ensureDefaultAdmin() {
  const bcrypt = require('bcryptjs');
  const adminEmail = (process.env.ADMIN_SEED_EMAIL || 'admin@kinness.app').toLowerCase();
  const existing = db.prepare('SELECT id FROM users WHERE lower(email) = ?').get(adminEmail);
  if (existing) return;

  const facility = db.prepare('SELECT * FROM facilities LIMIT 1').get();
  if (!facility) {
    seedIfEmpty();
    return;
  }

  const adminId = randomUUID();
  const adminPassword = bcrypt.hashSync(process.env.ADMIN_SEED_PASSWORD || 'admin12345', 12);
  db.prepare('INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)').run(
    adminId,
    'Facility Admin',
    adminEmail,
    adminPassword
  );
  db.prepare('INSERT INTO user_roles (id, user_id, role, facility_id) VALUES (?, ?, ?, ?)').run(
    randomUUID(),
    adminId,
    'admin',
    facility.id
  );
  console.log(`Created missing admin: ${adminEmail}`);
}

async function initDatabase(options = {}) {
  const wasmPath = path.join(__dirname, 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm');
  const SQL = await initSqlJs({
    locateFile: () => wasmPath,
  });

  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  if (fs.existsSync(dbPath)) {
    sqlDb = new SQL.Database(fs.readFileSync(dbPath));
  } else {
    sqlDb = new SQL.Database();
  }

  initSchema();
  if (!options.skipAutoSeed) {
    seedIfEmpty();
    ensureDefaultAdmin();
  }
  if (!options.quiet) {
    console.log('SQLite ready (sql.js) at', dbPath);
  }
  return db;
}

function clearAllData() {
  db.exec(`
    DELETE FROM feed_reads;
    DELETE FROM daily_records;
    DELETE FROM family_visits;
    DELETE FROM activity_schedules;
    DELETE FROM updates;
    DELETE FROM family_members;
    DELETE FROM pending_invites;
    DELETE FROM user_roles;
    DELETE FROM residents;
    DELETE FROM facilities;
    DELETE FROM users;
  `);
}

module.exports = {
  initDatabase,
  getDb: () => db,
  randomUUID,
  ensureDefaultAdmin,
  seedIfEmpty,
  clearAllData,
};
