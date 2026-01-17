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
- **Employee Allocation Stats**: View workload distribution per employee
- **Export to Excel**: Export load data to XLSX format
- **Filtered Views**: View loads by status (paused, completed, transferred, etc.)

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- @dnd-kit (drag-and-drop)
- Axios
- xlsx (Excel export)

### Backend
- Supabase (Database + Authentication)

## Project Structure

```
workflow-management/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── EmployeeAllocationStats.tsx
│   │   │   ├── ExportLoadsButton.tsx
│   │   │   ├── KanbanBoard.tsx
│   │   │   ├── KanbanColumn.tsx
│   │   │   ├── LoadCard.tsx
│   │   │   ├── LoadManagement.tsx
│   │   │   ├── UserManagement.tsx
│   │   │   ├── PausedLoads.tsx
│   │   │   ├── TransferredLoads.tsx
│   │   │   └── Layout.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── pages/
│   │   │   └── Login.tsx
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   ├── supabase.ts
│   │   │   └── exportLoads.ts
│   │   ├── hooks/
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vercel.json
│   └── vite.config.ts
├── README.md
├── DEPLOYMENT.md
└── SETUP_GUIDE.md
```

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase account and project

### Frontend Setup

1. Navigate to the frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables - create `.env` file:
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Start the development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## Usage

### Login
1. Open `http://localhost:5173` in your browser
2. Login with your Supabase-configured admin credentials

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
3. Status changes are automatically saved to Supabase

### Exporting Loads
- Use the Export button to download load data as an Excel file

### Dashboard
- View statistics for all loads
- See recent loads (Admin/Allocator)
- View assigned loads (Employee)
- View employee allocation statistics

### Filtered Views
- **Paused Loads**: View all loads with "paused" status
- **Transferred Loads**: View all loads that have been transferred

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
| Export Loads | ✓ | ✓ | ✗ |

## Production Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## Troubleshooting

### Frontend won't start
- Ensure no other process is using port 5173
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Verify environment variables are set correctly

### Authentication errors
- Clear browser localStorage
- Verify Supabase credentials in `.env`
- Check Supabase dashboard for auth issues

### Supabase connection issues
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
- Check Supabase project status in dashboard
- Ensure RLS policies are configured correctly

## Future Enhancements

- Comments/notes on loads
- File attachments
- Activity history/audit log
- Email notifications
- Advanced filtering and search
- Export to PDF
- Mobile responsive improvements
- Dark mode

## License

MIT
