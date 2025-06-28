# AIGE Backend - Vercel Deployment Guide

This guide will help you deploy the AIGE backend API to Vercel with proper configuration and settings.

## 🚀 Quick Deploy

### Option 1: Deploy via Vercel Dashboard

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Click "New Project"**
3. **Import your GitHub repository**: `bertharo/aige`
4. **Configure the project**:
   - **Framework Preset**: `Node.js`
   - **Root Directory**: `backend`
   - **Build Command**: Leave empty (no build needed)
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to backend directory
cd backend

# Deploy
vercel

# Follow the prompts:
# - Link to existing project or create new
# - Set project name: aige-backend
# - Confirm settings
```

## ⚙️ Vercel Configuration

The `vercel.json` file in the backend directory contains the optimal configuration:

```json
{
  "version": 2,
  "name": "aige-backend",
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ],
  "functions": {
    "server.js": {
      "maxDuration": 30
    }
  },
  "env": {
    "NODE_ENV": "production"
  }
}
```

## 🔧 Environment Variables

### Required Environment Variables

Set these in your Vercel project dashboard under **Settings > Environment Variables**:

| Variable | Value | Description |
|----------|-------|-------------|
| `JWT_SECRET` | `your-super-secret-jwt-key` | Secret key for JWT token signing |
| `FRONTEND_URL` | `https://your-frontend.vercel.app` | Your frontend URL for CORS |
| `NODE_ENV` | `production` | Environment mode |

### Optional Environment Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `PORT` | `3000` | Server port (Vercel handles this) |
| `CORS_ORIGIN` | `https://your-frontend.vercel.app` | Additional CORS origins |

### How to Set Environment Variables

1. **Go to Vercel Dashboard**
2. **Select your project**
3. **Go to Settings > Environment Variables**
4. **Add the variables above**

## 🌐 Domain Configuration

### Default Vercel Domain

Your API will be available at: `https://your-project-name.vercel.app`

### API Endpoints

After deployment, your endpoints will be:

- **Health Check**: `https://your-project-name.vercel.app/health`
- **Register**: `https://your-project-name.vercel.app/api/auth/register`
- **Login**: `https://your-project-name.vercel.app/api/auth/login`
- **Profile**: `https://your-project-name.vercel.app/api/user/profile`

## 🔒 Security Configuration

### CORS Settings

The backend is configured to allow requests from:
- Your Vercel frontend domain
- Localhost (for development)
- Any domain specified in `FRONTEND_URL` environment variable

### JWT Configuration

- **Token Expiry**: 24 hours
- **Algorithm**: HS256
- **Secret**: Set via `JWT_SECRET` environment variable

## 📱 Performance Optimization

### Serverless Function Settings

- **Max Duration**: 30 seconds
- **Memory**: Auto-allocated by Vercel
- **Cold Start**: Optimized for Node.js

### Caching Strategy

For production, consider:
- Database caching (Redis)
- Response caching for static data
- CDN for static assets

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

```bash
curl https://your-project-name.vercel.app/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "AIGE Backend API",
  "environment": "production",
  "uptime": 123.456
}
```

### API Testing

#### Register User
```bash
curl -X POST https://your-project-name.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### Login User
```bash
curl -X POST https://your-project-name.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Common Issues

| Issue | Solution |
|-------|----------|
| CORS errors | Check `FRONTEND_URL` environment variable |
| JWT errors | Verify `JWT_SECRET` is set |
| 404 errors | Check `vercel.json` routes configuration |
| Timeout errors | Increase `maxDuration` in `vercel.json` |

## 🔗 Frontend Integration

### Update Frontend Environment Variable

In your frontend Vercel project, set:
```
VITE_API_URL = https://your-backend-project-name.vercel.app
```

### CORS Configuration

The backend automatically allows your frontend domain. If you need to add more domains:

1. **Add to environment variables**:
   ```
   CORS_ORIGIN = https://your-frontend.vercel.app,https://another-domain.com
   ```

2. **Update server.js** to parse multiple origins

## 📊 Monitoring & Logs

### Vercel Logs

- **Function Logs**: Available in Vercel Dashboard
- **Real-time Logs**: Use Vercel CLI: `vercel logs`
- **Error Tracking**: Built-in error monitoring

### Performance Monitoring

- **Function Duration**: Tracked automatically
- **Memory Usage**: Monitored by Vercel
- **Cold Start Times**: Optimized automatically

## 🗄️ Database Considerations

### Current Setup

The backend uses in-memory storage for demonstration. For production:

### Recommended Database Options

1. **MongoDB Atlas** (NoSQL)
   ```bash
   npm install mongoose
   ```

2. **PostgreSQL** (SQL)
   ```bash
   npm install pg
   ```

3. **Supabase** (PostgreSQL + Auth)
   - Built-in authentication
   - Real-time subscriptions
   - Row-level security

4. **PlanetScale** (MySQL)
   - Serverless MySQL
   - Branch-based development

### Environment Variables for Database

```bash
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/aige

# PostgreSQL
DATABASE_URL=postgresql://username:password@host:port/database

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

## 🚀 Production Checklist

Before going live:

- [ ] Environment variables configured
- [ ] JWT secret set and secure
- [ ] CORS origins configured
- [ ] Frontend URL updated
- [ ] API endpoints tested
- [ ] Error handling verified
- [ ] Logging configured
- [ ] Database connected (if applicable)
- [ ] SSL certificate active
- [ ] Performance optimized

## 🔄 Updates & Maintenance

### Updating Your API

1. **Make changes to your code**
2. **Push to GitHub**
3. **Vercel automatically deploys**

### Environment Variable Updates

1. **Go to Vercel Dashboard > Settings > Environment Variables**
2. **Update the variable**
3. **Redeploy the project**

### Rollback

1. **Go to Vercel Dashboard > Deployments**
2. **Find the deployment you want to rollback to**
3. **Click "Redeploy"**

## 📞 Support

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Node.js Documentation**: [nodejs.org/docs](https://nodejs.org/docs)
- **Express.js Documentation**: [expressjs.com](https://expressjs.com)

## 🔐 Security Best Practices

### JWT Security

- Use a strong, random JWT secret
- Set appropriate token expiration
- Implement token refresh mechanism
- Validate token on every request

### CORS Security

- Only allow necessary origins
- Use HTTPS in production
- Implement proper CORS headers
- Validate request origins

### General Security

- Use environment variables for secrets
- Implement rate limiting
- Add request validation
- Use HTTPS everywhere
- Regular security updates

---

**Your AIGE backend is now ready for production deployment on Vercel! 🎉** 