# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**Randevu Yönetim Sistemi** — A multi-tenant appointment management SaaS platform for service businesses (barbers, beauty salons, psychologists, etc.). Customers book and pay online; businesses manage calendars and staff; admins oversee the platform.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js (App Router), Tailwind CSS, shadcn/ui |
| State | Zustand + React Query (server state) |
| Forms | React Hook Form + Zod |
| Backend | Node.js + Express.js |
| ORM | Prisma |
| Database | PostgreSQL |
| Cache | Redis |
| Auth | JWT (access 15 min / refresh 7 days, HttpOnly cookies) |
| Payments | Stripe (global) + iyzico (TR) |
| File Storage | Cloudinary |
| Email | SendGrid |
| SMS | Twilio |
| Push | Firebase Cloud Messaging |
| Maps | Google Maps API |
| Calendar UI | FullCalendar |
| Charts | Recharts |
| Containerization | Docker + Docker Compose |

---

## Development Commands

### Docker (primary workflow)
```bash
# Start all services (db, redis, backend, frontend)
docker compose up

# Start in background
docker compose up -d

# Rebuild after dependency changes
docker compose up --build

# Stop all
docker compose down

# Destroy volumes (full reset)
docker compose down -v

# View logs
docker compose logs -f backend
docker compose logs -f frontend
```

### Backend (inside container or locally)
```bash
# Run migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Seed database
npm run db:seed

# Run tests
npm test

# Run single test file
npm test -- --testPathPattern=appointments

# Lint
npm run lint
```

### Frontend (inside container or locally)
```bash
npm run dev        # dev server
npm run build      # production build
npm run lint       # ESLint
npm test           # Jest + React Testing Library
npm run test:e2e   # Playwright / Cypress
```

---

## Docker Architecture

The `docker-compose.yml` defines these services:

| Service | Port | Description |
|---|---|---|
| `postgres` | 5432 | PostgreSQL database |
| `redis` | 6379 | Cache + Bull job queue |
| `backend` | 3001 | Express API |
| `frontend` | 3000 | Next.js app |

Environment variables are loaded from `.env` (never committed). Use `.env.example` as the template.

---

## Architecture Overview

### User Roles
- **Admin** — full platform control, business approvals, financial reports
- **Business** (owner/manager) — manages own staff, services, schedule, reports
- **Staff** — views own calendar, manages availability, adds customer notes
- **Customer** — searches businesses, books appointments, pays online, reviews

### Core Domain Model (Prisma / PostgreSQL)

```
Users ──< Businesses ──< Staff ──< Appointments >── Services
                     ──< Services                       │
                     ──< BusinessHours                  │
                     ──< CancellationPolicies           │
                                                        │
Users (customers) ──────────────────────────>──────────┘
                  ──< Reviews
                  ──< Favorites
                  ──< LoyaltyPoints / LoyaltyTransactions / CustomerTiers
                  ──< Notifications / NotificationPreferences
```

Key constraints:
- **Concurrency lock** required when creating appointments to prevent double-booking the same staff+slot.
- All datetimes stored in **UTC**; convert to user timezone on display.
- Credit card data is never stored — Stripe/iyzico tokenization only.

### Appointment Status Machine
```
pending → confirmed → started → completed
       ↘ cancelled_by_customer
       ↘ cancelled_by_business
       → no_show
```

### API Structure (`/api/*`)
- `/auth/*` — register, login, logout, token refresh, email/phone verify, password reset
- `/businesses/*` — CRUD, services, staff, reviews, available-slots
- `/appointments/*` — CRUD + status transitions (confirm, start, complete, no-show)
- `/payments/*` — Stripe/iyzico intent, confirm, refund
- `/reviews/*` — CRUD + business response
- `/loyalty/*` — points balance, transactions, tier, redeem
- `/notifications/*` — list, mark-read, preferences
- `/reports/*` — revenue, appointments, staff-performance, customer-insights
- `/admin/*` — business approval/suspension, user management, platform reports
- `/search/*` — businesses and services with geo + filter support

### Slot Availability Algorithm
Available slots for a booking are computed by:
1. Fetching staff working hours for the selected day
2. Subtracting confirmed/pending appointments for that staff
3. Subtracting staff breaks and business holidays
4. Returning `duration`-minute windows that fit within remaining gaps

### Background Jobs (Bull + Redis)
- Appointment reminders (24h and 1h before)
- Automatic no-show marking (post-appointment-time)
- Loyalty point expiry
- Scheduled reports (monthly email to businesses)
- Image resize/optimization after upload

---

## Important Implementation Rules

1. **Double-booking prevention** — use a database-level transaction with `SELECT ... FOR UPDATE` or Prisma's `$transaction` when creating appointments.
2. **Cancellation enforcement** — check `CancellationPolicies.hours_before_appointment` before allowing cancel; disable the cancel action in UI if past the deadline.
3. **Refund logic** — maps to refund percentage from `CancellationPolicies`; business-initiated cancels always trigger 100% refund.
4. **Rate limiting** — 100 req/min per user on all API routes; stricter on `/auth/*`.
5. **File uploads** — validate type (images only), max 5MB, resize to standard dimensions before Cloudinary upload.
6. **Cache strategy** — Redis cache for business listings, categories, and available-slot queries. Invalidate on any write to those entities.
7. **Commission** — automatically deducted at payment confirmation time; stored in `Payments.commission_amount`.

---

## Key Design Decisions

- **Next.js App Router** for the frontend enables per-page SSR/SSG for SEO-critical pages (business listings, individual business pages) while keeping the booking flow client-side.
- **Prisma** as ORM with PostgreSQL — use `prisma migrate dev` during development; `prisma migrate deploy` in Docker entrypoint for production.
- **Slug-based business URLs** (`/businesses/:slug`) for SEO. Slugs are unique and set at creation.
- **PWA support** via `next-pwa` — manifest and service worker configured in Next.js.
- **RBAC middleware** — a single Express middleware reads JWT role and attaches permissions; route handlers check ownership (e.g., a business owner can only access their own data).

---

## Design System

- **Primary:** `#2563EB` (blue)
- **Accent:** `#F59E0B` (amber)
- **Success:** `#10B981` | **Error:** `#EF4444` | **Warning:** `#F59E0B`
- **Font:** Inter (body + headings)
- Typography scale: H1 32px / H2 24px / H3 20px / Body 16px / Small 14px
- All interactive touch targets minimum 44×44px (mobile)

---

## MVP Scope (Phase 1)

Build these first; everything else is Phase 2+:
- Auth (register/login/JWT)
- Customer: business search → service select → book → pay → view/cancel appointments
- Business: profile setup, services, staff, working hours, appointment approval/cancel
- Admin: business approval, basic reporting
- Email notifications
- Stripe payment integration
