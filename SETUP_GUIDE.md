# Quick Setup Guide

This guide will help you get the workflow management system up and running in minutes.

## Prerequisites

- Node.js (v18 or higher) - [Download here](https://nodejs.org/)
- A terminal/command prompt
- A web browser
- Supabase account with a configured project

## Step 1: Configure Supabase

### Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign in
2. Create a new project
3. Note your **Project URL** and **anon/public API key** from Settings → API

### Set Up Database Tables
Create the required tables in Supabase SQL Editor or Table Editor:

**Users table** and **Loads table** with appropriate columns (see DEPLOYMENT.md for schema)

## Step 2: Install Dependencies

Open a terminal in the project root directory and run:

```bash
cd frontend
npm install
```

This will install all required frontend dependencies.

## Step 3: Configure Environment Variables

Create a `.env` file in the `frontend` directory:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Replace the values with your actual Supabase credentials.

## Step 4: Start the Frontend

In the terminal (in the `frontend` directory), run:

```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

**Keep this terminal running!**

## Step 5: Access the Application

1. Open your web browser
2. Go to `http://localhost:5173`
3. You'll see the login page

## Step 6: Login

Use your Supabase-configured admin credentials to log in.

## You're Done!

You should now see the dashboard. You can:

1. **Create Users** - Go to "User Management" tab (admin only)
2. **Create Loads** - Go to "Allocations" tab and click "Create Load"
3. **Use Kanban Board** - Go to "Kanban Tracker" and drag-and-drop loads between columns
4. **View Dashboard** - See statistics and recent loads
5. **Export Data** - Export loads to Excel format
6. **View Transferred Loads** - See all transferred items

## Common Issues

### Frontend won't start
- Make sure you're in the `frontend` directory
- Make sure port 5173 is not in use
- Check that Node.js is installed: `node --version`

### Can't login
- Verify your Supabase credentials in `.env`
- Check Supabase Dashboard for auth configuration
- Try clearing your browser cache

### Supabase connection errors
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
- Check if Supabase project is active
- Verify RLS policies allow access

### Data not loading
- Check browser console for errors
- Verify Supabase RLS policies are configured
- Check Supabase Dashboard for any issues

## Development Tips

- The frontend runs on port 5173
- The server supports hot-reload (changes are reflected automatically)
- Check browser console and terminal for any error messages
- Use Supabase Dashboard to view/edit data directly

## Production Deployment

For production deployment, see [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## Need Help?

- Check the main [README.md](README.md) for detailed documentation
- Review Supabase documentation at [supabase.com/docs](https://supabase.com/docs)
- Check browser console for error messages
