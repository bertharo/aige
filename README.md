# AIGE - Authentication Platform

A complete authentication system with a modern frontend and secure backend API. Built with vanilla JavaScript, HTML/CSS for the frontend and Node.js/Express for the backend.

## 🏗️ Project Structure

```
aige/
├── frontend/           # Frontend application
│   ├── index.html     # Main HTML file
│   ├── styles.css     # CSS styles and animations
│   ├── script.js      # JavaScript functionality
│   └── README.md      # Frontend documentation
├── backend/           # Backend API
│   ├── server.js      # Express server
│   ├── package.json   # Node.js dependencies
│   ├── env.example    # Environment variables template
│   └── README.md      # Backend documentation
└── README.md          # This file
```

## 🚀 Quick Start

### Frontend
```bash
# Navigate to frontend directory
cd frontend

# Open in browser (no build required)
open index.html
```

### Backend
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Set up environment variables
cp env.example .env

# Start development server
npm run dev
```

## ✨ Features

### Frontend
- 🎨 Modern, responsive design with glassmorphism effects
- 🔐 Toggle between login and signup forms
- ✅ Real-time form validation with error messages
- 🔒 Password strength indicator and visibility toggle
- 📱 Mobile-first responsive design
- 🎭 Smooth animations and transitions
- 🌐 Social authentication options (Google, Facebook)

### Backend
- 🔐 JWT-based authentication
- 🔒 Bcrypt password hashing
- ✅ Input validation and sanitization
- 🛡️ Security middleware (Helmet, CORS)
- 📊 Request logging with Morgan
- 🧪 Health check endpoint
- 🔄 Auto-reload in development

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User authentication |
| GET | `/api/user/profile` | Get user profile (protected) |

## 🛠️ Technology Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with Flexbox/Grid
- **Vanilla JavaScript** - ES6+ features
- **Font Awesome** - Icons
- **Google Fonts** - Typography

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Express-validator** - Input validation
- **Helmet** - Security headers
- **Morgan** - HTTP logging

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Modern web browser

### Backend Setup
```bash
cd backend
npm install
cp env.example .env
# Edit .env with your configuration
npm run dev
```

### Frontend Setup
```bash
cd frontend
# No installation required - just open index.html
```

## 🔗 Connecting Frontend to Backend

1. **Start the backend server** (runs on port 3000 by default)
2. **Update API endpoints** in `frontend/script.js` if needed
3. **Configure CORS** on the backend for cross-origin requests

## 🧪 Testing

### Backend API Testing
```bash
# Health check
curl http://localhost:3000/health

# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Frontend Testing
- Open `frontend/index.html` in your browser
- Test form validation and animations
- Try switching between login and signup forms

## 🔒 Security Features

- **Password Hashing**: All passwords encrypted with bcrypt
- **JWT Tokens**: Secure token-based authentication
- **Input Validation**: All inputs validated and sanitized
- **Security Headers**: Helmet middleware for protection
- **CORS**: Configurable cross-origin resource sharing

## 🚀 Deployment

### Frontend Deployment
- Deploy to any static hosting service (Netlify, Vercel, GitHub Pages)
- No build process required
- Update API endpoints to point to production backend

### Backend Deployment
- Deploy to Node.js hosting (Heroku, Railway, DigitalOcean)
- Set environment variables for production
- Use PM2 or similar for process management
- Set up reverse proxy (nginx) for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Font Awesome for icons
- Google Fonts for typography
- Express.js community for the excellent framework
- All contributors and supporters

---

**Built with ❤️ for the AIGE platform**

*For more information, see the individual README files in the `frontend/` and `backend/` directories.* 