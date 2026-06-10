#!/usr/bin/env node
/**
 * Kinness demo seed — Sunrise Gardens Senior Living
 * Usage: node seed.js
 *        node seed.js --reset
 */
require('dotenv').config();

const bcrypt = require('bcryptjs');
const { initDatabase, getDb, randomUUID, clearAllData } = require('./db');

const FACILITY_CODE = 'SGSL2024';
const SALT_ROUNDS = 12;

const FACILITY = {
  name: 'Sunrise Gardens Senior Living',
  address: '842 Marigold Lane, Oakland, CA 94607',
  code: FACILITY_CODE,
  admin: {
    name: 'Sunrise Admin',
    email: 'admin@sunrisegardens.com',
    password: 'Admin1234!',
  },
};

const RESIDENTS = [
  { first: 'Rosa', last: 'Haro', room: '12', unit: 'Assisted Living' },
  { first: 'Robert', last: 'Johnson', room: '7', unit: 'Memory Care' },
  { first: 'Helen', last: 'Nakamura', room: '3', unit: 'Assisted Living' },
  { first: 'George', last: 'Williams', room: '15', unit: 'Memory Care' },
  { first: 'Dorothy', last: 'Kim', room: '9', unit: 'Assisted Living' },
  { first: 'Frank', last: 'Deluca', room: '11', unit: 'Assisted Living' },
  { first: 'Mei', last: 'Lin', room: '6', unit: 'Memory Care' },
  { first: 'James', last: 'Okafor', room: '14', unit: 'Assisted Living' },
];

const STAFF = [
  { name: 'Sarah Reyes', email: 'sarah@sunrisegardens.com', password: 'Staff1234!', key: 'Sarah' },
  { name: 'David Park', email: 'david@sunrisegardens.com', password: 'Staff1234!', key: 'David' },
  { name: 'Aisha Thompson', email: 'aisha@sunrisegardens.com', password: 'Staff1234!', key: 'Aisha' },
];

const FAMILIES = [
  { name: 'Jenny Haro', email: 'jenny.haro@gmail.com', password: 'Family1234!', resident: 'Rosa Haro', relationship: 'Daughter', preferredLanguage: 'en' },
  { name: 'Michael Johnson', email: 'michael.j@gmail.com', password: 'Family1234!', resident: 'Robert Johnson', relationship: 'Son', preferredLanguage: 'en' },
  { name: 'Kenji Nakamura', email: 'kenji.n@gmail.com', password: 'Family1234!', resident: 'Helen Nakamura', relationship: 'Son', preferredLanguage: 'en' },
  { name: 'Patricia Williams', email: 'patricia.w@gmail.com', password: 'Family1234!', resident: 'George Williams', relationship: 'Daughter', preferredLanguage: 'en' },
  { name: 'Susan Kim', email: 'susan.kim@gmail.com', password: 'Family1234!', resident: 'Dorothy Kim', relationship: 'Daughter', preferredLanguage: 'en' },
  { name: 'Marco Deluca', email: 'marco.d@gmail.com', password: 'Family1234!', resident: 'Frank Deluca', relationship: 'Son', preferredLanguage: 'es' },
  { name: 'Wei Lin', email: 'wei.lin@gmail.com', password: 'Family1234!', resident: 'Mei Lin', relationship: 'Son', preferredLanguage: 'en' },
  { name: 'Amara Okafor', email: 'amara.o@gmail.com', password: 'Family1234!', resident: 'James Okafor', relationship: 'Daughter', preferredLanguage: 'en' },
];

