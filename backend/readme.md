# 🔐 Authorization Platform — Backend

Advanced Role-Based (RBAC) + Attribute-Based (ABAC) Authorization System with Metrics, Automation, Reporting & CSV Import

---

## 📘 Overview

This backend project implements a complete **authorization system** without authentication. It provides enterprise-grade access control with comprehensive audit trails and automation capabilities.

### Key Features
- ✅ **RBAC** — Role Based Access Control
- ✅ **ABAC** — Attribute Based Access Control
- ✅ **Audit Logs** — Track all critical actions
- ✅ **Metrics & Reporting** — Insights and CSV exports
- ✅ **Automation Rules** — Trigger webhooks on events
- ✅ **CSV Bulk Imports** — Import users in batch
- ✅ **RESTful API** — Clean Express + Prisma architecture

### Tech Stack
- Node.js
- Express
- Prisma ORM
- PostgreSQL
- TypeScript

---

## 📦 Installation

### 1.1 Clone the Repository

```bash
git clone <repo-url>
cd backend
```

### 1.2 Install Dependencies

```bash
npm install
```

---

## 🐘 Database Setup (PostgreSQL with Docker)

The backend uses PostgreSQL as its database. Docker is recommended for easy setup.

### 2.1 Create the PostgreSQL Container (Run Once)

```bash
docker run --name authdb \
  -e POSTGRES_USER=dev \
  -e POSTGRES_PASSWORD=dev \
  -e POSTGRES_DB=authdb \
  -p 5432:5432 \
  -d postgres:15
```

This creates a container with:
- **Name:** authdb
- **User:** dev
- **Password:** dev
- **Database:** authdb
- **Port:** 5432 (exposed to localhost)

### 2.2 Start/Stop the Database

Start the database (run every day before the backend):
```bash
docker start authdb
```

Stop the database:
```bash
docker stop authdb
```

Check running containers:
```bash
docker ps
```

---

## 🗃 Environment Configuration

Create a `.env` file in the backend folder:

```env
DATABASE_URL="postgresql://dev:dev@localhost:5432/authdb?schema=public"
```

This URL must match the credentials used in the Docker container.

---

## 🛠 Prisma Setup

Prisma is used as the ORM for PostgreSQL interactions.

### 4.1 Apply Migrations (First Time or Schema Changes)

```bash
npx prisma migrate dev
```

This will:
- Create/update the database schema according to `prisma/schema.prisma`
- Create migration files in `prisma/migrations/`

### 4.2 Generate Prisma Client (When Models Change)

```bash
npx prisma generate
```

**Note:** On a normal day, you do NOT need to run these commands. They're only required during initial setup or when the Prisma schema changes.

---

## 🌱 Seed Initial Data (Optional)

If you want to populate the database with default data:

```bash
npm run seed
```

This creates:
- A default super admin user
- Initial roles and permissions

Only needed for first-time setup or after resetting the database.

---

## 🚀 Running the Backend

### Daily Startup

1. **Start PostgreSQL:**
   ```bash
   docker start authdb
   ```

2. **Start the Backend:**
   ```bash
   cd backend
   npm run dev
   ```

The backend will run on: `http://localhost:4000`

---

## 📂 Project Structure

```
backend/
│
├── prisma/
│   ├── schema.prisma              # Database models
│   ├── migrations/                # Migration history
│   └── seed.ts                    # Optional data seeding
│
├── src/
│   ├── index.ts                   # Entry point (starts server)
│   ├── server.ts                  # Express app configuration
│   │
│   ├── routes/
│   │   ├── user.routes.ts         # Users CRUD + CSV import
│   │   ├── role.routes.ts         # Roles CRUD + permissions assignment
│   │   ├── permission.routes.ts   # Permissions CRUD
│   │   ├── audit.routes.ts        # Audit logs listing
│   │   ├── abac.routes.ts         # ABAC rules CRUD + test endpoint
│   │   ├── metrics.routes.ts      # Metrics endpoints
│   │   ├── reports.routes.ts      # CSV exports
│   │   └── automation.routes.ts   # Automation rules + triggers
│   │
│   ├── middleware/
│   │   └── auth.ts                # Fake auth + requirePermission (RBAC + ABAC)
│   │
│   ├── services/
│   │   ├── audit.service.ts       # logAction()
│   │   ├── abac.ts                # evaluateAbacRules()
│   │   ├── metrics.service.ts     # Metrics functions
│   │   ├── automation.service.ts  # triggerAutomationEvent()
│   │   └── cache.ts               # Optional caching
│   │
│   └── tests/
│       └── user.test.ts           # Example Jest + Supertest tests
│
├── package.json
└── README.md
```

---

## 🧪 Testing with Postman

The backend uses a `fakeAuth` middleware that simulates authentication via HTTP headers.

### Required Headers

Always add these headers in Postman requests:

```
x-user-email: superadmin@example.com
Content-Type: application/json
```

Replace `superadmin@example.com` with any valid user email in the database.

---

## 📡 API Endpoints

### Users (RBAC / Core)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users |
| POST | `/api/users` | Create a new user |
| PUT | `/api/users/:id` | Update user information |
| DELETE | `/api/users/:id` | Delete a user |
| POST | `/api/users/:id/roles` | Assign roles to a user |
| POST | `/api/users/import` | Bulk import users from CSV |

