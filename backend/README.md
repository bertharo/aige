# AIGE Backend API

A Node.js/Express backend API for the AIGE authentication system with JWT authentication, password hashing, and comprehensive validation.

## Features

- 🔐 **JWT Authentication** - Secure token-based authentication
- 🔒 **Password Hashing** - Bcrypt password encryption
- ✅ **Input Validation** - Express-validator for request validation
- 🛡️ **Security Middleware** - Helmet for security headers
- 📊 **Logging** - Morgan for HTTP request logging
- 🌐 **CORS Support** - Cross-origin resource sharing enabled
- 🧪 **Health Check** - API health monitoring endpoint

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Start the server:**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

4. **Test the API:**
   ```bash
   curl http://localhost:3000/health
   ```

## API Endpoints

### Authentication

#### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account created successfully! Welcome to AIGE.",
  "user": {
    "id": "1234567890",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST `/api/auth/login`
Authenticate existing user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful! Welcome back to AIGE.",
  "user": {
    "id": "1234567890",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### User Management

#### GET `/api/user/profile`
Get current user profile (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "1234567890",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### System

#### GET `/health`
Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "AIGE Backend API"
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | - |
| `CLOUDINARY_API_KEY` | Cloudinary API key | - |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | - |

## Project Structure

```
backend/
├── server.js          # Main server file
├── package.json       # Dependencies and scripts
├── env.example        # Environment variables template
└── README.md          # This file
```

## Development

### Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm test` - Run tests (when implemented)

### Adding New Endpoints

1. Add validation middleware if needed
2. Create the route handler
3. Add error handling
4. Update this README with documentation

## Security Features

- **Password Hashing**: All passwords are hashed using bcrypt
- **JWT Tokens**: Secure token-based authentication
- **Input Validation**: All inputs are validated and sanitized
- **Security Headers**: Helmet middleware for security headers
- **CORS**: Configurable cross-origin resource sharing

## Cloudinary Setup

This application uses Cloudinary for image storage and management. Images are automatically optimized and served via CDN.

### Setup Steps

1. **Create a Cloudinary account** (if you don't have one):
   - Go to [cloudinary.com](https://cloudinary.com)
   - Sign up for a free account

2. **Get your credentials**:
   - Log into your Cloudinary dashboard
   - Go to Settings → Access Keys
   - Copy your Cloud Name, API Key, and API Secret

3. **Configure environment variables**:
   ```bash
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Test the connection**:
   ```bash
   curl http://localhost:3000/api/test/cloudinary
   ```

### Features

- **Automatic optimization**: Images are resized to max 800x800px
- **Multiple formats**: Supports JPG, PNG, GIF, WebP
- **Organized storage**: Images are stored in the `elderly-care` folder
- **CDN delivery**: Fast global image delivery

## Production Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Use a strong `JWT_SECRET`
3. Configure proper CORS settings
4. Set up Cloudinary credentials
5. Set up a reverse proxy (nginx)
6. Use PM2 or similar for process management

### Database Integration
Currently using in-memory storage. For production:
1. Add database connection (PostgreSQL, MongoDB, etc.)
2. Implement proper user management
3. Add password reset functionality
4. Add email verification

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see main project README for details. 