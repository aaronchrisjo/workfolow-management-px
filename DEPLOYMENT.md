# Deployment Guide - Paychex Workflow Manager

This guide covers deploying the Paychex Workflow Manager to production.

## Architecture

- **Frontend**: React + Vite → Deploy to Vercel
- **Backend**: Node.js + Express → Deploy to Render, Railway, or similar
- **Database**: SQLite (file-based, persisted on backend server)

---

## Frontend Deployment (Vercel)

### Prerequisites
- GitHub account
- Vercel account (free tier works)
- Backend deployed and accessible via URL

### Step 1: Push to GitHub
Your code is already pushed to: `https://github.com/aaronchrisjo/workfolow-management-px`

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository: `aaronchrisjo/workfolow-management-px`
4. **Configure Project Settings**:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. **Add Environment Variable**:
   - Click "Environment Variables"
   - Add variable:
     - **Name**: `VITE_API_URL`
     - **Value**: `https://your-backend-url.com/api` (replace with your actual backend URL)

6. Click "Deploy"

### Step 3: Update Environment Variable After Backend Deployment
Once your backend is deployed, update the `VITE_API_URL` in Vercel:
1. Go to your project settings in Vercel
2. Navigate to "Environment Variables"
3. Update `VITE_API_URL` with your backend URL
4. Redeploy your frontend

---

## Backend Deployment Options

### Option 1: Render (Recommended - Free Tier Available)

1. Go to [render.com](https://render.com) and sign in
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. **Configure**:
   - **Name**: `paychex-workflow-backend`
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (or paid for better performance)

5. **Add Environment Variables**:
   - `NODE_ENV=production`
   - `PORT=3001`
   - `JWT_SECRET=your-super-secret-jwt-key-change-this-in-production`

6. Click "Create Web Service"
7. Copy the deployed URL (e.g., `https://paychex-workflow-backend.onrender.com`)
8. Update frontend's `VITE_API_URL` to: `https://paychex-workflow-backend.onrender.com/api`

**Note**: Render's free tier spins down after inactivity. First request may be slow.

### Option 2: Railway

1. Go to [railway.app](https://railway.app) and sign in
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. **Configure**:
   - **Root Directory**: `/backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

5. **Add Environment Variables** (same as Render)
6. Deploy and copy the URL
7. Update frontend's `VITE_API_URL`

### Option 3: Heroku

1. Install Heroku CLI: `npm install -g heroku`
2. Login: `heroku login`
3. Create app: `heroku create paychex-workflow-backend`
4. Set buildpack: `heroku buildpacks:set heroku/nodejs`
5. Deploy:
   ```bash
   cd backend
   git init
   heroku git:remote -a paychex-workflow-backend
   git add .
   git commit -m "Deploy backend"
   git push heroku main
   ```
6. Set environment variables:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-secret-key
   ```

---

## Database Persistence

The SQLite database is stored as a file (`workflow.db`) on the backend server.

**Important**:
- On platforms like Render/Railway, the filesystem is ephemeral (resets on restart)
- For production, consider:
  - Using a persistent volume (available on paid plans)
  - Migrating to PostgreSQL or MySQL for better persistence
  - Using a managed database service

---

## Environment Variables Reference

### Frontend (.env)
```env
VITE_API_URL=https://your-backend-url.com/api
```

### Backend (.env)
```env
NODE_ENV=production
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

---

## Post-Deployment Steps

1. **Test the Application**:
   - Visit your Vercel frontend URL
   - Login with default credentials:
     - Email: `admin@workflow.com`
     - Password: `admin123`
   - Create additional users
   - Test all features

2. **Create a New Admin User**:
   - Login with default admin account
   - Create a new admin user with secure credentials
   - Delete or change the default admin password

3. **Monitor**:
   - Check Vercel logs for frontend errors
   - Check backend platform logs for API errors

---

## Troubleshooting

### Frontend can't connect to backend
- Verify `VITE_API_URL` is correct in Vercel
- Check CORS settings in backend (`src/server.js`)
- Ensure backend is running and accessible

### Backend database resets
- Backend platform may have ephemeral filesystem
- Upgrade to plan with persistent storage
- Or migrate to managed database (PostgreSQL)

### 401 Unauthorized errors
- Check JWT_SECRET is set correctly on backend
- Clear browser localStorage and login again

---

## Security Recommendations

1. **Change Default Admin Password** immediately after deployment
2. **Use Strong JWT_SECRET** (generate with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)
3. **Enable HTTPS** (Vercel provides this automatically)
4. **Set up rate limiting** on backend API
5. **Regular backups** of the database file

---

## Quick Deploy Commands

### Deploy Frontend to Vercel (CLI)
```bash
cd frontend
npm install -g vercel
vercel login
vercel --prod
```

### Deploy Backend to Render (via GitHub)
- Push to GitHub
- Connect repository in Render dashboard
- Configure as described above

---

## Support

For issues or questions:
- Check application logs in Vercel/Render dashboard
- Review browser console for frontend errors
- Check backend API logs for server errors

---

**Production Checklist**:
- [ ] Backend deployed and running
- [ ] Frontend deployed to Vercel
- [ ] `VITE_API_URL` configured correctly
- [ ] Default admin password changed
- [ ] JWT_SECRET set to secure random string
- [ ] Database persistence configured (if needed)
- [ ] CORS configured for production domain
- [ ] Application tested end-to-end
