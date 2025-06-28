# AIGE Backend - Render Deployment Guide

This guide will help you deploy the AIGE backend API to Render with proper configuration and settings.

## 🚀 Quick Deploy

### Option 1: Deploy via Render Dashboard

1. **Go to [Render Dashboard](https://dashboard.render.com/)**
2. **Click "New +" and select "Web Service"**
3. **Connect your GitHub repository**: `bertharo/aige`
4. **Configure the service**:
   - **Name**: `aige-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or choose paid plan)

### Option 2: Deploy via Render CLI

```bash
# Install Render CLI
npm install -g @render/cli

# Login to Render
render login

# Navigate to backend directory
cd backend

# Deploy
render deploy
```

## ⚙️ Render Configuration

### Environment Variables

Set these in your Render service dashboard under **Environment**:

| Variable | Value | Description |
|----------|-------|-------------|
| `JWT_SECRET` | `your-super-secret-jwt-key` | Secret key for JWT token signing |
| `FRONTEND_URL` | `https://your-frontend.vercel.app` | Your frontend URL for CORS |
| `NODE_ENV` | `production` | Environment mode |
| `PORT` | `10000` | Port (Render sets this automatically) |

### How to Set Environment Variables

1. **Go to Render Dashboard**
2. **Select your service**
3. **Go to Environment tab**
4. **Add the variables above**

## 🌐 Domain Configuration

### Default Render Domain

Your API will be available at: `https://your-service-name.onrender.com`

### Custom Domain (Optional)

1. **Go to Render Dashboard > Your Service > Settings**
2. **Click "Custom Domains"**
3. **Add your custom domain**
4. **Configure DNS records as instructed**

### API Endpoints

After deployment, your endpoints will be:

- **Health Check**: `https://your-service-name.onrender.com/health`
- **Register**: `https://your-service-name.onrender.com/api/auth/register`
- **Login**: `https://your-service-name.onrender.com/api/auth/login`
- **Profile**: `https://your-service-name.onrender.com/api/user/profile`

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

### Render Service Settings

- **Auto-Deploy**: Enabled (pushes to main branch)
- **Health Check Path**: `/health`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### Scaling Options

- **Free Plan**: 750 hours/month, sleeps after 15 minutes of inactivity
- **Paid Plans**: Always-on, custom scaling, better performance

## 🔄 Continuous Deployment

### Automatic Deployments

- **Push to `main` branch**: Automatic deployment
- **Pull Requests**: Manual deployment (optional)
- **Branch deployments**: Configurable

### Deployment Settings

Configure in Render Dashboard > Your Service > Settings:

- **Auto-Deploy**: Enabled
- **Branch**: `main`
- **Health Check Path**: `/health`

## 🧪 Testing Your Deployment

### Health Check

```bash
curl https://your-service-name.onrender.com/health
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
curl -X POST https://your-service-name.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### Login User
```bash
curl -X POST https://your-service-name.onrender.com/api/auth/login \
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
| 404 errors | Check health check path configuration |
| Cold start delays | Upgrade to paid plan for always-on service |

## 🔗 Frontend Integration

### Update Frontend Environment Variable

In your frontend Vercel project, set:
```
VITE_API_URL = https://your-service-name.onrender.com
```

### CORS Configuration

The backend automatically allows your frontend domain. If you need to add more domains:

1. **Add to environment variables**:
   ```
   CORS_ORIGIN = https://your-frontend.vercel.app,https://another-domain.com
   ```

2. **Update server.js** to parse multiple origins

## 📊 Monitoring & Logs

### Render Logs

- **Build Logs**: Available in Render Dashboard
- **Runtime Logs**: Real-time logs in dashboard
- **Error Tracking**: Built-in error monitoring

### Performance Monitoring

- **Response Times**: Tracked automatically
- **Memory Usage**: Monitored by Render
- **Uptime**: Health check monitoring

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
- [ ] SSL certificate active (automatic on Render)
- [ ] Performance optimized
- [ ] Health check working

## 🔄 Updates & Maintenance

### Updating Your API

1. **Make changes to your code**
2. **Push to GitHub**
3. **Render automatically deploys**

### Environment Variable Updates

1. **Go to Render Dashboard > Your Service > Environment**
2. **Update the variable**
3. **Redeploy the service**

### Manual Redeploy

1. **Go to Render Dashboard > Your Service**
2. **Click "Manual Deploy"**
3. **Select branch and deploy**

## 📞 Support

- **Render Documentation**: [render.com/docs](https://render.com/docs)
- **Render Support**: [render.com/support](https://render.com/support)
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

## 💰 Pricing Considerations

### Free Plan Limitations

- **750 hours/month** (about 31 days)
- **Sleeps after 15 minutes** of inactivity
- **Cold start delays** when waking up
- **Limited bandwidth**

### Paid Plan Benefits

- **Always-on service**
- **No cold start delays**
- **Higher bandwidth limits**
- **Better performance**
- **Custom domains included**

---

**Your AIGE backend is now ready for production deployment on Render! 🎉** 