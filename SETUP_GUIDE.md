# Quick Setup Guide

This guide will help you get the workflow management system up and running in minutes.

## Prerequisites

- Node.js (v18 or higher) - [Download here](https://nodejs.org/)
- A terminal/command prompt
- A web browser

## Step 1: Install Dependencies

### Backend

Open a terminal in the project root directory and run:

```bash
cd backend
npm install
```

This will install all required backend dependencies.

### Frontend

Open a **new terminal** window (keep the first one for the backend) and run:

```bash
cd frontend
npm install
```

This will install all required frontend dependencies.

## Step 2: Start the Backend Server

In the first terminal (in the `backend` directory), run:

```bash
npm run dev
```

You should see:
```
Server running on http://localhost:3001
Environment: development
Database initialized successfully
Default admin user created:
  Email: admin@workflow.com
  Password: admin123
```

**Keep this terminal running!**

## Step 3: Start the Frontend

In the second terminal (in the `frontend` directory), run:

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

**Keep this terminal running too!**

## Step 4: Access the Application

1. Open your web browser
2. Go to `http://localhost:5173`
3. You'll see the login page

## Step 5: Login with Default Admin Account

Use these credentials:
- **Email**: `admin@workflow.com`
- **Password**: `admin123`

Click "Sign in"

## You're Done!

You should now see the dashboard. You can:

1. **Create Users** - Go to "User Management" tab (admin only)
2. **Create Loads** - Go to "Allocations" tab and click "Create Load"
3. **Use Kanban Board** - Go to "Kanban Tracker" and drag-and-drop loads between columns
4. **View Dashboard** - See statistics and recent loads

## Common Issues

### Backend won't start
- Make sure you're in the `backend` directory
- Make sure port 3001 is not in use by another application
- Check that Node.js is installed: `node --version`

### Frontend won't start
- Make sure you're in the `frontend` directory
- Make sure port 5173 is not in use
- Make sure the backend is running first

### Can't login
- Make sure both backend and frontend are running
- Try clearing your browser cache
- Use the exact credentials: `admin@workflow.com` / `admin123`

### Database reset
If you need to reset the database:
1. Stop the backend server (Ctrl+C)
2. Delete `backend/workflow.db`
3. Restart the backend server

The default admin user will be recreated automatically.

## Next Steps

1. Create additional users with different roles (allocator, employee)
2. Create some test loads
3. Assign loads to users
4. Try dragging loads on the Kanban board
5. Test different views (Dashboard, Paused Loads, etc.)

## Development Tips

- The backend runs on port 3001
- The frontend runs on port 5173
- Both servers support hot-reload (changes are reflected automatically)
- Database file is at `backend/workflow.db`
- Check console/terminal for any error messages

## Production Deployment

For production deployment, see the main README.md file for security considerations and build instructions.

## Need Help?

- Check the main README.md for detailed documentation
- Review the API endpoints section
- Check terminal/console for error messages
