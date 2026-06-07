const { getDb, randomUUID } = require('./db');

const FACILITY_CODE = 'SGSL2024';

const ACTIVITY_SCHEDULES = [
  { title: 'Morning Stretch', day: 1, time: '9:00 AM', location: 'Activity Room' },
  { title: 'Physical Therapy', day: 1, time: '10:00 AM', location: 'Room 4B' },
  { title: 'Afternoon Reading', day: 1, time: '2:00 PM', location: 'Library' },
  { title: 'Garden Walk', day: 2, time: '10:30 AM', location: 'Garden' },
  { title: 'Bingo', day: 2, time: '2:00 PM', location: 'Main Hall' },
  { title: 'Music Session', day: 3, time: '11:00 AM', location: 'Sunroom' },
  { title: 'Physical Therapy', day: 4, time: '10:00 AM', location: 'Room 4B' },
  { title: 'Movie Night', day: 5, time: '6:00 PM', location: 'Main Hall' },
  { title: 'Morning Coffee Social', day: 6, time: '9:30 AM', location: 'Patio' },
  { title: 'Chapel / Reflection', day: 0, time: '10:00 AM', location: 'Chapel Room' },
];

const ROSA_PHOTO_POSTS = [
  {
    content:
      'Rosa was up early this morning and wanted her coffee on the patio. She sat outside for almost an hour, said the air reminded her of mornings back in Guadalajara.',
    staffEmail: 'sarah@sunrisegardens.com',
    daysAgo: 1,
    url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80',
  },
  {
    content:
      'Took Rosa on a slow walk through the garden this afternoon. She stopped at the rose bushes for a long time and told me about the garden she kept for thirty years back home. She knows every flower by name.',
    staffEmail: 'david@sunrisegardens.com',
    daysAgo: 2,
    url: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=800&q=80',
  },
  {
    content:
      'Rosa finished her whole lunch today and asked for seconds of the soup. She saved her flan for later — said Jenny is coming Sunday and she wants to share it with her.',
    staffEmail: 'aisha@sunrisegardens.com',
    daysAgo: 3,
    url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80',
  },
  {
    content:
      'Rosa worked through her full PT session this morning without stopping once. The therapist said her balance has improved a lot this month. Rosa said she is determined to dance at Jenny\'s wedding someday.',
    staffEmail: 'sarah@sunrisegardens.com',
    daysAgo: 4,
    url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
  },
  {
    content:
      'Found Rosa in the sunroom this afternoon with her book. She is reading a novel in Spanish that her sister sent from Mexico. She did not want to stop — we had to remind her about dinner.',
    staffEmail: 'david@sunrisegardens.com',
    daysAgo: 5,
    url: 'https://images.unsplash.com/photo-1512236258305-32fb110fdb01?w=800&q=80',
  },
  {
    content:
      'Music Wednesday is Rosa\'s favorite day. She knew every word of every Spanish song and was singing loud enough that people in the hallway stopped to listen. The whole room was smiling.',
    staffEmail: 'aisha@sunrisegardens.com',
    daysAgo: 6,
    url: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800&q=80',
  },
  {
    content:
      'Jenny came by Sunday afternoon and they sat together on the patio for almost two hours. Rosa was glowing the whole visit. When Jenny left Rosa said — that is the best medicine there is.',
    staffEmail: 'sarah@sunrisegardens.com',
    daysAgo: 9,
    url: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=800&q=80',
  },
  {
    content:
      'Rosa joined the morning stretch group for the second week in a row. She jokes that she is training for a marathon. The group loves having her — she keeps everyone laughing.',
    staffEmail: 'aisha@sunrisegardens.com',
    daysAgo: 12,
    url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
  },
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
        'Rosa walked into PT calling herself "la atleta del jardín." She balanced longer than last week, then spent the afternoon in the library with her Spanish novel — we had to remind her twice that dinner was ready.',
    },
    {
      off: -1,
      breakfast: 'ate_well',
      lunch: 'partial',
      dinner: 'ate_well',
      hydration: 'fair',
      mood_morning: 'okay',
      mood_evening: 'good',
      activities: ['Music Session', 'Garden Walk'],
      staff_note:
        'Rosa led the whole room in a ranchera at Music Session — even the shy residents were clapping along. Afterward we did a slow garden walk and she named every rose like old friends from Guadalajara.',
    },
    {
      off: -2,
      breakfast: 'partial',
      lunch: 'ate_well',
      dinner: 'ate_well',
      hydration: 'good',
      mood_morning: 'good',
      mood_evening: 'good',
      activities: ['Morning Stretch', 'Morning Coffee Social'],
      staff_note:
        'Rosa told the stretch group she is training for a marathon and had everyone laughing. She had her coffee on the patio and waved at every person who walked by like she was hosting at home.',
    },
    {
      off: -3,
      breakfast: 'ate_well',
      lunch: 'ate_well',
      dinner: 'ate_well',
      hydration: 'good',
      mood_morning: 'good',
      mood_evening: 'okay',
      activities: ['Garden Walk', 'Music Session'],
      staff_note:
        'Rosa spent twenty minutes at the rose bushes telling me which ones Jenny would love. She hummed all through lunch and said the soup today tasted like her mother\'s recipe.',
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
      staff_note:
        'Rosa was quiet this morning — said her knees were bothering her and she wanted to rest. She perked up after lunch when we put on Spanish guitar in the common room. She asked us to save her a seat by the window tomorrow.',
    },
    {
      off: -5,
      breakfast: 'ate_well',
      lunch: 'ate_well',
      dinner: 'partial',
      hydration: 'fair',
      mood_morning: 'okay',
      mood_evening: 'good',
      activities: ['Morning Coffee Social', 'Afternoon Reading'],
      staff_note:
        'Rosa held court on the patio with her coffee, telling stories about the mercado in Guadalajara. She read in the sunroom until the light faded and said the book her sister sent is the best one she has had in years.',
    },
    {
      off: -6,
      breakfast: 'ate_well',
      lunch: 'ate_well',
      dinner: 'ate_well',
      hydration: 'good',
      mood_morning: 'good',
      mood_evening: 'good',
      activities: ['Chapel / Reflection', 'Garden Walk'],
      staff_note:
        'Rosa sang softly during chapel — an old hymn her grandmother taught her. Afterward she wanted a slow walk through the garden and picked a small bouquet she said she would press for Jenny.',
    },
  ];

  for (const t of templates) {
    const recordDate = formatDate(addDays(today, t.off));
    const exists = db.prepare(
      'SELECT id FROM daily_records WHERE resident_id = ? AND record_date = ?'
    ).get(residentId, recordDate);

    const payload = [
      t.breakfast,
      t.lunch,
      t.dinner,
      t.hydration,
      t.mood_morning,
      t.mood_evening,
      JSON.stringify(t.activities),
      t.staff_note,
      staffId,
      residentId,
      recordDate,
    ];

    if (exists) {
      db.prepare(`
        UPDATE daily_records SET
          breakfast = ?, lunch = ?, dinner = ?, hydration = ?,
          mood_morning = ?, mood_evening = ?, activities_attended = ?,
          staff_note = ?, logged_by = ?, updated_at = datetime('now')
        WHERE resident_id = ? AND record_date = ?
      `).run(...payload);
      continue;
    }

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
      visitor_name: 'Jenny Haro',
      status: 'confirmed',
      notes: 'Bringing photos from Guadalajara and Rosa\'s favorite pan dulce',
    },
    {
      visit_date: formatDate(lastTuesday),
      visit_time: 'afternoon',
      visitor_name: 'Jenny Haro',
      status: 'confirmed',
      notes: 'Sat on the patio — Rosa talked about her garden back home the whole visit',
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

function seedPhotoUpdates(db, facilityId, residentId, staffByEmail) {
  db.prepare(`
    DELETE FROM updates
    WHERE resident_id = ? AND photo_url IS NOT NULL AND photo_url != ''
  `).run(residentId);

  for (const p of ROSA_PHOTO_POSTS) {
    const staffId = staffByEmail[p.staffEmail];
    if (!staffId) continue;

    const d = new Date();
    d.setDate(d.getDate() - p.daysAgo);
    d.setHours(14, 30, 0, 0);
    const createdAt = d.toISOString().slice(0, 19).replace('T', ' ');

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

  const rosa = db.prepare(`
    SELECT id FROM residents WHERE facility_id = ? AND first_name = ? AND last_name = ?
  `).get(facility.id, 'Rosa', 'Haro');
  if (!rosa) return false;

  const jenny = db.prepare(
    'SELECT id FROM users WHERE lower(email) = ?'
  ).get('jenny.haro@gmail.com');

  const sarah = db.prepare('SELECT id FROM users WHERE lower(email) = ?').get('sarah@sunrisegardens.com');
  const david = db.prepare('SELECT id FROM users WHERE lower(email) = ?').get('david@sunrisegardens.com');
  const aisha = db.prepare('SELECT id FROM users WHERE lower(email) = ?').get('aisha@sunrisegardens.com');
  const staffByEmail = {
    'sarah@sunrisegardens.com': sarah?.id,
    'david@sunrisegardens.com': david?.id,
    'aisha@sunrisegardens.com': aisha?.id,
  };
  const defaultStaff = sarah?.id || david?.id || aisha?.id;

  seedActivitySchedules(db, facility.id);
  seedDailyRecords(db, rosa.id, defaultStaff);
  if (jenny) seedFamilyVisits(db, rosa.id, jenny.id);
  seedPhotoUpdates(db, facility.id, rosa.id, staffByEmail);

  if (!quiet) console.log('Family extras seeded (schedules, daily records, visits, photos)');
  return true;
}

module.exports = { seedFamilyExtras };