const UPDATES = [
  { day: 1, period: 'morning', resident: 'Rosa Haro', staff: 'Sarah', content: 'Rosa was up before breakfast asking if Jenny had called yet. She finished her pozole and said it tasted like home, then sat on the patio humming a song her mother used to sing in Guadalajara. She pointed at the bougainvillea and told me it looks just like the ones outside her old house.' },
  { day: 1, period: 'afternoon', resident: 'Robert Johnson', staff: 'David', content: 'Robert was restless after lunch today but calmed down once we put on some classic jazz. He tapped along to the music and eventually dozed off in his chair. Peaceful afternoon overall.' },
  { day: 1, period: 'morning', resident: 'Helen Nakamura', staff: 'Aisha', content: 'Helen joined the chair yoga class for the first time this morning. She did really well and told me she wants to come back next week. Big smile on her face after.' },
  { day: 1, period: 'evening', resident: 'George Williams', staff: 'Sarah', content: 'George had a calm day. Ate well at both meals and spent the afternoon watching TV in the common room. Staff checked in every hour. No concerns.' },
  { day: 2, period: 'evening', resident: 'Dorothy Kim', staff: 'David', content: 'Dorothy helped set the dinner table tonight — she loves to pitch in and was very proud of herself. She laughed a lot during the meal and entertained everyone at her table.' },
  { day: 2, period: 'morning', resident: 'Frank Deluca', staff: 'Aisha', content: 'Frank had a good morning. He asked to go outside so we sat on the patio for about 30 minutes. He talked about his old neighborhood in San Francisco and seemed really happy reminiscing.' },
  { day: 2, period: 'afternoon', resident: 'Mei Lin', staff: 'Sarah', content: 'Mei Lin was quiet today but engaged. She participated in the afternoon art activity and painted a small watercolor. Staff kept it to show her family.' },
  { day: 2, period: 'morning', resident: 'James Okafor', staff: 'David', content: 'James had a great breakfast and then spent the morning reading in the common room. He got into a long conversation with another resident about basketball and was laughing a lot.' },
  { day: 3, period: 'evening', resident: 'Rosa Haro', staff: 'Aisha', content: "Rosa barely touched her plate until we brought out the caldo — then she had two bowls and asked for more bread. She wrapped her flan in a napkin and put it in the fridge with a note that said 'para Jenny.' She went to bed saying Sunday cannot come fast enough." },
  { day: 3, period: 'morning', resident: 'Robert Johnson', staff: 'Sarah', content: 'Robert had a better day today. He recognized a staff member by name this morning which was a nice moment. Ate well at lunch and slept soundly after.' },
  { day: 3, period: 'afternoon', resident: 'Helen Nakamura', staff: 'David', content: 'Helen asked about her son Kenji several times today. We showed her a photo and she lit up. She was calm and content for the rest of the afternoon.' },
  { day: 4, period: 'morning', resident: 'George Williams', staff: 'Aisha', content: 'George joined the music hour today for the first time. He seemed to enjoy the singing and clapped along. A staff member sat with him the whole time.' },
  { day: 4, period: 'afternoon', resident: 'Dorothy Kim', staff: 'Sarah', content: 'Dorothy had her hair done today and was absolutely delighted. She kept looking in the mirror and telling everyone how nice she looked. Best mood we have seen in a while.' },
  { day: 4, period: 'afternoon', resident: 'Frank Deluca', staff: 'David', content: "Frank skipped lunch today — said he wasn't hungry. We offered a snack later and he had some soup and crackers. Will monitor tomorrow. He seemed tired but not distressed." },
  { day: 5, period: 'morning', resident: 'Mei Lin', staff: 'Aisha', content: 'Mei Lin slept well last night and woke up in good spirits. She ate a full breakfast and sat in the garden for a while this morning. Very peaceful day.' },
  { day: 5, period: 'evening', resident: 'James Okafor', staff: 'Sarah', content: 'James got a care package from his daughter Amara today. He was so happy — showed everyone the snacks and shared them with the table at dinner. Made his whole week.' },
  { day: 6, period: 'morning', resident: 'Rosa Haro', staff: 'David', content: "Rosa rolled into PT with her walker and announced she was ready to waltz. She finished the whole session without stopping once, then asked the therapist to play a ranchera next time. On the way out she said she is saving her good dress for Jenny's wedding — whenever that day comes, she plans to be ready." },
  { day: 6, period: 'evening', resident: 'Robert Johnson', staff: 'Aisha', content: 'Robert had a difficult evening — he was confused and anxious around 7pm. Staff stayed close and played soft music which helped him settle. He was asleep by 8:30. We will note this for the care team.' },
  { day: 7, period: 'morning', resident: 'Helen Nakamura', staff: 'Sarah', content: 'Helen baked cookies with the activity team today. She remembered her mother\'s recipe and guided everyone through it. She was proud and happy. Cookies were delicious.' },
  { day: 7, period: 'afternoon', resident: 'George Williams', staff: 'David', content: 'George had a quiet but good day today. He ate all three meals and spent time in the common area. He smiled when staff greeted him this morning — a small thing but it meant a lot.' },
];

// Deterministic minutes per update index (not always on the hour)
const TIME_OFFSETS = [
  [8, 23], [14, 37], [10, 05], [18, 42], [19, 15], [9, 48], [15, 22], [8, 51],
  [17, 33], [9, 12], [13, 58], [10, 27], [14, 09], [15, 44], [8, 36], [18, 07],
  [9, 19], [19, 48], [10, 41], [13, 16],
];

function residentKey(first, last) {
  return `${first} ${last}`;
}

function hashPassword(plain) {
  return bcrypt.hashSync(plain, SALT_ROUNDS);
}

function buildTimestamp(day, period, index) {
  const [hour, minute] = TIME_OFFSETS[index];

  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - (7 - day));
  d.setHours(hour, minute, 0, 0);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
}

function getUserByEmail(db, email) {
  return db.prepare('SELECT id FROM users WHERE lower(email) = ?').get(email.toLowerCase());
}

function insertUser(db, { name, email, password }) {
  const existing = getUserByEmail(db, email);
  if (existing) return existing.id;
  const id = randomUUID();
  db.prepare('INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)').run(
    id,
    name,
    email.toLowerCase(),
    hashPassword(password)
  );
  return id;
}

