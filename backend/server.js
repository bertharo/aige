const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { db, randomUUID } = require('./db');
const { sendUpdateNotification } = require('./mail');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${randomUUID()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\//.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only images are allowed'));
  },
});

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin(origin, callback) {
    const allowed = [FRONTEND_URL, 'http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3001'];
    if (!origin || allowed.includes(origin) || /\.vercel\.app$/.test(origin)) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
}));
app.use(morgan('combined'));
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Please sign in again' });

  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) return res.status(403).json({ success: false, message: 'Your session expired — please sign in again' });
    req.user = payload;
    next();
  });
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'You do not have permission for this action' });
    }
    next();
  };
}

function getUserContext(userId) {
  const roleRow = db.prepare(`
    SELECT ur.role, ur.facility_id, f.name as facility_name, f.facility_code
    FROM user_roles ur
    JOIN facilities f ON f.id = ur.facility_id
    WHERE ur.user_id = ?
    LIMIT 1
  `).get(userId);

  const user = db.prepare('SELECT id, name, email, created_at FROM users WHERE id = ?').get(userId);
  if (!user || !roleRow) return null;

  return {
    ...user,
    role: roleRow.role,
    facilityId: roleRow.facility_id,
    facilityName: roleRow.facility_name,
    facilityCode: roleRow.facility_code,
  };
}

function signToken(userId, email, role, facilityId) {
  return jwt.sign({ userId, email, role, facilityId }, JWT_SECRET, { expiresIn: '7d' });
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

app.get('/', (_req, res) => {
  res.json({ message: 'Kinness API is running', version: '2.0.0' });
});

app.get('/health', (_req, res) => {
  let dbOk = false;
  try {
    db.prepare('SELECT 1').get();
    dbOk = true;
  } catch (e) {
    console.error('Health db check failed:', e);
  }
  res.json({
    status: dbOk ? 'OK' : 'DEGRADED',
    service: 'Kinness Backend',
    version: '2.0.0',
    database: dbOk ? 'sqlite' : 'error',
    timestamp: new Date().toISOString(),
  });
});

// ——— Auth ———

const validateRegistration = [
  body('name').trim().isLength({ min: 2 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('facilityCode').trim().notEmpty(),
];

app.post('/api/auth/register', validateRegistration, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Please check your information and try again', errors: errors.array() });
    }

    const { name, email, password, facilityCode } = req.body;
    const facility = db.prepare('SELECT * FROM facilities WHERE upper(facility_code) = upper(?)').get(facilityCode.trim());
    if (!facility) {
      return res.status(400).json({ success: false, message: 'Facility code not recognized — ask your care home for the correct code' });
    }

    if (db.prepare('SELECT id FROM users WHERE email = ?').get(email)) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const invite = db.prepare(`
      SELECT * FROM pending_invites WHERE lower(email) = lower(?) AND facility_id = ?
    `).get(email, facility.id);

    const role = invite ? invite.role : 'family';
    const userId = randomUUID();
    const hashed = await bcrypt.hash(password, 12);

    db.prepare('INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)').run(userId, name, email, hashed);
    db.prepare('INSERT INTO user_roles (id, user_id, role, facility_id) VALUES (?, ?, ?, ?)').run(randomUUID(), userId, role, facility.id);

    if (invite && invite.role === 'family' && invite.resident_id) {
      db.prepare(`
        INSERT INTO family_members (id, user_id, resident_id, relationship) VALUES (?, ?, ?, ?)
      `).run(randomUUID(), userId, invite.resident_id, invite.relationship || 'Family');
      db.prepare('DELETE FROM pending_invites WHERE id = ?').run(invite.id);
    }

    if (invite && invite.role === 'staff') {
      db.prepare('DELETE FROM pending_invites WHERE id = ?').run(invite.id);
    }

    const user = getUserContext(userId);
    const token = signToken(userId, email, role, facility.id);

    res.status(201).json({
      success: true,
      message: 'Welcome to Kinness!',
      user,
      token,
      redirect: role === 'admin' ? '/admin' : role === 'staff' ? '/staff/post' : '/family/feed',
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Could not create account — please try again' });
  }
});

app.post('/api/auth/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email and password' });
    }

    const { email, password } = req.body;
    const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!row || !(await bcrypt.compare(password, row.password))) {
      return res.status(401).json({ success: false, message: 'Email or password is incorrect' });
    }

    const user = getUserContext(row.id);
    if (!user) {
      return res.status(403).json({ success: false, message: 'Your account is not linked to a facility — contact your administrator' });
    }

    const token = signToken(row.id, row.email, user.role, user.facilityId);
    const redirect = user.role === 'admin' ? '/admin' : user.role === 'staff' ? '/staff/post' : '/family/feed';

    res.json({
      success: true,
      message: 'Welcome back!',
      user,
      token,
      redirect,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      message: 'Could not sign in — please try again',
      ...(process.env.NODE_ENV !== 'production' && { detail: err.message }),
    });
  }
});

