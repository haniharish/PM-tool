# Project Management Web Application

A full-stack Project Management application with **React (Vite)** frontend and **Node.js + Express + MongoDB** backend. Features JWT authentication, role-based access (Admin / Team Member), task management, Kanban board, calendar view, progress tracking, and team management.

---

## Folder Structure

```
PEP PROJECT/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js              # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── authController.js   # Register, login, getMe
│   │   │   ├── taskController.js  # CRUD + status update for tasks
│   │   │   └── userController.js  # Users list, add member, workload stats
│   │   ├── middleware/
│   │   │   └── auth.js            # JWT protect + adminOnly
│   │   ├── models/
│   │   │   ├── User.js            # User schema (name, email, password, role)
│   │   │   └── Task.js            # Task schema (title, status, priority, assignedTo, dueDate)
│   │   ├── routes/
│   │   │   ├── authRoutes.js      # POST /register, /login, GET /me
│   │   │   ├── taskRoutes.js      # /tasks CRUD + PATCH :id/status
│   │   │   └── userRoutes.js      # GET/POST /users, GET /users/stats, GET /users/:id/tasks
│   │   ├── scripts/
│   │   │   └── seed.js            # Sample users and tasks
│   │   └── server.js              # Express app entry
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── KanbanBoard.jsx    # Kanban columns + drop zones
│   │   │   ├── KanbanCard.jsx     # Draggable task card
│   │   │   ├── Layout.jsx         # Sidebar + navbar + dark mode
│   │   │   ├── ProtectedRoute.jsx # Auth + admin guard
│   │   │   ├── TaskModal.jsx      # Create/Edit task form
│   │   │   └── UserModal.jsx      # Add team member (Admin)
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Auth state + login/register/logout
│   │   ├── pages/
│   │   │   ├── Calendar.jsx       # FullCalendar monthly + date click tasks
│   │   │   ├── Dashboard.jsx     # Stats cards + progress + recent tasks
│   │   │   ├── Kanban.jsx        # Drag-and-drop board
│   │   │   ├── Login.jsx
│   │   │   ├── Progress.jsx      # Recharts (pie + bar) + progress bars
│   │   │   ├── Signup.jsx
│   │   │   ├── Tasks.jsx         # Table + add/edit/delete
│   │   │   └── Team.jsx          # Team list + add member + workload (Admin)
│   │   ├── services/
│   │   │   └── api.js            # Axios instance + auth/tasks/users APIs
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## Tech Stack

| Layer    | Tech |
|----------|------|
| Frontend | React 18, Vite, React Router, Axios, Tailwind CSS, Recharts, React DnD, FullCalendar |
| Backend  | Node.js, Express, MongoDB, Mongoose, JWT, Bcrypt |

---

## Database Schema

### User
| Field    | Type     | Notes                    |
|----------|----------|--------------------------|
| name     | String   | required                 |
| email    | String   | required, unique         |
| password | String   | required, hashed (bcrypt)|
| role     | String   | `admin` \| `team_member` |
| avatar   | String   | optional                 |
| timestamps | Boolean | createdAt, updatedAt  |

### Task
| Field      | Type     | Notes                          |
|------------|----------|--------------------------------|
| title      | String   | required                       |
| description| String   | optional                       |
| status     | String   | `todo` \| `in_progress` \| `completed` |
| priority   | String   | `low` \| `medium` \| `high` \| `critical` |
| dueDate    | Date     | optional                       |
| assignedTo | ObjectId | ref User, optional             |
| createdBy  | ObjectId | ref User, required             |
| order      | Number   | for Kanban ordering            |
| timestamps | Boolean  | createdAt, updatedAt           |

---

## API Routes

| Method | Route | Auth | Description |
|--------|--------|------|-------------|
| POST   | /api/auth/register | No  | Register user |
| POST   | /api/auth/login   | No  | Login, returns JWT |
| GET    | /api/auth/me      | Yes | Current user |
| GET    | /api/tasks        | Yes | List tasks (filtered by role) |
| GET    | /api/tasks/:id    | Yes | Get one task |
| POST   | /api/tasks        | Yes | Create task |
| PUT    | /api/tasks/:id    | Yes | Update task |
| PATCH  | /api/tasks/:id/status | Yes | Update status/order (Kanban) |
| DELETE | /api/tasks/:id    | Yes | Delete task |
| GET    | /api/users        | Admin | List all users |
| POST   | /api/users        | Admin | Add team member |
| GET    | /api/users/stats  | Yes | Workload distribution |
| GET    | /api/users/:id/tasks | Yes | Tasks assigned to user |

---

## Installation

### Prerequisites
- **Node.js** (v18+)
- **MongoDB** (local or Atlas)

### Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/project-management
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development
```

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env` (optional, for custom API URL):

```
VITE_API_URL=http://localhost:5000/api
```

If you omit this, Vite proxy will forward `/api` to `http://localhost:5000` (see `vite.config.js`).

---

## How to Run Locally

1. **Start MongoDB** (if local):
   ```bash
   mongod
   ```

2. **Seed sample data** (optional):
   ```bash
   cd backend
   npm run seed
   ```
   This creates:
   - **Admin:** `admin@project.com` / `admin123`
   - **Team members:** `john@project.com` / `member123`, `jane@project.com` / `member123`
   - Sample tasks assigned to them.

3. **Start backend:**
   ```bash
   cd backend
   npm run dev
   ```
   Server runs at `http://localhost:5000`.

4. **Start frontend:**
   ```bash
   cd frontend
   npm run dev
   ```
   App runs at `http://localhost:5173`.

5. Open `http://localhost:5173`, sign up or log in with the seed accounts.

---

## Sample Dummy Data (Seed)

After `npm run seed` in `backend`:

| Email              | Password  | Role        |
|--------------------|-----------|-------------|
| admin@project.com  | admin123  | Admin       |
| john@project.com   | member123 | Team Member |
| jane@project.com   | member123 | Team Member |

Sample tasks include: "Setup project repository", "Design database schema", "Implement auth API", "Build dashboard UI", "Add Kanban board", "Calendar integration", "Write documentation" with mixed statuses (todo, in progress, completed) and due dates.

---

## Features Summary

- **Authentication:** Login, Signup, JWT, protected routes, Admin vs Team Member.
- **Dashboard:** Stats cards, overall progress bar, recent tasks, quick links.
- **Tasks:** Add, edit, delete; assign to member; due date; priority (Low/Medium/High/Critical); status (Todo/In Progress/Completed).
- **Kanban:** Drag-and-drop columns (Todo, In Progress, Completed) with React DnD.
- **Calendar:** Monthly view (FullCalendar), tasks on dates, click date to see list, click event to edit.
- **Progress:** Your progress %, team progress %, pie charts (status, priority), workload bar chart (Admin).
- **Team (Admin only):** Add team members, view assigned tasks, workload distribution per user.
- **UI:** Tailwind, blue/purple gradient theme, dark mode toggle, responsive sidebar + navbar, card layout, smooth animations.

---

## Production Notes

- Set strong `JWT_SECRET` and secure `MONGODB_URI`.
- Build frontend: `cd frontend && npm run build`; serve `dist` with your preferred server (e.g. Nginx, or Express static).
- In production, set backend `FRONTEND_URL` (CORS) and frontend `VITE_API_URL` to your deployed API URL.
