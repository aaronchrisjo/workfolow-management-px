# Deployment Guide - Workflow Management System

This guide covers deploying the Workflow Management System to production.

## Architecture

- **Frontend**: React + Vite → Deploy to Vercel
- **Backend**: Supabase (managed database + auth)

---

## Prerequisites

- GitHub account
- Vercel account (free tier works)
- Supabase project (already set up)

---

## Frontend Deployment (Vercel)

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

5. **Add Environment Variables**:
   - Click "Environment Variables"
   - Add variables:
     - **Name**: `VITE_SUPABASE_URL`
     - **Value**: Your Supabase project URL
     - **Name**: `VITE_SUPABASE_ANON_KEY`
     - **Value**: Your Supabase anon key

6. Click "Deploy"

### Step 3: Configure Supabase Auth Redirect

After deployment, update Supabase to allow your Vercel domain:

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your Vercel URL to "Site URL" and "Redirect URLs"

---

## Supabase Configuration

### Required Tables

Ensure your Supabase project has these tables configured:

#### Users Table
- `id` - UUID (Primary Key)
- `email` - Text (Unique)
- `name` - Text
- `role` - Text (admin, allocator, employee)
- `created_at` - Timestamp

#### Loads Table
- `id` - UUID (Primary Key)
- `client_name` - Text
- `client_number` - Text
- `status` - Text (pending, in_progress, paused, completed, transferred)
- `assigned_to` - UUID (Foreign Key to Users)
- `created_by` - UUID (Foreign Key to Users)
- `created_at` - Timestamp
- `updated_at` - Timestamp

### Row Level Security (RLS)

Configure RLS policies based on user roles for proper access control.

---

## Environment Variables Reference

### Frontend (.env)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Post-Deployment Steps

1. **Test the Application**:
   - Visit your Vercel frontend URL
   - Login with admin credentials
   - Test all features

2. **Create Admin User** (if not already done):
   - Use Supabase Dashboard to create initial admin user
   - Or use the app's sign-up flow if enabled

3. **Monitor**:
   - Check Vercel logs for frontend errors
   - Check Supabase Dashboard for database/auth issues

---

## Troubleshooting

### Frontend can't connect to Supabase
- Verify environment variables are correctly set in Vercel
- Check Supabase project is active and accessible
- Verify RLS policies allow the required operations

### Authentication issues
- Ensure Vercel domain is added to Supabase redirect URLs
- Check Supabase auth settings
- Clear browser localStorage and try again

### CORS errors
- Supabase handles CORS automatically
- Ensure you're using the correct Supabase URL

---

## Security Recommendations

1. **Use Strong Passwords** for all admin accounts
2. **Configure RLS** properly in Supabase
3. **Enable MFA** in Supabase for admin users (optional)
4. **Monitor Auth Logs** in Supabase Dashboard
5. **Regular Security Reviews** of RLS policies

---

## Quick Deploy Commands

### Deploy Frontend to Vercel (CLI)
```bash
cd frontend
npm install -g vercel
vercel login
vercel --prod
```

---

## Support

For issues:
- Check Vercel logs for frontend errors
- Check Supabase Dashboard for database/auth issues
- Review browser console for client-side errors

---

**Production Checklist**:
- [ ] Frontend deployed to Vercel
- [ ] Supabase environment variables configured
- [ ] Supabase redirect URLs updated
- [ ] Admin user created with secure password
- [ ] RLS policies configured
- [ ] Application tested end-to-end