app.get('/api/user/profile', authenticateToken, (req, res) => {
  const user = getUserContext(req.user.userId);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, user });
});

// ——— Staff: post update ———

app.get('/api/staff/residents', authenticateToken, requireRole('staff', 'admin'), (req, res) => {
  const facilityId = req.user.facilityId;
  const residents = db.prepare(`
    SELECT id, first_name, last_name, room_number, photo_url
    FROM residents WHERE facility_id = ?
    ORDER BY last_name, first_name
  `).all(facilityId);
  res.json({ success: true, residents });
});

app.post('/api/updates', authenticateToken, requireRole('staff', 'admin'), upload.single('photo'), async (req, res) => {
  try {
    const { residentId, content } = req.body;
    if (!residentId || !content?.trim()) {
      return res.status(400).json({ success: false, message: 'Please select a resident and write an update' });
    }

    const resident = db.prepare('SELECT * FROM residents WHERE id = ? AND facility_id = ?').get(residentId, req.user.facilityId);
    if (!resident) {
      return res.status(404).json({ success: false, message: 'Resident not found' });
    }

    const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const updateId = randomUUID();
    const staffId = req.user.userId;

    db.prepare(`
      INSERT INTO updates (id, facility_id, resident_id, staff_user_id, content, photo_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(updateId, req.user.facilityId, residentId, staffId, content.trim(), photoUrl);

    const staff = db.prepare('SELECT name FROM users WHERE id = ?').get(staffId);
    const facility = db.prepare('SELECT name FROM facilities WHERE id = ?').get(req.user.facilityId);
    const residentName = `${resident.first_name} ${resident.last_name}`;

    const familyRows = db.prepare(`
      SELECT u.email FROM family_members fm
      JOIN users u ON u.id = fm.user_id
      WHERE fm.resident_id = ?
    `).all(residentId);

    const feedUrl = `${FRONTEND_URL}/family/feed`;
    try {
      await sendUpdateNotification({
        familyEmails: familyRows.map((r) => r.email),
        residentName,
        facilityName: facility.name,
        content: content.trim(),
        feedUrl,
      });
    } catch (mailErr) {
      console.error('Email notification failed:', mailErr);
    }

    res.status(201).json({
      success: true,
      message: 'Update posted — family will be notified',
      update: {
        id: updateId,
        content: content.trim(),
        photoUrl,
        residentName,
        staffName: staff?.name,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('Post update error:', err);
    res.status(500).json({ success: false, message: "Couldn't post update — check your connection and try again" });
  }
});

// ——— Family feed ———

app.get('/api/family/feed', authenticateToken, requireRole('family'), (req, res) => {
  const userId = req.user.userId;
  const updates = db.prepare(`
    SELECT u.id, u.content, u.photo_url, u.created_at,
           r.first_name, r.last_name, r.photo_url as resident_photo_url,
           s.name as staff_name
    FROM updates u
    JOIN residents r ON r.id = u.resident_id
    JOIN users s ON s.id = u.staff_user_id
    JOIN family_members fm ON fm.resident_id = u.resident_id AND fm.user_id = ?
    ORDER BY u.created_at DESC
    LIMIT 100
  `).all(userId);

  const readSet = new Set(
    db.prepare('SELECT update_id FROM feed_reads WHERE user_id = ?').all(userId).map((r) => r.update_id)
  );

  const feed = updates.map((u) => ({
    id: u.id,
    content: u.content,
    photoUrl: u.photo_url,
    residentName: `${u.first_name} ${u.last_name}`,
    residentPhotoUrl: u.resident_photo_url,
    staffName: u.staff_name,
    timeAgo: timeAgo(u.created_at),
    createdAt: u.created_at,
    unread: !readSet.has(u.id),
  }));

  res.json({ success: true, feed });
});

app.post('/api/family/feed/read', authenticateToken, requireRole('family'), (req, res) => {
  const { updateIds } = req.body;
  if (!Array.isArray(updateIds)) {
    return res.status(400).json({ success: false, message: 'Invalid request' });
  }
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO feed_reads (user_id, update_id) VALUES (?, ?)
  `);
  const markAll = db.transaction((ids) => {
    for (const id of ids) stmt.run(req.user.userId, id);
  });
  markAll(updateIds);
  res.json({ success: true });
});

// ——— Admin ———

app.get('/api/admin/dashboard', authenticateToken, requireRole('admin'), (req, res) => {
  const facilityId = req.user.facilityId;
  const facility = db.prepare('SELECT * FROM facilities WHERE id = ?').get(facilityId);
  const residentCount = db.prepare('SELECT COUNT(*) as c FROM residents WHERE facility_id = ?').get(facilityId).c;
  const familyCount = db.prepare(`
    SELECT COUNT(DISTINCT fm.user_id) as c FROM family_members fm
    JOIN residents r ON r.id = fm.resident_id WHERE r.facility_id = ?
  `).get(facilityId).c;
  const today = new Date().toISOString().slice(0, 10);
  const updatesToday = db.prepare(`
    SELECT COUNT(*) as c FROM updates WHERE facility_id = ? AND date(created_at) = date(?)
  `).get(facilityId, today).c;

  res.json({
    success: true,
    dashboard: {
      facilityName: facility.name,
      facilityCode: facility.facility_code,
      residentCount,
      familyCount,
      updatesToday,
    },
  });
});

app.get('/api/admin/residents', authenticateToken, requireRole('admin'), (req, res) => {
  const residents = db.prepare(`
    SELECT * FROM residents WHERE facility_id = ? ORDER BY last_name, first_name
  `).all(req.user.facilityId);
  res.json({ success: true, residents });
});

app.post('/api/admin/residents', authenticateToken, requireRole('admin'), upload.single('photo'), (req, res) => {
  const { firstName, lastName, roomNumber } = req.body;
  if (!firstName?.trim() || !lastName?.trim()) {
    return res.status(400).json({ success: false, message: 'First and last name are required' });
  }
  const id = randomUUID();
  const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;
  db.prepare(`
    INSERT INTO residents (id, facility_id, first_name, last_name, room_number, photo_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, req.user.facilityId, firstName.trim(), lastName.trim(), roomNumber || null, photoUrl);
  const resident = db.prepare('SELECT * FROM residents WHERE id = ?').get(id);
  res.status(201).json({ success: true, resident });
});

app.put('/api/admin/residents/:id', authenticateToken, requireRole('admin'), upload.single('photo'), (req, res) => {
  const existing = db.prepare('SELECT * FROM residents WHERE id = ? AND facility_id = ?').get(req.params.id, req.user.facilityId);
  if (!existing) return res.status(404).json({ success: false, message: 'Resident not found' });

  const { firstName, lastName, roomNumber } = req.body;
  const photoUrl = req.file ? `/uploads/${req.file.filename}` : existing.photo_url;
  db.prepare(`
    UPDATE residents SET first_name = ?, last_name = ?, room_number = ?, photo_url = ? WHERE id = ?
  `).run(
    firstName?.trim() || existing.first_name,
    lastName?.trim() || existing.last_name,
    roomNumber ?? existing.room_number,
    photoUrl,
    req.params.id
  );
  res.json({ success: true, resident: db.prepare('SELECT * FROM residents WHERE id = ?').get(req.params.id) });
});

app.delete('/api/admin/residents/:id', authenticateToken, requireRole('admin'), (req, res) => {
  const existing = db.prepare('SELECT id FROM residents WHERE id = ? AND facility_id = ?').get(req.params.id, req.user.facilityId);
  if (!existing) return res.status(404).json({ success: false, message: 'Resident not found' });
  db.prepare('DELETE FROM residents WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: 'Resident removed' });
});

app.get('/api/admin/family-links', authenticateToken, requireRole('admin'), (req, res) => {
  const residents = db.prepare(`
    SELECT r.id, r.first_name, r.last_name, r.room_number, r.photo_url
    FROM residents r WHERE r.facility_id = ?
    ORDER BY r.last_name
  `).all(req.user.facilityId);

  const links = residents.map((r) => {
    const members = db.prepare(`
      SELECT fm.id, fm.relationship, u.name, u.email
      FROM family_members fm JOIN users u ON u.id = fm.user_id
      WHERE fm.resident_id = ?
    `).all(r.id);
    const pending = db.prepare(`
      SELECT email, relationship FROM pending_invites
      WHERE resident_id = ? AND role = 'family'
    `).all(r.id);
    return { ...r, familyMembers: members, pendingInvites: pending };
  });

  res.json({ success: true, links });
});

app.post('/api/admin/invite-family', authenticateToken, requireRole('admin'), (req, res) => {
  const { email, residentId, relationship } = req.body;
  if (!email || !residentId) {
    return res.status(400).json({ success: false, message: 'Email and resident are required' });
  }
  const resident = db.prepare('SELECT id FROM residents WHERE id = ? AND facility_id = ?').get(residentId, req.user.facilityId);
  if (!resident) return res.status(404).json({ success: false, message: 'Resident not found' });

  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existingUser) {
    db.prepare(`
      INSERT OR IGNORE INTO family_members (id, user_id, resident_id, relationship) VALUES (?, ?, ?, ?)
    `).run(randomUUID(), existingUser.id, residentId, relationship || 'Family');
    return res.json({ success: true, message: 'Family member linked to resident' });
  }

  db.prepare(`
    INSERT INTO pending_invites (id, email, facility_id, resident_id, role, relationship)
    VALUES (?, ?, ?, ?, 'family', ?)
  `).run(randomUUID(), email.toLowerCase(), req.user.facilityId, residentId, relationship || 'Family');

  res.json({
    success: true,
    message: `Invite ready — ${email} can register with your facility code`,
  });
});

app.get('/api/admin/staff', authenticateToken, requireRole('admin'), (req, res) => {
  const staff = db.prepare(`
    SELECT u.id, u.name, u.email, u.created_at
    FROM users u
    JOIN user_roles ur ON ur.user_id = u.id
    WHERE ur.facility_id = ? AND ur.role = 'staff'
    ORDER BY u.name
  `).all(req.user.facilityId);

  const pending = db.prepare(`
    SELECT email, created_at FROM pending_invites
    WHERE facility_id = ? AND role = 'staff' AND resident_id IS NULL
  `).all(req.user.facilityId);

  res.json({ success: true, staff, pendingInvites: pending });
});

app.post('/api/admin/invite-staff', authenticateToken, requireRole('admin'), (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

  const existing = db.prepare('SELECT u.id FROM users u JOIN user_roles ur ON ur.user_id = u.id WHERE u.email = ? AND ur.role = ? AND ur.facility_id = ?')
    .get(email, 'staff', req.user.facilityId);
  if (existing) {
    return res.status(400).json({ success: false, message: 'This person is already on staff' });
  }

  db.prepare(`
    INSERT INTO pending_invites (id, email, facility_id, role) VALUES (?, ?, ?, 'staff')
  `).run(randomUUID(), email.toLowerCase(), req.user.facilityId);

  res.json({ success: true, message: `Invite ready — ${email} can register with your facility code as staff` });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ success: false, message: 'Something went wrong — please try again' });
});

app.use('*', (_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Kinness API running on port ${PORT}`);
});

module.exports = app;
