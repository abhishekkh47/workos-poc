# WorkOS AuthKit POC

A full-stack proof-of-concept implementing WorkOS AuthKit for user authentication, with email/password, Google OAuth, and GitHub OAuth support.

## Stack

| Layer    | Technology                      |
| -------- | ------------------------------- |
| Frontend | React 19 + TypeScript + Vite + TailwindCSS v4 |
| Backend  | Node.js + Express + TypeScript  |
| Auth     | WorkOS AuthKit                  |
| Database | PostgreSQL (via Sequelize ORM)  |
| Session  | HTTP-only JWT cookie            |

---

## Project Structure

```
workos-poc/
├── package.json          # Root npm workspaces
├── backend/
│   ├── src/
│   │   ├── index.ts      # Express entrypoint
│   │   ├── config/       # env, db, workos, knexfile
│   │   ├── routes/       # auth.ts, user.ts
│   │   ├── middleware/   # requireAuth.ts
│   │   └── models/       # user.ts
│   │   # No migrations folder — Sequelize syncs the schema automatically
└── frontend/
    └── src/
        ├── pages/        # LoginPage, DashboardPage
        ├── context/      # AuthContext
        └── components/   # ProtectedRoute
```

---

## Prerequisites

- Node.js >= 18
- npm >= 9
- PostgreSQL running at `192.168.1.100` with a `workos_poc` database
- A [WorkOS account](https://dashboard.workos.com/) with AuthKit enabled

---

## Step 1 — WorkOS Dashboard Configuration

Before running the app, configure the following in the [WorkOS Dashboard](https://dashboard.workos.com/):

### Redirect URI
Go to **Authentication → Redirects** and add:
```
http://localhost:3001/auth/callback
```

### Sign-out Redirect
In the same section, set the sign-out redirect to:
```
http://localhost:5173
```

### Sign-in Endpoint
Set the sign-in endpoint to:
```
http://localhost:3001/auth/login
```

### Social Connections (Google & GitHub)
Go to **Authentication → Social Login** and enable:
- **Google OAuth** — requires a Google Cloud OAuth app (Client ID + Secret)
- **GitHub OAuth** — requires a GitHub OAuth app (Client ID + Secret)

Follow the [WorkOS Social Login docs](https://workos.com/docs/sso/social-login) for setup steps.

---

## Step 2 — Environment Variables

Copy the example env file and fill in your values:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
WORKOS_API_KEY=sk_...          # From WorkOS Dashboard → API Keys
WORKOS_CLIENT_ID=client_...    # From WorkOS Dashboard → Configuration
SESSION_SECRET=<random_string> # Any long random string, e.g. openssl rand -hex 32
DATABASE_URL=postgresql://user:password@192.168.1.100:5432/workos_poc
FRONTEND_URL=http://localhost:5173
PORT=3001
```

---

## Step 3 — Install Dependencies

From the project root:

```bash
npm install
```

This installs dependencies for both `backend` and `frontend` workspaces.

---

## Step 4 — Start the App

```bash
npm run dev
```

On first start, Sequelize will automatically create the `users` table in your PostgreSQL database (using `sync({ alter: true })`). No manual migration step needed.

This starts both servers concurrently:
- **Backend** → http://localhost:3001
- **Frontend** → http://localhost:5173

Open http://localhost:5173 in your browser.

---

## Authentication Flow

```
/login page
  └─▶ Click "Continue with Email / Google / GitHub"
        └─▶ GET /auth/login  (backend generates WorkOS auth URL)
              └─▶ Redirect to WorkOS Hosted UI
                    └─▶ User authenticates
                          └─▶ WorkOS redirects to GET /auth/callback?code=xxx
                                └─▶ Backend exchanges code for user
                                      └─▶ User upserted into PostgreSQL
                                            └─▶ JWT stored in HTTP-only cookie
                                                  └─▶ Redirect to /dashboard
```

---

## API Endpoints

| Method | Route            | Auth required | Description                          |
| ------ | ---------------- | ------------- | ------------------------------------ |
| GET    | `/auth/login`    | No            | Redirect to WorkOS hosted login      |
| GET    | `/auth/callback` | No            | OAuth callback — exchange code       |
| POST   | `/auth/logout`   | No            | Clear session cookie                 |
| GET    | `/api/me`        | Yes           | Return current user from DB          |
| GET    | `/health`        | No            | Health check                         |

---

## Database Schema

```sql
CREATE TABLE users (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workos_id           VARCHAR(255) UNIQUE NOT NULL,
  email               VARCHAR(255) UNIQUE NOT NULL,
  first_name          VARCHAR(255),
  last_name           VARCHAR(255),
  profile_picture_url VARCHAR(1024),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);
```
