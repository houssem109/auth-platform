🚀 Authorization Platform (RBAC + ABAC + Automation)
Full-stack security platform with Role-Based Access Control, Attribute-Based Access Control, Metrics, Automation, CSV Import, System Errors, Reports, and DevOps CI/CD.
This repository contains three parts:
/backend            → Express + Prisma + PostgreSQL API
/frontend           → Next.js 14 dashboard
/docker-compose.yml → Full environment runner

📌 1. Project Architecture
authorization-platform/
│── backend/       # Node.js + Express API
│── frontend/      # Next.js dashboard
│── docker-compose.yml
│── README.md (this file)

Back-end communicates with PostgreSQL (via Prisma).
Front-end communicates with the API through axios and uses x-user-email for authentication.


📦 2. Technologies Used
Backend

Node.js + Express
TypeScript
Prisma ORM (PostgreSQL)
Zod validation
Jest + Supertest
Node-cron (daily automation)
Rate limiting middleware
Performance monitoring middleware (bonus)
System error tracking

Frontend

Next.js 14 (App Router)
React + Hooks
TypeScript
Axios API layer
TailwindCSS
Recharts (graphs)
Sonner (notifications)
LocalStorage Auth mock

DevOps

Docker + Docker Compose
GitHub Actions (CI/CD):

✔ Install
✔ Build backend & frontend
✔ Run backend tests
✔ Type-check frontend
✔ Lint frontend


Environment variables (.env)
Postman Collection + Tests


🧪 3. Features Overview
✔ User Management

Create, update, delete users
Assign roles
CSV bulk import
Metrics for success/failure

✔ Role Management (RBAC)

Create custom roles
System roles locked
Assign permissions to roles

✔ Permissions Management

Create/update/delete permissions
System permissions protected

✔ ABAC — Attribute-Based Access Control
Rules based on:

department
location
time window

Operators:

equals
in
between

Effects:

allow / deny

✔ Audit Logs

Tracks important actions
Used for reports & metrics

✔ Automation Engine
Trigger events like:

abac.denied
user.created
csv.import.success

Send HTTP webhooks to external services.
✔ Metrics Dashboard

Security breakdown (RBAC vs ABAC denies)
Daily usage timeline
Recent audit logs
Active vs total users

✔ System Error Tracking
Automatic logging for:

Exceptions
Stack traces
URL, method, user email
Shown in dashboard

✔ Reports (CSV)

Users
Audit logs
Security events
Import history
All metrics


🐳 4. Run Everything With Docker
1️⃣ Create .env files
/backend/.env.docker
envDATABASE_URL=postgresql://dev:dev@postgres:5432/authdb?schema=public
PORT=4000
/frontend/.env.docker
envNEXT_PUBLIC_API_URL=http://backend:4000/api
2️⃣ Start full stack
bashdocker compose up --build
Services:
ServiceURLFrontendhttp://localhost:3000Backend APIhttp://localhost:4000/apiPostgreSQLlocalhost:5432

🛠 5. Running Locally (Without Docker)
Backend
bashcd backend
npm install
npm run dev
Frontend
bashcd frontend
npm install
npm run dev

🧪 6. Testing
Backend tests
bashcd backend
npm run test
```

### Postman Tests (QA Bonus)

Open:
```
postman/Auth Platform Collection
```

Each request includes:
- Status code test
- Response time test
- JSON format test

---

## 🔒 7. Security Layers Implemented

### RBAC
Role + Permission evaluation.

### ABAC
Advanced rule engine evaluating:
- user attributes
- resource attributes
- contextual attributes (time, location, dept)

### Rate Limiting
Global IP+path limiter (100 req / 15s).

### DevSecOps
- Vulnerability scanning in CI (`npm audit`)
- TypeScript strict mode
- Error logging middleware
- Performance monitoring

---

## ⚙ 8. DevOps Summary (What You Achieved)

### ✔ GitHub Actions CI/CD
Runs on every push:
- Install deps
- Backend build
- Backend tests
- Frontend type-checking
- Frontend lint (ESLint)
- Both builds must pass

### ✔ Docker
- Backend container
- Frontend container
- PostgreSQL database
- Network orchestration

### ✔ Monitoring middleware (bonus)
- Logs slow requests
- Adds metrics for performance

### ✔ System error logging
Helpful for debugging and QA.

---

## 🧪 9. QA Summary (What You Achieved)

### ✔ Functional testing
Using Postman:
- Users
- Roles
- Permissions
- ABAC rules
- Reports
- Import

### ✔ Automated Postman Tests
3 tests per endpoint:
- Status code 200
- Response < 500ms
- JSON response

### ✔ Performance & Load Testing
- CSV import stress test
- ABAC evaluation stress test

### ✔ Usability testing
Dashboard navigation, clarity, color coding.

---

## 📈 10. Project Diagram (Simple Architecture)
```
              ┌──────────────┐
              │   FRONTEND   │
              │ Next.js 14   │
              └──────┬───────┘
                     │ HTTP (Axios)
                     ▼
        ┌──────────────────────────────┐
        │           BACKEND            │
        │  Node.js + Express + Prisma  │
        └──────┬──────────────┬───────┘
               │              │
               ▼              ▼
       ┌────────────┐  ┌───────────────┐
       │ PostgreSQL │  │  Cron Jobs     │
       │   Prisma   │  │   Automation   │
       └────────────┘  └───────────────┘

🏁 11. How to Contribute
bashgit checkout -b feature/xyz
git commit -m "Add new feature"
git push
