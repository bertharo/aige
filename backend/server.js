const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

console.log('Loaded server.js from', __filename);

// Initialize Prisma client with error handling
let prisma;
try {
  const { PrismaClient } = require('@prisma/client');
  prisma = new PrismaClient();
  console.log('Prisma client initialized successfully');
} catch (error) {
  console.error('Failed to initialize Prisma client:', error.message);
  console.log('Running without database functionality');
  prisma = null;
}

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Unique log line to confirm deployment
console.log('🚦 TEST ROUTE REGISTERED: /api/test - Deployment check at', new Date().toISOString());

// Simple test route
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Test route is working! 🎉',
    timestamp: new Date().toISOString()
  });
});

// Cloudinary test route
app.get('/api/test/cloudinary', async (req, res) => {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return res.json({
        success: false,
        message: 'Cloudinary not configured - missing environment variables',
        configured: false
      });
    }
    
    // Test Cloudinary connection by getting account info
    const result = await cloudinary.api.ping();
    res.json({
      success: true,
      message: 'Cloudinary connection successful! ☁️',
      configured: true,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.json({
      success: false,
      message: 'Cloudinary connection failed',
      error: error.message,
      configured: true,
      timestamp: new Date().toISOString()
    });
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    'https://aige.vercel.app', // deployed frontend
    process.env.FRONTEND_URL || 'https://aige-frontend.vercel.app',
    'http://localhost:3000',
    'http://localhost:5000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('combined'));
app.use(express.json());
// app.use(express.static('public'));

// In-memory storage (replace with database in production)
const users = [];

// Validation middleware
const validateRegistration = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Middleware for role-based access
function requireRole(roles) {
  return (req, res, next) => {
    console.log('requireRole called for', req.path, 'roles:', roles);
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Access token required' });

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
      if (err) return res.status(403).json({ success: false, message: 'Invalid or expired token' });
      if (!roles.includes(user.role)) return res.status(403).json({ success: false, message: 'Insufficient permissions' });
      req.user = user;
      next();
    });
  };
}

// Helper function to check if a user is a family member
async function isFamilyMember(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    return user && user.role === 'family';
  } catch (error) {
    console.error('Error checking if user is family member:', error);
    return false;
  }
}

// Cloudinary storage configuration
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'elderly-care',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }]
  }
});

// Multer setup for image uploads
const upload = multer({ storage: cloudinaryStorage });

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'AIGE API is running',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'AIGE Backend API',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime()
  });
});

// Database health check endpoint
app.get('/health/db', async (req, res) => {
  if (!prisma) {
    return res.status(500).json({
      status: 'ERROR',
      database: 'Prisma client not available',
      error: 'Prisma client was not initialized properly',
      timestamp: new Date().toISOString()
    });
  }

  try {
    await prisma.$connect();
    const userCount = await prisma.user.count();
    res.json({
      status: 'OK',
      database: 'Connected',
      userCount: userCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database health check failed:', error);
    res.status(500).json({
      status: 'ERROR',
      database: 'Connection failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Register endpoint
app.post('/api/auth/register', validateRegistration, async (req, res) => {
  if (!prisma) {
    return res.status(500).json({
      success: false,
      message: 'Database not available. Please try again later.'
    });
  }

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password, role } = req.body;
    const userRole = role && ['facility_staff', 'family', 'system_admin'].includes(role)
      ? role
      : 'family'; // Default to 'family' if not provided or invalid

    console.log('Registration attempt for:', email);
    console.log('Database URL (first 20 chars):', process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 20) + '...' : 'NOT SET');

    // Test database connection
    try {
      await prisma.$connect();
      console.log('Database connection successful');
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Database connection failed'
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    console.log('Creating user in database...');
    // Create user in Postgres via Prisma
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: userRole
      }
    });

    console.log('User created successfully:', newUser.id);

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to AIGE.',
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: 'Internal server error: ' + error.message
    });
  }
});

