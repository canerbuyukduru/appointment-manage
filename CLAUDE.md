# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

**BeautyBook** — a full-stack beauty center appointment management system. Three roles: customers book appointments, owners manage their business, admins oversee registrations.

UI text, comments, and error messages are in **Turkish**.

## Commands

### Backend
```bash
cd backend
npm run dev       # Development with nodemon
npm start         # Production
```

### Frontend
```bash
cd frontend
npm run dev       # Next.js dev with Turbopack
npm run build     # Production build
npm run lint      # ESLint
```

### Full Stack (Docker)
```bash
docker-compose up --build
```

No test suite is configured.

## Architecture

### Stack
- **Backend:** Node.js + Express 5, MongoDB + Mongoose, JWT in HttpOnly cookies
- **Frontend:** Next.js 15 (App Router), React 19, Redux Toolkit + RTK Query, Tailwind CSS 4

### Backend Structure
`backend/index.js` is the entry point. The backend follows MVC:
- `controllers/` — business logic (9 controllers)
- `models/` — Mongoose schemas (User, BeautyCenter, Appointment, Department, Service, Comment)
- `routes/` — Express routers mounted at `/api/*`
- `middleware/` — `authenticate.js` (JWT validation), `authorizeAdmin.js`, `authorizeOwner.js`, `asyncHandler.js`
- `services/` — `cronService.js` (appointment reminders + cleanup via node-cron), `emailService.js` (Nodemailer/Gmail)

All async controller functions are wrapped with `asyncHandler` for consistent error propagation.

### Frontend Structure
`frontend/app/` uses Next.js App Router. Pages:
- `/` — homepage, beauty center discovery
- `/login`, `/register` — auth
- `/dashboard` — user appointment history
- `/owner/*` — owner portal (dashboard, appointments, beauty-center, departments)
- `/admin/*` — admin panel
- `/centers/[id]` — center detail + booking

Redux store in `frontend/lib/store.js`. The `auth` slice is persisted to localStorage via redux-persist. All API calls go through RTK Query services in `frontend/lib/services/` (one file per domain: `authApi`, `adminApi`, `beautyCenterApi`, `departmentApi`, `serviceApi`, `appointmentApi`, `commentApi`). All requests use `credentials: 'include'` for cookie-based auth.

`frontend/components/ProtectedRoute.jsx` guards pages requiring authentication.

### Auth Flow
1. Login/register → JWT issued and stored in HttpOnly secure cookie
2. `authenticate` middleware validates cookie on every protected route
3. Decoded `userId` is used to load `req.user` (password excluded)
4. Role gates: `authorizeAdmin` and `authorizeOwner` middleware run after `authenticate`

### Key Data Relationships
```
User (role: owner) → BeautyCenter → Departments → Services
User (role: user)  → Appointments → (BeautyCenter, Department, Service snapshot)
```

Appointments store an immutable snapshot of service data at booking time. Appointment statuses: `pending → approved | rejected`, `approved → cancelled | completed | no-show`.

### Required Environment Variables

**backend/.env**
```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/beauty-center
JWT_SECRET=
EMAIL_USER=
EMAIL_PASS=       # Gmail app password
EMAIL_SERVICE=gmail
FRONTEND_URL=http://localhost:3000
```

**frontend/.env.local**
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Rate Limiting
- Login: 5 attempts / 15 min
- Register: 3 attempts / hour
- General: 100 requests / 15 min

Limits are enforced on the backend via `express-rate-limit` with `trust proxy` enabled.
