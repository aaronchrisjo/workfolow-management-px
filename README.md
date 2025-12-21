# Workflow Management System

A Linear-inspired workflow management system for tracking and managing loads/tickets with role-based access control.

## Features

- **User Management**: Admin can create users with different roles (admin, allocator, employee)
- **Role-Based Access Control**:
  - **Admin**: Full access to all features
  - **Allocator**: Can create and assign loads to users
  - **Employee**: Can only view and update their assigned loads
- **Kanban Board**: Drag-and-drop interface for managing load statuses
- **Load Management**: Create, assign, and track loads/tickets
- **Dashboard**: Overview of all loads with statistics
- **Filtered Views**: View loads by status (paused, completed, etc.)

## Tech Stack

### Backend
- Node.js + Express
- SQLite (file-based database)
- JWT authentication
- bcryptjs for password hashing

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- @dnd-kit (drag-and-drop)
- Axios

## Project Structure

```
workflow-management/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── users.js
│   │   │   └── loads.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── database.js
│   │   └── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── KanbanBoard.tsx
│   │   │   ├── KanbanColumn.tsx
│   │   │   ├── LoadCard.tsx
│   │   │   ├── LoadManagement.tsx
│   │   │   ├── UserManagement.tsx
│   │   │   ├── PausedLoads.tsx
│   │   │   └── Layout.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── pages/
│   │   │   └── Login.tsx
│   │   ├── lib/
│   │   │   └── api.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. The `.env` file is already configured with default values:
```
PORT=3001
JWT_SECRET=your-secret-key-change-in-production-12345678
NODE_ENV=development
```

4. Start the backend server:
```bash
npm run dev
```

The server will start on `http://localhost:3001` and automatically:
- Initialize the SQLite database
- Create the required tables
- Create a default admin user

**Default Admin Credentials:**
- Email: `admin@workflow.com`
- Password: `admin123`

### Frontend Setup

1. Open a new terminal and navigate to the frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:5173` (or another port if 5173 is busy)

## Usage

### Login
1. Open `http://localhost:5173` in your browser
2. Use the default admin credentials to log in:
   - Email: `admin@workflow.com`
   - Password: `admin123`

### Creating Users (Admin Only)
1. Navigate to the "User Management" tab
2. Click "Create User"
3. Fill in the form with email, password, name, and role
4. Click "Create User"

### Creating Loads (Admin/Allocator)
1. Navigate to the "Allocations" tab
2. Click "Create Load"
3. Fill in client name, client number, status, and optionally assign to a user
4. Click "Create Load"

### Using the Kanban Board
1. Navigate to the "Kanban Tracker" tab
2. Drag and drop load cards between columns to update their status
3. Status changes are automatically saved to the database

### Dashboard
- View statistics for all loads
- See recent loads (Admin/Allocator)
- View assigned loads (Employee)

### Paused Loads
- View all loads with "paused" status
- Resume loads (Admin/Allocator)

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email and password
- `GET /api/auth/verify` - Verify JWT token

### Users
- `GET /api/users` - Get all users (Admin/Allocator)
- `GET /api/users/me` - Get current user info
- `POST /api/users` - Create new user (Admin only)
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

### Loads
- `GET /api/loads` - Get all loads (filtered by role)
- `GET /api/loads/status/:status` - Get loads by status
- `GET /api/loads/:id` - Get single load
- `POST /api/loads` - Create new load (Admin/Allocator)
- `PUT /api/loads/:id` - Update load
- `DELETE /api/loads/:id` - Delete load (Admin/Allocator)

## Database Schema

### Users Table
- `id` - Integer (Primary Key)
- `email` - Text (Unique)
- `password` - Text (Hashed)
- `name` - Text
- `role` - Text (admin, allocator, employee)
- `createdAt` - DateTime

### Loads Table
- `id` - Integer (Primary Key)
- `clientName` - Text
- `clientNumber` - Text
- `status` - Text (pending, in_progress, paused, completed, transferred)
- `assignedTo` - Integer (Foreign Key to Users)
- `createdBy` - Integer (Foreign Key to Users)
- `createdAt` - DateTime
- `updatedAt` - DateTime

## Role Permissions

| Feature | Admin | Allocator | Employee |
|---------|-------|-----------|----------|
| Create Users | ✓ | ✗ | ✗ |
| View All Users | ✓ | ✓ | ✗ |
| Create Loads | ✓ | ✓ | ✗ |
| Assign Loads | ✓ | ✓ | ✗ |
| View All Loads | ✓ | ✓ | ✗ |
| View Assigned Loads | ✓ | ✓ | ✓ |
| Update Load Status | ✓ | ✓ | ✓ (own only) |
| Delete Loads | ✓ | ✓ | ✗ |
| Kanban Board | ✓ | ✓ | ✓ (own only) |

## Production Deployment Notes

Before deploying to production:

1. **Change JWT Secret**: Update `JWT_SECRET` in `.env` to a strong, random string
2. **Database**: Consider migrating from SQLite to PostgreSQL or MySQL for better concurrency
3. **HTTPS**: Enable HTTPS on both frontend and backend
4. **Environment Variables**: Use proper environment variable management
5. **CORS**: Configure CORS to only allow your frontend domain
6. **Rate Limiting**: Add rate limiting to prevent abuse
7. **Input Validation**: Add more robust input validation
8. **Error Logging**: Implement proper error logging (e.g., Winston, Morgan)
9. **Build Frontend**: Run `npm run build` in frontend and serve static files

## Troubleshooting

### Backend won't start
- Ensure no other process is using port 3001
- Check that all dependencies are installed
- Verify Node.js version is 18+

### Frontend won't start
- Ensure no other process is using port 5173
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check that backend is running on port 3001

### Database issues
- Delete `backend/workflow.db` to reset the database
- Restart the backend server to recreate tables and default admin

### Authentication errors
- Clear browser localStorage
- Check that JWT_SECRET matches between requests
- Verify token hasn't expired (24-hour expiry)

## Future Enhancements

- Transfer load functionality (between users)
- Comments/notes on loads
- File attachments
- Activity history/audit log
- Email notifications
- Advanced filtering and search
- Export to CSV/PDF
- Mobile responsive improvements
- Dark mode

## License

MIT
