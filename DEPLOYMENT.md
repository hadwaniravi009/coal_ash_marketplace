# 🚀 Deployment Guide - AshLink Coal Ash Marketplace

This guide will help you deploy the AshLink Coal Ash Marketplace to various platforms.

## 📋 Prerequisites

- GitHub account
- MongoDB Atlas account (for cloud database)
- Vercel/Netlify account (for frontend deployment)
- Railway/Heroku account (for backend deployment)

## 🌐 GitHub Repository Setup

### 1. Create Repository on GitHub

1. Go to https://github.com/new
2. Repository name: `coal_ash_marketplace`
3. Description: `Modern coal ash marketplace connecting suppliers with buyers`
4. Set to Public or Private as needed
5. Don't initialize with README (we already have one)
6. Click "Create repository"

### 2. Push Local Code to GitHub

Run the provided script:

**Option A: Using Batch Script (Windows)**

```bash
push_to_github.bat
```

**Option B: Using PowerShell Script**

```powershell
./push_to_github.ps1
```

**Option C: Manual Commands**

```bash
git add .
git commit -m "Initial commit: Coal Ash Marketplace with enhanced UI"
git remote add origin https://github.com/hadwaniravi009/coal_ash_marketplace.git
git push -u origin main
```

## 🗄️ Database Setup (MongoDB Atlas)

### 1. Create MongoDB Atlas Cluster

1. Visit https://cloud.mongodb.com/
2. Sign up/Login
3. Create a new cluster (free tier available)
4. Choose a cloud provider and region
5. Create cluster

### 2. Configure Database Access

1. Database Access → Add New Database User
2. Choose "Password" authentication
3. Username: `coal_ash_user`
4. Generate secure password
5. Database User Privileges: "Read and write to any database"

### 3. Configure Network Access

1. Network Access → Add IP Address
2. Add `0.0.0.0/0` (Allow access from anywhere) for development
3. For production, add specific IP addresses

### 4. Get Connection String

1. Clusters → Connect
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database user password

## 🖥️ Backend Deployment

### Option A: Railway (Recommended)

1. **Create Railway Account**

   - Visit https://railway.app/
   - Sign up with GitHub

2. **Deploy Backend**

   ```bash
   # Install Railway CLI
   npm install -g @railway/cli

   # Login to Railway
   railway login

   # Navigate to backend directory
   cd backend

   # Initialize Railway project
   railway init

   # Deploy
   railway up
   ```

3. **Set Environment Variables**
   - Go to Railway dashboard
   - Select your project → Settings → Environment
   - Add:
     - `MONGO_URL`: Your MongoDB Atlas connection string
     - `JWT_SECRET_KEY`: A secure random string
     - `CORS_ORIGINS`: Your frontend URL

### Option B: Heroku

1. **Install Heroku CLI**

   - Download from https://devcenter.heroku.com/articles/heroku-cli

2. **Create Heroku App**

   ```bash
   cd backend
   heroku create your-app-name-backend
   ```

3. **Configure Environment Variables**

   ```bash
   heroku config:set MONGO_URL="your_mongodb_connection_string"
   heroku config:set JWT_SECRET_KEY="your_secret_key"
   heroku config:set CORS_ORIGINS="your_frontend_url"
   ```

4. **Create Procfile**

   ```
   web: uvicorn server:app --host 0.0.0.0 --port $PORT
   ```

5. **Deploy**
   ```bash
   git subtree push --prefix backend heroku main
   ```

## 🌐 Frontend Deployment

### Option A: Vercel (Recommended)

1. **Install Vercel CLI**

   ```bash
   npm install -g vercel
   ```

2. **Deploy Frontend**

   ```bash
   cd frontend
   vercel
   ```

3. **Configure Environment Variables**
   - Go to Vercel dashboard
   - Project Settings → Environment Variables
   - Add: `REACT_APP_BACKEND_URL`: Your deployed backend URL

### Option B: Netlify

1. **Build the Project**

   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Netlify**

   - Drag and drop the `build` folder to https://app.netlify.com/drop
   - Or connect GitHub repository for automatic deployments

3. **Configure Environment Variables**
   - Site settings → Environment variables
   - Add: `REACT_APP_BACKEND_URL`: Your deployed backend URL

## 🔧 Environment Variables Summary

### Backend (.env)

```env
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/coal_ash_marketplace
JWT_SECRET_KEY=your-super-secret-jwt-key
CORS_ORIGINS=https://your-frontend-domain.vercel.app
ENVIRONMENT=production
```

### Frontend (.env)

```env
REACT_APP_BACKEND_URL=https://your-backend-domain.railway.app
```

## 🌍 Custom Domain Setup (Optional)

### Backend (Railway)

1. Railway Dashboard → Settings → Domains
2. Add custom domain
3. Configure DNS records as instructed

### Frontend (Vercel)

1. Vercel Dashboard → Project → Settings → Domains
2. Add custom domain
3. Configure DNS records

## 📊 Monitoring and Analytics

### Backend Monitoring

- Railway provides built-in monitoring
- Add logging in production:
  ```python
  import logging
  logging.basicConfig(level=logging.INFO)
  ```

### Frontend Analytics

- Add Google Analytics
- Add error tracking (Sentry)

## 🔒 Security Best Practices

1. **Environment Variables**

   - Never commit `.env` files
   - Use different secrets for development/production

2. **Database Security**

   - Use specific IP whitelist for production
   - Regular security updates

3. **API Security**
   - Implement rate limiting
   - Add input validation
   - Use HTTPS only

## 🚀 Continuous Deployment

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        run: |
          # Add Railway deployment commands

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        run: |
          # Add Vercel deployment commands
```

## 📝 Post-Deployment Checklist

- [ ] Backend API accessible and returning data
- [ ] Frontend loads and connects to backend
- [ ] Database connection working
- [ ] Authentication flow working
- [ ] All features functional
- [ ] SSL certificates active
- [ ] Error monitoring setup
- [ ] Performance monitoring active

## 🆘 Troubleshooting

### Common Issues

1. **CORS Errors**

   - Ensure frontend URL is in CORS_ORIGINS
   - Check for trailing slashes

2. **Database Connection Issues**

   - Verify MongoDB Atlas IP whitelist
   - Check connection string format

3. **Build Failures**

   - Check Node.js version compatibility
   - Verify all dependencies installed

4. **Environment Variables**
   - Ensure all required variables are set
   - Check for typos in variable names

### Support

- Create issues on GitHub repository
- Check deployment platform documentation
- Review application logs for errors

---

**Happy Deploying! 🚀**