// Login endpoint
app.post('/api/auth/login', validateLogin, async (req, res) => {
  if (!prisma) {
    return res.status(500).json({
      success: false,
      message: 'Database not available. Please try again later.'
    });
  }

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user in Postgres via Prisma
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login successful! Welcome back to AIGE.',
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get current user profile
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });
    
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json({
    success: true,
    user: userWithoutPassword
  });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Update current user profile
app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    
    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Validate current password if changing password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Current password required' });
      }
      
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }
    }
    
    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
    }
    
    // Update user
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (newPassword) updateData.password = await bcrypt.hash(newPassword, 10);
    
    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: updateData
    });
    
    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json({ success: true, user: userWithoutPassword });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Delete current user account
app.delete('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ success: false, message: 'Password required for account deletion' });
    }
    
    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Validate password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ success: false, message: 'Password is incorrect' });
    }
    
    // Delete user
    await prisma.user.delete({
      where: { id: req.user.userId }
    });
    
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get all users (admin and staff can see family members)
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const currentUser = req.user;
    
    let users;
    if (currentUser.role === 'system_admin') {
      // Admins can see all users
      users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      });
    } else if (currentUser.role === 'facility_staff') {
      // Staff can only see family members
      users = await prisma.user.findMany({
        where: { role: 'family' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      });
    } else {
      // Family members can only see themselves
      users = await prisma.user.findMany({
        where: { id: currentUser.userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      });
    }
    
    res.json({ success: true, users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Update user (admin, staff, or self)
app.put('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const { name, email, role, newPassword, currentPassword } = req.body;
    const targetUserId = req.params.id;
    const currentUser = req.user;
    
    // Permission checks:
    // 1. Users can always edit their own profile
    // 2. System admins can edit any user
    // 3. Facility staff can edit family members
    const canEdit = 
      targetUserId === currentUser.userId || 
      currentUser.role === 'system_admin' ||
      (currentUser.role === 'facility_staff' && await isFamilyMember(targetUserId));
    
    if (!canEdit) {
      return res.status(403).json({ 
        success: false, 
        message: 'You do not have permission to edit this user' 
      });
    }
    
    // Get target user
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId }
    });
    
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Role restrictions:
    // - Only system admins can change roles
    // - Only system admins can change passwords for other users
    // - Users can change their own password with current password
    if (role && currentUser.role !== 'system_admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only system admins can change user roles' 
      });
    }
    
    if (newPassword) {
      if (targetUserId === currentUser.userId) {
        // User changing their own password
        if (!currentPassword) {
          return res.status(400).json({ 
            success: false, 
            message: 'Current password required to change password' 
          });
        }
        
        const isValidPassword = await bcrypt.compare(currentPassword, targetUser.password);
        if (!isValidPassword) {
          return res.status(400).json({ 
            success: false, 
            message: 'Current password is incorrect' 
          });
        }
      } else if (currentUser.role !== 'system_admin') {
        // Non-admin trying to change someone else's password
        return res.status(403).json({ 
          success: false, 
          message: 'Only system admins can change other users\' passwords' 
        });
      }
    }
    
    // Check if email is already taken by another user
    if (email && email !== targetUser.email) {
      const existingUser = await prisma.user.findUnique({ 
        where: { 
          email,
          NOT: { id: targetUserId }
        }
      });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
    }
    
    // Update user
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role && currentUser.role === 'system_admin') updateData.role = role;
    if (newPassword) updateData.password = await bcrypt.hash(newPassword, 10);
    
    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Delete user (admin, staff, or self)
