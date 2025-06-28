# AIGE Frontend - Vercel Deployment Guide

This guide will help you deploy the AIGE frontend to Vercel with proper configuration and settings.

## 🚀 Quick Deploy

### Option 1: Deploy via Vercel Dashboard

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Click "New Project"**
3. **Import your GitHub repository**: `bertharo/aige`
4. **Configure the project**:
   - **Framework Preset**: `Other`
   - **Root Directory**: `frontend`
   - **Build Command**: Leave empty (static site)
   - **Output Directory**: Leave empty (static site)
   - **Install Command**: Leave empty (no dependencies)

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend directory
cd frontend

# Deploy
vercel

# Follow the prompts:
# - Link to existing project or create new
# - Set project name: aige-frontend
# - Confirm settings
```

## ⚙️ Vercel Configuration

The `vercel.json` file in the frontend directory contains the optimal configuration:

```json
{
  "version": 2,
  "name": "aige-frontend",
  "builds": [
    {
      "src": "**/*",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

## 🔧 Environment Variables

### Required Environment Variables

Set these in your Vercel project dashboard under **Settings > Environment Variables**:

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_API_URL` | `https://your-backend-url.vercel.app` | Your backend API URL |

### How to Set Environment Variables

1. **Go to Vercel Dashboard**
2. **Select your project**
3. **Go to Settings > Environment Variables**
4. **Add the variables above**

## 🌐 Domain Configuration

### Custom Domain (Optional)

1. **Go to Vercel Dashboard > Your Project > Settings > Domains**
2. **Add your custom domain**
3. **Configure DNS records as instructed**

### Default Vercel Domain

Your site will be available at: `https://your-project-name.vercel.app`

## 🔒 Security Headers

The `vercel.json` includes security headers:

- **X-Content-Type-Options**: Prevents MIME type sniffing
- **X-Frame-Options**: Prevents clickjacking
- **X-XSS-Protection**: Basic XSS protection
- **Referrer-Policy**: Controls referrer information

## 📱 Performance Optimization

### Caching Strategy

Static assets (CSS, JS) are cached for 1 year:

```json
{
  "source": "/styles.css",
  "headers": [
    {
      "key": "Cache-Control",
      "value": "public, max-age=31536000, immutable"
    }
  ]
}
```

### Compression

Vercel automatically compresses:
- HTML, CSS, JavaScript
- Images (WebP conversion)
- Fonts

## 🔄 Continuous Deployment

### Automatic Deployments

- **Push to `main` branch**: Automatic deployment
- **Pull Requests**: Preview deployments
- **Branch deployments**: Automatic for all branches

### Deployment Settings

Configure in Vercel Dashboard > Settings > Git:

- **Production Branch**: `main`
- **Auto-deploy**: Enabled
- **Preview deployments**: Enabled

## 🧪 Testing Your Deployment

### Health Check

1. **Visit your deployed URL**
2. **Test the login form**
3. **Test the signup form**
4. **Verify responsive design**
5. **Check console for errors**

### Common Issues

| Issue | Solution |
|-------|----------|
| API calls failing | Check `VITE_API_URL` environment variable |
| 404 errors | Verify `vercel.json` routes configuration |
| CORS errors | Ensure backend allows your Vercel domain |
| Styling issues | Check if CSS files are loading correctly |

## 🔗 Backend Integration

### CORS Configuration

Update your backend CORS settings to allow your Vercel domain:

```javascript
// In your backend server.js
app.use(cors({
  origin: [
    'https://your-frontend.vercel.app',
    'http://localhost:3000' // for local development
  ],
  credentials: true
}));
```

### Environment Variables for Backend

If deploying backend to Vercel as well:

```bash
# Backend environment variables
NODE_ENV=production
JWT_SECRET=your-secret-key
CORS_ORIGIN=https://your-frontend.vercel.app
```

## 📊 Analytics & Monitoring

### Vercel Analytics (Optional)

1. **Enable in Vercel Dashboard > Settings > Analytics**
2. **Add tracking code to your HTML**:

```html
<script>
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
</script>
<script defer src="/_vercel/insights/script.js"></script>
```

### Performance Monitoring

- **Vercel Speed Insights**: Automatic performance monitoring
- **Core Web Vitals**: Tracked automatically
- **Error tracking**: Built-in error monitoring

## 🚀 Production Checklist

Before going live:

- [ ] Environment variables configured
- [ ] Backend API deployed and accessible
- [ ] CORS settings updated
- [ ] Custom domain configured (if needed)
- [ ] SSL certificate active
- [ ] Performance optimized
- [ ] Error monitoring enabled
- [ ] Analytics configured (optional)

## 🔄 Updates & Maintenance

### Updating Your Site

1. **Make changes to your code**
2. **Push to GitHub**
3. **Vercel automatically deploys**

### Rollback

1. **Go to Vercel Dashboard > Deployments**
2. **Find the deployment you want to rollback to**
3. **Click "Redeploy"**

## 📞 Support

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Community**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)

---

**Your AIGE frontend is now ready for production deployment on Vercel! 🎉** 