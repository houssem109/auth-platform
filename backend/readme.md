📌 Authorization Platform – Backend
Backend API for the RBAC + ABAC + Audit + Metrics + Automation security platform. Built with Node.js, Express, Prisma, PostgreSQL, TypeScript, and Docker.

🚀 1. Overview
This backend provides:
🔐 RBAC (Role-Based Access Control)

Create, edit, delete roles
Assign permissions to roles
System roles with locked configuration

🎯 ABAC (Attribute-Based Access Control)

Attribute-based rule engine
Rules on: department, location, time-of-day
Deny + metrics + automation triggers

📊 Audit & Metrics

Audit logs for all key operations
Metrics for API usage, denies, imports
System errors logging

⚙️ Automations

Webhook triggers on:

CSV import success/failure
ABAC deny
System errors



🧪 Testing

Jest + Supertest
Postman integration with tests and environment

🚨 Security Monitoring

Cron job detecting abnormal deny spikes
Logs incidents into SystemErrors table
Performance monitoring middleware


📁 2. Folder Structure
backend/
│
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
│
├── src/
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   ├── cron/
│   ├── tests/
│   ├── index.ts
│   └── server.ts
│
├── Dockerfile
├── package.json
└── tsconfig.json

🛠 3. Tech Stack
ComponentTechnologyLanguageTypeScriptFrameworkExpress.jsORMPrismaDatabasePostgreSQLTestingJest + SupertestMonitoringCustom metrics + Cron jobsDeploymentDockerCI/CDGitHub Actions

📦 4. Installation (Local Development)
1️⃣ Clone repository
bashgit clone <your-repo>
cd backend
2️⃣ Install dependencies
bashnpm install
3️⃣ Create .env
envDATABASE_URL="postgresql://dev:dev@localhost:5432/authdb?schema=public"
PORT=4000
4️⃣ Run migrations
bashnpx prisma migrate dev --name init
5️⃣ Seed database
bashnpm run seed
6️⃣ Start development server
bashnpm run dev
Backend runs at: 📌 http://localhost:4000/api

🧪 5. Testing (Jest + Supertest)
Run all tests:
bashnpm test
Included tests:

ABAC engine
RBAC permissions
User CRUD
Bulk CSV import


🧱 6. Docker Usage
Build image:
bashdocker build -t auth-backend .
Run via docker-compose:
bashdocker-compose up -d
```

Backend auto-migrates + seeds DB at startup.

---

## 🔄 7. API Routes Summary

### Users
```
GET    /api/users
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id
POST   /api/users/import   (CSV)
```

### Roles
```
GET    /api/roles
POST   /api/roles
PUT    /api/roles/:id
DELETE /api/roles/:id
POST   /api/roles/:id/permissions
```

### Permissions
```
GET    /api/permissions
POST   /api/permissions
PUT    /api/permissions/:id
DELETE /api/permissions/:id
```

### Reports
```
/api/reports/*.csv
```

### Metrics & System
```
/api/metrics/
/api/system-errors/
```

---

## 🔥 8. Bonus Features

### ✔ Performance Monitoring Middleware
Tracks:
- Response time
- Endpoint
- Status
- User email

Stored in `MetricEvent` table.

### ✔ Security Alert Cron Job
Triggers alert when too many RBAC/ABAC denies occur.

### ✔ Daily Reports Cron
Automatic CSV reports emailed or generated.

### ✔ Rate Limiter
Global IP-based throttling.

---

## 🧪 9. Postman Integration

### Environment:
```
base_url = http://localhost:4000/api
admin_email = superadmin@example.com
Tests added to all requests:
javascriptpm.test("Status is 200", () =>
  pm.response.to.have.status(200)
);

pm.test("Response time < 500ms", () =>
  pm.expect(pm.response.responseTime).to.be.below(500)
);

pm.test("Response is JSON", () =>
  pm.response.to.be.json
);

🏁 10. How to Use the Backend (Step-by-Step)

Login in frontend using any real email in database
Backend reads the email → loads permissions
All actions filtered by RBAC + ABAC
Every action logs a metric & audit trail
CSV import triggers automation events
Reports downloadable from frontend