app.delete('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUser = req.user;
    
    // Permission checks:
    // 1. Users can delete their own account
    // 2. System admins can delete any user
    // 3. Facility staff can delete family members
    const canDelete = 
      targetUserId === currentUser.userId || 
      currentUser.role === 'system_admin' ||
      (currentUser.role === 'facility_staff' && await isFamilyMember(targetUserId));
    
    if (!canDelete) {
      return res.status(403).json({ 
        success: false, 
        message: 'You do not have permission to delete this user' 
      });
    }
    
    // Get target user
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId }
    });
    
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Additional restrictions:
    // - Users must provide password to delete their own account
    // - Staff cannot delete other staff or admins
    if (targetUserId === currentUser.userId) {
      const { password } = req.body;
      if (!password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Password required to delete your own account' 
        });
      }
      
      const isValidPassword = await bcrypt.compare(password, targetUser.password);
      if (!isValidPassword) {
        return res.status(400).json({ 
          success: false, 
          message: 'Password is incorrect' 
        });
      }
    } else if (currentUser.role === 'facility_staff' && targetUser.role !== 'family') {
      return res.status(403).json({ 
        success: false, 
        message: 'Staff can only delete family member accounts' 
      });
    }
    
    await prisma.user.delete({
      where: { id: targetUserId }
    });
    
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Resident Management Endpoints
// Create Resident (family/system_admin)
app.post('/api/residents', requireRole(['family', 'system_admin']), async (req, res) => {
  try {
    const { name, photo, room, carePlan, medicalInfo, facilityId, startDate, endDate } = req.body;
    const data = {
        name,
        photo,
        room,
        carePlan,
        medicalInfo,
        admittedAt: new Date()
    };
    if (req.user.role === 'family') {
      data.family = { connect: { id: req.user.userId } };
    }
    const resident = await prisma.resident.create({ data });
    let assignment = null;
    if (facilityId && startDate) {
      assignment = await prisma.residentFacilityAssignment.create({
        data: {
          residentId: resident.id,
          facilityId,
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : null
        }
      });
    }
    res.status(201).json({ success: true, resident, assignment });
  } catch (error) {
    console.error('Create resident error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get all Residents (staff/admin)
app.get('/api/residents', requireRole(['facility_staff', 'system_admin']), async (req, res) => {
  try {
    const residents = await prisma.resident.findMany();
    res.json({ success: true, residents });
  } catch (error) {
    console.error('Get residents error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get Resident by ID (staff/admin/family)
app.get('/api/residents/:id', requireRole(['facility_staff', 'system_admin', 'family']), async (req, res) => {
  try {
    if (req.user.role === 'family') {
      // Only allow if this resident is associated with the family user
      const resident = await prisma.resident.findUnique({
        where: { id: req.params.id },
        include: { family: { where: { id: req.user.userId } } }
      });
      if (!resident || resident.family.length === 0) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      return res.json({ success: true, resident });
    }
    // Staff/admin: allow access
    const resident = await prisma.resident.findUnique({ where: { id: req.params.id } });
    if (!resident) return res.status(404).json({ success: false, message: 'Resident not found' });
    res.json({ success: true, resident });
  } catch (error) {
    console.error('Get resident error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Update Resident (staff/admin)
app.put('/api/residents/:id', requireRole(['facility_staff', 'system_admin']), async (req, res) => {
  try {
    const { name, photo, room, carePlan, medicalInfo, dischargedAt } = req.body;
    const resident = await prisma.resident.update({
      where: { id: req.params.id },
      data: { name, photo, room, carePlan, medicalInfo, dischargedAt }
    });
    res.json({ success: true, resident });
  } catch (error) {
    console.error('Update resident error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Delete/Discharge Resident (admin only)
app.delete('/api/residents/:id', requireRole(['system_admin']), async (req, res) => {
  try {
    await prisma.resident.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Resident deleted' });
  } catch (error) {
    console.error('Delete resident error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Create Daily Report (staff/admin)
app.post('/api/reports', requireRole(['facility_staff', 'system_admin']), async (req, res) => {
  try {
    const { residentId, vitals, mood, meals, activities, notes, images } = req.body;
    const report = await prisma.dailyReport.create({
      data: {
        residentId,
        staffId: req.user.userId,
        vitals,
        mood,
        meals,
        activities,
        notes,
        images: images ? { connect: images.map(id => ({ id })) } : undefined,
        date: new Date()
      }
    });
    res.status(201).json({ success: true, report });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get all reports for a resident (staff/admin/family)
app.get('/api/residents/:residentId/reports', requireRole(['facility_staff', 'system_admin', 'family']), async (req, res) => {
  try {
    // If user is family, ensure they are associated with the resident
    if (req.user.role === 'family') {
      const resident = await prisma.resident.findUnique({
        where: { id: req.params.residentId },
        include: { family: { where: { id: req.user.userId } } }
      });
      if (!resident || resident.family.length === 0) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }
    const reports = await prisma.dailyReport.findMany({
      where: { residentId: req.params.residentId },
      orderBy: { date: 'desc' },
      include: { staff: true, images: true }
    });
    res.json({ success: true, reports });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get single report by ID (staff/admin)
app.get('/api/reports/:id', requireRole(['facility_staff', 'system_admin']), async (req, res) => {
  try {
    const report = await prisma.dailyReport.findUnique({
      where: { id: req.params.id },
      include: { staff: true, images: true }
    });
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    res.json({ success: true, report });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Update report (staff/admin)
app.put('/api/reports/:id', requireRole(['facility_staff', 'system_admin']), async (req, res) => {
  try {
    const { vitals, mood, meals, activities, notes, images } = req.body;
    const report = await prisma.dailyReport.update({
      where: { id: req.params.id },
      data: {
        vitals,
        mood,
        meals,
        activities,
        notes,
        images: images ? { set: images.map(id => ({ id })) } : undefined
      }
    });
    res.json({ success: true, report });
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Delete report (admin only)
app.delete('/api/reports/:id', requireRole(['system_admin']), async (req, res) => {
  try {
    await prisma.dailyReport.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Report deleted' });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Facility Management Endpoints (system_admin only)
app.get('/api/facilities', requireRole(['system_admin']), async (req, res) => {
  try {
    const facilities = await prisma.facility.findMany();
    res.json({ success: true, facilities });
  } catch (error) {
    console.error('Get facilities error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/api/facilities', requireRole(['system_admin']), async (req, res) => {
  try {
    const { name, address, contactPerson, status } = req.body;
    const facility = await prisma.facility.create({
      data: {
        name,
        address,
        contactPerson,
        status: status || 'ACTIVE',
      }
    });
    res.status(201).json({ success: true, facility });
  } catch (error) {
    console.error('Create facility error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.put('/api/facilities/:id', requireRole(['system_admin']), async (req, res) => {
  try {
    const { name, address, contactPerson, status } = req.body;
    const facility = await prisma.facility.update({
      where: { id: req.params.id },
      data: { name, address, contactPerson, status }
    });
    res.json({ success: true, facility });
  } catch (error) {
    console.error('Update facility error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.patch('/api/facilities/:id/status', requireRole(['system_admin']), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['ACTIVE', 'INACTIVE'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const facility = await prisma.facility.update({
      where: { id: req.params.id },
      data: { status }
    });
    res.json({ success: true, facility });
  } catch (error) {
    console.error('Change facility status error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get residents currently assigned to a facility
app.get('/api/facilities/:id/residents', requireRole(['system_admin', 'family', 'facility_staff']), async (req, res) => {
  try {
    const today = new Date();
    const assignments = await prisma.residentFacilityAssignment.findMany({
      where: {
        facilityId: req.params.id,
        startDate: { lte: today },
        OR: [
          { endDate: null },
          { endDate: { gte: today } }
        ]
      },
      include: { resident: true }
    });
    const residents = assignments.map(a => a.resident);
    res.json({ success: true, residents });
  } catch (error) {
    console.error('Get facility residents error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Image upload endpoint
app.post('/api/images/upload', authenticateToken, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }
    const images = await Promise.all(req.files.map(async (file) => {
      // Cloudinary provides the URL in file.path
      const url = file.path;
      const image = await prisma.image.create({
        data: {
          url,
          uploadedById: req.user.userId
        }
      });
      return { id: image.id, url: image.url };
    }));
    res.status(201).json({ success: true, imageIds: images.map(i => i.id), images });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Send a message (staff/family)
app.post('/api/messages', authenticateToken, async (req, res) => {
  try {
    const { residentId, recipientId, content, images } = req.body;
    if (!residentId || !recipientId || !content) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    const message = await prisma.message.create({
      data: {
        residentId,
        senderId: req.user.userId,
        recipientId,
        content,
        images: images ? { connect: images.map(id => ({ id })) } : undefined
      },
      include: { sender: true, recipient: true, images: true }
    });
    res.status(201).json({ success: true, message });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get all messages for a resident involving the current user
app.get('/api/residents/:residentId/messages', authenticateToken, async (req, res) => {
  try {
    const residentId = req.params.residentId;
    const userId = req.user.userId;
    const messages = await prisma.message.findMany({
      where: {
        residentId,
        OR: [
          { senderId: userId },
          { recipientId: userId }
        ]
      },
      orderBy: { createdAt: 'asc' },
      include: { sender: true, recipient: true, images: true }
    });
    res.json({ success: true, messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// JWT authentication middleware
function authenticateToken(req, res, next) {
  console.log('authenticateToken called for', req.path);
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    req.user = user;
    next();
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

// 404 handler - MOVED TO END OF FILE

// Create/request a visit (family, staff, admin)
app.post('/api/visits', authenticateToken, async (req, res) => {
  try {
    const { residentId, visitDate, notes } = req.body;
    if (!residentId || !visitDate) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    const visit = await prisma.visit.create({
      data: {
        residentId,
        requestedById: req.user.userId,
        visitDate: new Date(visitDate),
        notes
      },
      include: { resident: true, requestedBy: true, scheduledBy: true }
    });
    res.status(201).json({ success: true, visit });
  } catch (error) {
    console.error('Create visit error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// List all visits for a resident (family, staff, admin)
app.get('/api/residents/:residentId/visits', authenticateToken, async (req, res) => {
  try {
    const residentId = req.params.residentId;
    // Family can only see visits for their associated residents
    if (req.user.role === 'family') {
      const resident = await prisma.resident.findUnique({
        where: { id: residentId },
        include: { family: { where: { id: req.user.userId } } }
      });
      if (!resident || resident.family.length === 0) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }
    const visits = await prisma.visit.findMany({
      where: { residentId },
      orderBy: { visitDate: 'asc' },
      include: { resident: true, requestedBy: true, scheduledBy: true }
    });
    res.json({ success: true, visits });
  } catch (error) {
    console.error('Get visits error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Update visit (staff/admin can update any, requester can cancel)
app.put('/api/visits/:id', authenticateToken, async (req, res) => {
  try {
    const { status, visitDate, notes } = req.body;
    const visit = await prisma.visit.findUnique({ where: { id: req.params.id } });
    if (!visit) return res.status(404).json({ success: false, message: 'Visit not found' });
    // Only staff/admin or the requester can update
    if (!(req.user.role === 'facility_staff' || req.user.role === 'system_admin' || visit.requestedById === req.user.userId)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    const updated = await prisma.visit.update({
      where: { id: req.params.id },
      data: {
        status,
        visitDate: visitDate ? new Date(visitDate) : undefined,
        notes,
        scheduledById: (status && status !== 'REQUESTED') ? req.user.userId : visit.scheduledById
      },
      include: { resident: true, requestedBy: true, scheduledBy: true }
    });
    res.json({ success: true, visit: updated });
  } catch (error) {
    console.error('Update visit error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Cancel visit (staff/admin/requester)
app.delete('/api/visits/:id', authenticateToken, async (req, res) => {
  try {
    const visit = await prisma.visit.findUnique({ where: { id: req.params.id } });
    if (!visit) return res.status(404).json({ success: false, message: 'Visit not found' });
    if (!(req.user.role === 'facility_staff' || req.user.role === 'system_admin' || visit.requestedById === req.user.userId)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    await prisma.visit.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Visit cancelled' });
  } catch (error) {
    console.error('Delete visit error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Registering /api/notifications
console.log('Registering /api/notifications');
app.post('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const { userId, type, message, residentId, visitId, reportId } = req.body;
    if (!userId || !type || !message) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        message,
        residentId,
        visitId,
        reportId
      }
    });
    res.status(201).json({ success: true, notification });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

console.log('Registering GET /api/notifications');
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Registering /api/my-residents
console.log('Registering /api/my-residents');
app.get('/api/my-residents', requireRole(['family']), async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { residents: true }
    });
    res.json({ success: true, residents: user.residents });
  } catch (error) {
    console.error('Get my residents error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Simple unprotected test route for debugging
app.get('/api/my-residents-test', (req, res) => {
  res.json({ success: true, message: 'Unprotected my-residents test route works!' });
});

// Simple non-API test route for debugging
app.get('/hello', (req, res) => res.send('Hello world!'));

// Test endpoint for new features
app.get('/api/test-new-features', (req, res) => {
  res.json({
    success: true,
    message: 'New features are deployed! 🎉',
    features: ['feed', 'docs', 'calendar'],
    timestamp: new Date().toISOString()
  });
});

// Get resident documentation (care plans, medical info, etc.)
console.log('Registering /api/residents/:residentId/docs');
app.get('/api/residents/:residentId/docs', requireRole(['facility_staff', 'system_admin', 'family']), async (req, res) => {
  try {
    const residentId = req.params.residentId;
    
    // Family can only see docs for their associated residents
    if (req.user.role === 'family') {
      const resident = await prisma.resident.findUnique({
        where: { id: residentId },
        include: { family: { where: { id: req.user.userId } } }
      });
      if (!resident || resident.family.length === 0) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }

    const resident = await prisma.resident.findUnique({
      where: { id: residentId },
      select: {
        id: true,
        name: true,
        carePlan: true,
        medicalInfo: true,
        room: true,
        admittedAt: true,
        dischargedAt: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!resident) {
      return res.status(404).json({ success: false, message: 'Resident not found' });
    }

    res.json({ 
      success: true, 
      docs: {
        carePlan: resident.carePlan,
        medicalInfo: resident.medicalInfo,
        room: resident.room,
        admittedAt: resident.admittedAt,
        dischargedAt: resident.dischargedAt,
        createdAt: resident.createdAt,
        updatedAt: resident.updatedAt
      }
    });
  } catch (error) {
    console.error('Get resident docs error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get resident daily feed (reports with images)
console.log('Registering /api/residents/:residentId/feed');
app.get('/api/residents/:residentId/feed', requireRole(['facility_staff', 'system_admin', 'family']), async (req, res) => {
  try {
    const residentId = req.params.residentId;
    
    // Family can only see feed for their associated residents
    if (req.user.role === 'family') {
      const resident = await prisma.resident.findUnique({
        where: { id: residentId },
        include: { family: { where: { id: req.user.userId } } }
      });
      if (!resident || resident.family.length === 0) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }

    const reports = await prisma.dailyReport.findMany({
      where: { residentId },
      orderBy: { date: 'desc' },
      include: {
        staff: {
          select: { name: true, role: true }
        },
        images: {
          select: { url: true, tag: true, date: true }
        }
      }
    });

    res.json({ success: true, feed: reports });
  } catch (error) {
    console.error('Get resident feed error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get resident calendar (visits and events)
console.log('Registering /api/residents/:residentId/calendar');
app.get('/api/residents/:residentId/calendar', requireRole(['facility_staff', 'system_admin', 'family']), async (req, res) => {
  try {
    const residentId = req.params.residentId;
    
    // Family can only see calendar for their associated residents
    if (req.user.role === 'family') {
      const resident = await prisma.resident.findUnique({
        where: { id: residentId },
        include: { family: { where: { id: req.user.userId } } }
      });
      if (!resident || resident.family.length === 0) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }

    const visits = await prisma.visit.findMany({
      where: { residentId },
      orderBy: { visitDate: 'asc' },
      include: {
        requestedBy: {
          select: { name: true, role: true }
        },
        scheduledBy: {
          select: { name: true, role: true }
        }
      }
    });

    // Transform visits into calendar events
    const calendarEvents = visits.map(visit => ({
      id: visit.id,
      title: `Visit - ${visit.status}`,
      date: visit.visitDate,
      type: 'visit',
      status: visit.status,
      notes: visit.notes,
      requestedBy: visit.requestedBy,
      scheduledBy: visit.scheduledBy
    }));

    res.json({ success: true, calendar: calendarEvents });
  } catch (error) {
    console.error('Get resident calendar error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// 404 handler - must be last
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server (for Render deployment)
app.listen(PORT, () => {
  console.log(`🚀 AIGE Backend server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth/`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app; 