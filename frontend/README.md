# AIGE Frontend

A modern, responsive sign up/login page for the AIGE platform. This frontend features a clean design, smooth animations, and comprehensive form validation.

## Features

### 🎨 **Modern Design**
- Clean, minimalist interface with gradient background
- Glassmorphism effect with backdrop blur
- Smooth animations and transitions
- Responsive design for all devices

### 🔐 **Authentication Features**
- **Toggle between Login and Sign Up** - Seamlessly switch between forms
- **Password visibility toggle** - Show/hide passwords with eye icon
- **Form validation** - Real-time validation with error messages
- **Password strength indicator** - Visual feedback for password strength
- **Remember me functionality** - Checkbox for login persistence
- **Terms & Conditions agreement** - Required for signup

### 🚀 **Interactive Elements**
- **Loading states** - Visual feedback during form submission
- **Success notifications** - Toast messages for successful actions
- **Social authentication** - Google and Facebook login options
- **Ripple effects** - Material design-inspired button interactions
- **Hover animations** - Smooth hover effects on all interactive elements

### 📱 **Responsive Design**
- Mobile-first approach
- Optimized for all screen sizes
- Touch-friendly interface
- Adaptive layout for different devices

## File Structure

```
frontend/
├── index.html          # Main HTML file
├── styles.css          # CSS styles and animations
├── script.js           # JavaScript functionality
└── README.md           # This file
```

## Getting Started

1. **Open the page**: Simply open `index.html` in your web browser
2. **No setup required**: All dependencies are loaded from CDN
3. **Start using**: The page is ready to use immediately

## Backend Integration

This frontend is designed to work with the AIGE backend API. To connect them:

1. **Start the backend server** (see `../backend/README.md`)
2. **Update API endpoints** in `script.js` to point to your backend
3. **Configure CORS** on the backend if needed

### API Endpoints Used
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `GET /api/user/profile` - Get user profile (protected)

## Usage

### Login Form
- Enter your email and password
- Check "Remember me" if desired
- Click "Sign In" to submit
- Use "Forgot password?" link if needed

### Sign Up Form
- Fill in your full name, email, and password
- Confirm your password
- Agree to terms and conditions
- Click "Create Account" to submit

### Form Switching
- Click the toggle button to switch between login and signup
- Smooth animations provide visual feedback

### Social Authentication
- Click Google or Facebook buttons for social login
- Simulated authentication with loading states

## Technical Details

### Dependencies
- **Font Awesome 6.0.0** - Icons
- **Google Fonts (Inter)** - Typography
- **Vanilla JavaScript** - No frameworks required

### Browser Support
- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

### Features Implemented
- ✅ Form validation
- ✅ Password strength checking
- ✅ Email format validation
- ✅ Responsive design
- ✅ Accessibility features
- ✅ Modern CSS (Flexbox, Grid, Custom Properties)
- ✅ ES6+ JavaScript
- ✅ Touch-friendly interface

## Customization

### Colors
The color scheme can be easily modified in `styles.css`:
- Primary gradient: `#667eea` to `#764ba2`
- Success color: `#10b981`
- Error color: `#e74c3c`

### Branding
- Change the "AIGE" header in `index.html`
- Modify the subtitle text
- Update social authentication providers

### Styling
- All styles are in `styles.css`
- Easy to customize fonts, colors, and spacing
- Modular CSS structure for easy maintenance

## Development

### Local Development
1. Open `index.html` in your browser
2. Use browser dev tools for debugging
3. Modify files and refresh to see changes

### Production Build
For production deployment:
1. Minify CSS and JavaScript
2. Optimize images
3. Enable compression
4. Set up CDN for static assets

## Demo Features

This frontend includes simulated functionality for demonstration:
- Form submissions show success messages
- Social authentication is simulated
- Perfect for prototyping and UI/UX testing

## Future Enhancements

Potential improvements:
- Real backend API integration
- State management (Redux/Vuex)
- Progressive Web App features
- Offline support
- Advanced form validation
- Multi-language support

## License

This project is open source and available under the MIT License.

---

**Built with ❤️ for the AIGE platform** 