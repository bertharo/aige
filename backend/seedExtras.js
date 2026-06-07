const { getDb, randomUUID } = require('./db');

const FACILITY_CODE = 'SGSL2024';

const ACTIVITY_SCHEDULES = [
  { title: 'Physical Therapy', day: 1, time: '10:00 AM', location: 'Room 4B' },
  { title: 'Afternoon Reading', day: 1, time: '2:00 PM', location: 'Library' },
  { title: 'Bingo', day: 2, time: '2:00 PM', location: 'Main Hall' },
  { title: 'Music Session', day: 3, time: '11:00 AM', location: 'Sunroom' },
  { title: 'Physical Therapy', day: 4, time: '10:00 AM', location: 'Room 4B' },
  { title: 'Movie Night', day: 5, time: '6:00 PM', location: 'Main Hall' },
  { title: 'Morning Coffee Social', day: 6, time: '9:30 AM', location: 'Patio' },
  { title: 'Chapel / Reflection', day: 0, time: '10:00 AM', location: 'Chapel Room' },
];

function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDays(base, n) {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}

function seedActivitySchedules(db, facilityId) {
  const count = db.prepare('SELECT COUNT(*) as c FROM activity_schedules WHERE facility_id = ?').get(facilityId).c;
  if (count > 0) return;

  for (const row of ACTIVITY_SCHEDULES) {
    db.prepare(`
      INSERT INTO activity_schedules (id, facility_id, title, day_of_week, start_time, location)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(randomUUID(), facilityId, row.title, row.day, row.time, row.location);
  }
}

function seedDailyRecords(db, residentId, staffId) {
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  const templates = [
    {
      off: 0,
      breakfast: 'ate_well',
      lunch: 'ate_well',
      dinner: 'partial',
      hydration: 'good',
      mood_morning: 'good',
      mood_evening: 'tired',
      activities: ['Physical Therapy', 'Afternoon Reading'],
      staff_note:
        'Mary did her physical therapy exercises this morning with no complaints. The therapist said she is making good progress. She was tired afterward but in good spirits.',
    },
    {
      off: -1,
      breakfast: 'ate_well',
      lunch: 'partial',
      dinner: 'ate_well',
      hydration: 'fair',
      mood_morning: 'okay',
      mood_evening: 'good',
      activities: ['Bingo'],
      staff_note: 'Mary enjoyed bingo and chatted with friends. Ate most of lunch.',
    },
    {
      off: -2,
      breakfast: 'partial',
      lunch: 'ate_well',
      dinner: 'ate_well',
      hydration: 'good',
      mood_morning: 'good',
      mood_evening: 'good',
      activities: ['Music Session', 'Afternoon Reading'],
      staff_note: 'Mary sang along during music session. Good appetite at lunch and dinner.',
    },
    {
      off: -3,
      breakfast: 'ate_well',
      lunch: 'ate_well',
      dinner: 'ate_well',
      hydration: 'good',
      mood_morning: 'good',
      mood_evening: 'okay',
      activities: ['Physical Therapy'],
      staff_note: 'Steady day. Mary was a little quiet in the evening.',
    },
    {
      off: -4,
      breakfast: 'skipped',
      lunch: 'partial',
      dinner: 'ate_well',
      hydration: 'low',
      mood_morning: 'low',
      mood_evening: 'okay',
      activities: [],
      staff_note: 'Mary skipped breakfast but picked up after lunch. We encouraged fluids.',
    },
    {
      off: -5,
      breakfast: 'ate_well',
      lunch: 'ate_well',
      dinner: 'partial',
      hydration: 'fair',
      mood_morning: 'okay',
      mood_evening: 'good',
      activities: ['Morning Coffee Social'],
      staff_note: 'Enjoyed coffee on the patio with other residents.',
    },
    {
      off: -6,
      breakfast: 'ate_well',
      lunch: 'ate_well',
      dinner: 'ate_well',
      hydration: 'good',
      mood_morning: 'good',
      mood_evening: 'good',
      activities: ['Chapel / Reflection', 'Afternoon Reading'],
      staff_note: 'Peaceful Sunday. Mary attended chapel and rested well.',
    },
  ];

  for (const t of templates) {
    const recordDate = formatDate(addDays(today, t.off));
    const exists = db.prepare(
      'SELECT id FROM daily_records WHERE resident_id = ? AND record_date = ?'
    ).get(residentId, recordDate);
    if (exists) continue;

    db.prepare(`
      INSERT INTO daily_records (
        id, resident_id, record_date, breakfast, lunch, dinner, hydration,
        mood_morning, mood_evening, activities_attended, staff_note, logged_by, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(
      randomUUID(),
      residentId,
      recordDate,
      t.breakfast,
      t.lunch,
      t.dinner,
      t.hydration,
      t.mood_morning,
      t.mood_evening,
      JSON.stringify(t.activities),
      t.staff_note,
      staffId
    );
  }
}

function seedFamilyVisits(db, residentId, jennyUserId) {
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  const thisSaturday = new Date(today);
  const dow = thisSaturday.getDay();
  const daysUntilSat = (6 - dow + 7) % 7 || 7;
  thisSaturday.setDate(thisSaturday.getDate() + daysUntilSat);

  const lastTuesday = new Date(today);
  const daysSinceTue = (dow + 7 - 2) % 7;
  lastTuesday.setDate(lastTuesday.getDate() - (daysSinceTue === 0 ? 7 : daysSinceTue));

  const visits = [
    {
      visit_date: formatDate(thisSaturday),
      visit_time: 'afternoon',
      visitor_name: 'Jenny Chen',
      status: 'confirmed',
      notes: 'Bringing photos from home',
    },
    {
      visit_date: formatDate(lastTuesday),
      visit_time: 'afternoon',
      visitor_name: 'Jenny Chen',
      status: 'confirmed',
      notes: '',
    },
  ];

  for (const v of visits) {
    const dup = db.prepare(`
      SELECT id FROM family_visits
      WHERE resident_id = ? AND family_user_id = ? AND visit_date = ? AND visit_time = ?
    `).get(residentId, jennyUserId, v.visit_date, v.visit_time);
    if (dup) continue;

    db.prepare(`
      INSERT INTO family_visits (
        id, resident_id, family_user_id, visit_date, visit_time,
        visitor_name, notes, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(
      randomUUID(),
      residentId,
      jennyUserId,
      v.visit_date,
      v.visit_time,
      v.visitor_name,
      v.notes,
      v.status
    );
  }
}

function seedPhotoUpdates(db, facilityId, residentId, staffByName) {
  const photos = [
    {
      content:
        'Mary enjoying her morning coffee on the patio. She was in great spirits and chatted with a few neighbors.',
      staff: 'Sarah Reyes',
      daysAgo: 1,
      url: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=800&q=80',
    },
    {
      content:
        'Mary spent some time in the garden this afternoon. She stopped to smell the roses and said it reminded her of her backyard growing up.',
      staff: 'David Park',
      daysAgo: 2,
      url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&q=80',
    },
    {
      content:
        'Mary finished her whole lunch today and even asked for seconds of the soup. A really good day.',
      staff: 'Aisha Thompson',
      daysAgo: 3,
      url: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=800&q=80',
    },
    {
      content:
        'Mary worked hard in physical therapy this morning. The therapist said she is making real progress.',
      staff: 'David Park',
      daysAgo: 0,
      url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
    },
  ];

  db.prepare(`
    DELETE FROM updates
    WHERE resident_id = ? AND photo_url LIKE '%picsum.photos%'
  `).run(residentId);

  for (const p of photos) {
    const staffId = staffByName[p.staff];
    if (!staffId) continue;

    const dup = db.prepare(
      'SELECT id FROM updates WHERE resident_id = ? AND content = ? LIMIT 1'
    ).get(residentId, p.content);

    const d = new Date();
    d.setDate(d.getDate() - p.daysAgo);
    d.setHours(14, 30, 0, 0);
    const createdAt = d.toISOString().slice(0, 19).replace('T', ' ');

    if (dup) {
      db.prepare(`
        UPDATE updates SET photo_url = ?, staff_user_id = ?, created_at = ?
        WHERE id = ?
      `).run(p.url, staffId, createdAt, dup.id);
      continue;
    }

    db.prepare(`
      INSERT INTO updates (id, facility_id, resident_id, staff_user_id, content, photo_url, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      randomUUID(),
      facilityId,
      residentId,
      staffId,
      p.content,
      p.url,
      createdAt
    );
  }
}

function seedFamilyExtras({ quiet = false } = {}) {
  const db = getDb();
  const facility = db.prepare(
    'SELECT id FROM facilities WHERE upper(facility_code) = upper(?)'
  ).get(FACILITY_CODE);
  if (!facility) return false;

  const mary = db.prepare(`
    SELECT id FROM residents WHERE facility_id = ? AND first_name = ? AND last_name = ?
  `).get(facility.id, 'Mary', 'Chen');
  if (!mary) return false;

  const jenny = db.prepare(
    'SELECT id FROM users WHERE lower(email) = ?'
  ).get('jenny.chen@gmail.com');

  const sarah = db.prepare('SELECT id, name FROM users WHERE lower(email) = ?').get('sarah@sunrisegardens.com');
  const david = db.prepare('SELECT id, name FROM users WHERE lower(email) = ?').get('david@sunrisegardens.com');
  const aisha = db.prepare('SELECT id, name FROM users WHERE lower(email) = ?').get('aisha@sunrisegardens.com');
  const staffByName = {
    'Sarah Reyes': sarah?.id,
    'David Park': david?.id,
    'Aisha Thompson': aisha?.id,
  };
  const defaultStaff = sarah?.id || david?.id || aisha?.id;

  seedActivitySchedules(db, facility.id);
  seedDailyRecords(db, mary.id, defaultStaff);
  if (jenny) seedFamilyVisits(db, mary.id, jenny.id);
  seedPhotoUpdates(db, facility.id, mary.id, staffByName);

  if (!quiet) console.log('Family extras seeded (schedules, daily records, visits, photos)');
  return true;
}

module.exports = { seedFamilyExtras };
