# Render Backend Deployment Configuration

## Quick Setup Guide

### 1. Render Service Configuration

When creating your Web Service on Render:

**Basic Settings:**
- **Name**: `paychex-workflow-backend` (or your choice)
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: `backend`

**Build & Deploy:**
- **Runtime**: `Node`
- **Build Command**: `npm install; npm run build`
- **Start Command**: `npm start`

**Instance:**
- **Instance Type**: Free (or paid for better performance)

### 2. Environment Variables

Add these in Render Dashboard → Environment:

```
NODE_ENV=production
PORT=3001
JWT_SECRET=<generate-a-secure-random-string>
```

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. After Backend Deploys

Once your backend is live on Render (e.g., `https://paychex-workflow-backend.onrender.com`):

1. **Copy the Render URL**
2. **Update Vercel Environment Variable**:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Update `VITE_API_URL` to: `https://your-render-url.onrender.com/api`
   - Click "Save"
3. **Redeploy Frontend** in Vercel to pick up new API URL

### 4. Test Your Deployment

1. Test backend health check:
   ```bash
   curl https://your-render-url.onrender.com/health
   ```
   Should return: `{"status":"ok","message":"Server is running"}`

2. Visit your Vercel frontend URL
3. Try logging in with default credentials:
   - Email: `admin@workflow.com`
   - Password: `admin123`

### 5. Post-Deployment Security

**IMPORTANT - Do this immediately:**

1. Login to your deployed app
2. Navigate to User Management
3. Create a new admin user with a secure password
4. Delete or change the default admin password

### 6. Database Persistence Note

⚠️ **Important**: On Render's free tier, the filesystem is ephemeral. Your SQLite database will reset when the service restarts.

**Solutions:**
- **Upgrade to Paid Plan**: Get persistent disk storage
- **Use PostgreSQL**: Switch to Render's PostgreSQL database (recommended for production)
- **Accept the limitation**: Use for testing/demo only

### 7. CORS Configuration (Optional)

For production, you may want to restrict CORS to only your frontend domain.

Edit `backend/src/server.js`:

```javascript
// Replace this:
app.use(cors());

// With this:
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

Then add environment variable in Render:
```
FRONTEND_URL=https://your-vercel-app.vercel.app
```

### 8. Troubleshooting

**Build fails:**
- Check Render logs for specific error
- Verify all dependencies in `package.json`
- Ensure Node.js version compatibility

**Service crashes on start:**
- Check if `PORT` environment variable is set
- Review startup logs in Render dashboard
- Verify database initialization doesn't fail

**Database resets:**
- This is expected on free tier (ephemeral filesystem)
- Upgrade plan or migrate to PostgreSQL

**CORS errors:**
- Ensure backend URL is correctly set in Vercel's `VITE_API_URL`
- Check CORS configuration in `server.js`
- Verify frontend is redeployed after env var change

### 9. Current Configuration

Your backend is configured with:
- ✅ Express.js server
- ✅ SQLite database (sql.js)
- ✅ JWT authentication
- ✅ CORS enabled for all origins
- ✅ Health check endpoint at `/health`
- ✅ API endpoints at `/api/*`

### 10. Monitoring

**Render Dashboard provides:**
- Real-time logs
- Metrics (CPU, Memory)
- Deploy history
- Service events

**Check regularly:**
- Service uptime
- Error logs
- Database size (if using persistent storage)

---

## Quick Commands Reference

```bash
# Test backend health
curl https://your-backend.onrender.com/health

# Test login endpoint
curl -X POST https://your-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@workflow.com","password":"admin123"}'

# View backend logs (via Render CLI)
render logs -s paychex-workflow-backend
```

---

## Support

For Render-specific issues:
- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com/)
- [Render Status](https://status.render.com/)

For application issues:
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for general deployment guide
- Review application logs in Render dashboard