function insertRole(db, userId, role, facilityId) {
  const exists = db.prepare('SELECT id FROM user_roles WHERE user_id = ? AND facility_id = ?').get(userId, facilityId);
  if (exists) return;
  db.prepare('INSERT INTO user_roles (id, user_id, role, facility_id) VALUES (?, ?, ?, ?)').run(
    randomUUID(),
    userId,
    role,
    facilityId
  );
}

async function runSeed({ reset = false, quiet = false } = {}) {
  await initDatabase({ skipAutoSeed: true, quiet });
  const db = getDb();

  if (reset) {
    console.log('Resetting database...');
    clearAllData();
  } else {
    const existing = db.prepare('SELECT id FROM facilities WHERE upper(facility_code) = upper(?)').get(FACILITY_CODE);
    if (existing) {
      console.log(`Facility ${FACILITY_CODE} already seeded. Run with --reset to replace all data.`);
      printSummary();
      return { facilityId: existing.id, facilityCode: FACILITY_CODE };
    }
  }

  console.log('Creating facility...');
  const adminId = insertUser(db, FACILITY.admin);
  const facilityId = randomUUID();
  db.prepare(`
    INSERT INTO facilities (id, name, address, admin_user_id, facility_code)
    VALUES (?, ?, ?, ?, ?)
  `).run(facilityId, FACILITY.name, FACILITY.address, adminId, FACILITY.code);
  insertRole(db, adminId, 'admin', facilityId);

  console.log('Adding residents...');
  const residentIds = {};
  for (const r of RESIDENTS) {
    const key = residentKey(r.first, r.last);
    const existing = db.prepare(`
      SELECT id FROM residents WHERE facility_id = ? AND first_name = ? AND last_name = ?
    `).get(facilityId, r.first, r.last);
    if (existing) {
      residentIds[key] = existing.id;
      continue;
    }
    const id = randomUUID();
    const roomLabel = `${r.room} — ${r.unit}`;
    db.prepare(`
      INSERT INTO residents (id, facility_id, first_name, last_name, room_number)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, facilityId, r.first, r.last, roomLabel);
    residentIds[key] = id;
  }

  console.log('Adding staff accounts...');
  const staffIds = {};
  for (const s of STAFF) {
    const userId = insertUser(db, s);
    insertRole(db, userId, 'staff', facilityId);
    staffIds[s.key] = userId;
  }

  console.log('Adding family accounts...');
  const familyUserIds = {};
  for (const f of FAMILIES) {
    familyUserIds[f.email] = insertUser(db, f);
    insertRole(db, familyUserIds[f.email], 'family', facilityId);
  }

  console.log('Linking family members to residents...');
  for (const f of FAMILIES) {
    const residentId = residentIds[f.resident];
    const userId = familyUserIds[f.email];
    const link = db.prepare('SELECT id FROM family_members WHERE user_id = ? AND resident_id = ?').get(userId, residentId);
    if (link) continue;
    db.prepare(`
      INSERT INTO family_members (id, user_id, resident_id, relationship, preferred_language)
      VALUES (?, ?, ?, ?, ?)
    `).run(randomUUID(), userId, residentId, f.relationship, f.preferredLanguage || 'en');
  }

  console.log('Adding updates...');
  const updateCount = db.prepare('SELECT COUNT(*) as c FROM updates WHERE facility_id = ?').get(facilityId).c;
  if (updateCount < UPDATES.length) {
    UPDATES.forEach((u, index) => {
      const residentId = residentIds[u.resident];
      const staffId = staffIds[u.staff];
      if (!residentId || !staffId) {
        console.warn(`Skipping update ${index + 1}: missing resident or staff`);
        return;
      }
      const createdAt = buildTimestamp(u.day, u.period, index);
      const dup = db.prepare(`
        SELECT id FROM updates WHERE resident_id = ? AND content = ? LIMIT 1
      `).get(residentId, u.content);
      if (dup) return;

      db.prepare(`
        INSERT INTO updates (id, facility_id, resident_id, staff_user_id, content, photo_url, created_at)
        VALUES (?, ?, ?, ?, ?, NULL, ?)
      `).run(randomUUID(), facilityId, residentId, staffId, u.content, createdAt);
    });
  }

  const { seedFamilyExtras } = require('./seedExtras');
  seedFamilyExtras({ quiet });

  console.log('Seed complete.');
  printSummary();
  return { facilityId, facilityCode: FACILITY_CODE };
}

async function main() {
  const reset = process.argv.includes('--reset');
  try {
    await runSeed({ reset });
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

function printSummary() {
  console.log('');
  console.log('Login credentials:');
  console.log('  Admin:  admin@sunrisegardens.com / Admin1234!');
  console.log('  Staff:  sarah@sunrisegardens.com / Staff1234!');
  console.log('  Family: jenny.haro@gmail.com / Family1234!');
  console.log('');
  console.log(`Facility code (registration): ${FACILITY_CODE}`);
}

if (require.main === module) {
  main();
}

module.exports = { runSeed, FACILITY_CODE };