#### Create User Example

```json
{
  "email": "user@example.com",
  "password": "123456",
  "firstName": "Test",
  "lastName": "User",
  "department": "IT",
  "location": "Tunis"
}
```

#### Assign Roles Example

```json
{
  "roleIds": ["role-id-1", "role-id-2"]
}
```

#### CSV Import Example

Content-Type: `text/csv`

```csv
email,password,firstName,lastName,department,location
user1@example.com,123456,User,One,IT,Tunis
user2@example.com,123456,User,Two,HR,Nabeul
```

### Roles & Permissions (RBAC)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/roles` | List all roles |
| POST | `/api/roles` | Create a new role |
| PUT | `/api/roles/:id` | Update a role |
| DELETE | `/api/roles/:id` | Delete a role |
| GET | `/api/permissions` | List all permissions |
| POST | `/api/permissions` | Create a new permission |
| POST | `/api/roles/:id/permissions` | Assign permissions to a role |

### Audit Logs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/audit` | View audit log history |

---

### ABAC Rules

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/abac-rules` | List all ABAC rules |
| POST | `/api/abac-rules` | Create a new ABAC rule |
| PUT | `/api/abac-rules/:id` | Update an ABAC rule |
| DELETE | `/api/abac-rules/:id` | Delete an ABAC rule |

#### ABAC Rule Examples

Department-based rule:

```json
{
  "name": "HR can read users",
  "permissionName": "user.read",
  "attribute": "department",
  "operator": "equals",
  "value": "\"HR\"",
  "effect": "allow"
}
```

Time-based rule:

```json
{
  "name": "Working hours only",
  "permissionName": "user.read",
  "attribute": "time",
  "operator": "between",
  "value": "{\"start\":\"08:00\",\"end\":\"18:00\"}",
  "effect": "deny"
}
```

### Metrics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/metrics/overview` | Global metrics (counts, recent events) |
| GET | `/api/metrics/security` | RBAC/ABAC deny counts |
| GET | `/api/metrics/usage` | Aggregated daily metrics |
| POST | `/api/metrics/test` | Create a test metric event |

#### Test Metric Example

```json
{
  "type": "test_metric",
  "metadata": { "hello": "world" }
}
```

### Reports (CSV Exports)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/users.csv` | Export all users |
| GET | `/api/reports/audit.csv` | Export audit logs |
| GET | `/api/reports/security.csv` | Export security metrics |
| GET | `/api/reports/import.csv` | Export import history |
| GET | `/api/reports/metrics.csv` | Export all metrics |

### Automation Rules

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/automation/rules` | List all automation rules |
| POST | `/api/automation/rules` | Create a new automation rule |
| PUT | `/api/automation/rules/:id` | Update an automation rule |
| DELETE | `/api/automation/rules/:id` | Delete an automation rule |
| POST | `/api/automation/trigger/test` | Manually trigger an automation event |

#### Test Automation Trigger Example

```json
{
  "event": "csv.import.failed",
  "payload": { "reason": "Sample test" }
}
```

---

## 📊 Development Sprints

### Sprint 1 — RBAC Foundation

**Goal:** Build core RBAC model and basic CRUD operations.

**Work:**
- Setup Node.js + Express + TypeScript
- Configure Prisma with PostgreSQL
- Create User, Role, Permission, UserRole, RolePermission models
- Implement CRUD endpoints
- Implement `requirePermission()` middleware (RBAC check)

### Sprint 2 — Audit Logging

**Goal:** Track critical actions in the system.

**Work:**
- Create AuditLog model
- Implement `logAction()` service
- Log user CRUD, role assignments, CSV imports
- Add `/api/audit` endpoint

### Sprint 3 — ABAC Basic Rules

**Goal:** Enhance RBAC with dynamic, attribute-based rules.

**Work:**
- Add user attributes (department, location)
- Create AbacRule model
- Implement ABAC evaluation engine
- Integrate ABAC into `requirePermission()`

### Sprint 4 — ABAC Advanced + CSV Import

**Goal:** Add time-based ABAC rules and bulk CSV import.

**Work:**
- Extend ABAC with time-of-day rules
- Implement CSV import endpoint with validation
- Rollback on validation errors
- Log import events

### Sprint 5 — Metrics & Reporting

**Goal:** Provide insights and exports.

**Work:**
- Create MetricEvent model
- Implement metrics endpoints (overview, security, usage)
- Implement CSV report exports
- Capture ABAC/RBAC denies

### Sprint 6 — Automation Engine

**Goal:** Trigger external webhooks on important events.

**Work:**
- Create AutomationRule model
- Implement `triggerAutomationEvent()` service
- Wire up automatic triggers (csv.import.success, abac.denied, etc.)
- Implement automation endpoints

---

## ✅ Useful Commands

| Purpose | Command |
|---------|---------|
| Install dependencies | `npm install` |
| Start database (daily) | `docker start authdb` |
| Start backend (daily) | `npm run dev` |
| Run migrations | `npx prisma migrate dev` |
| Generate Prisma client | `npx prisma generate` |
| Seed database | `npm run seed` |
| Open Prisma Studio | `npx prisma studio` |
| Run tests | `npm test` |

---



## 📧 Support

For issues, questions, or feature requests, please open an issue in the repository.