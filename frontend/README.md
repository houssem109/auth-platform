📌 Authorization Platform – Frontend (Next.js)
Modern dashboard for managing users, roles, permissions, ABAC rules, audit logs, metrics, system errors, automations, and reports.
Built using:

Next.js 14 (App Router)
TypeScript
TailwindCSS
Axios
Lucide Icons
Context API
Docker


🚀 1. Overview
This frontend provides a complete admin interface for the security-based authorization platform.
✔ User Management

Create, edit, delete users
Assign roles
Bulk import via CSV

✔ Role Management

Create custom roles
Edit/delete roles
Assign permissions to roles
System roles protected

✔ Permission Management

Create, edit, delete permissions
System permissions locked

✔ ABAC Rules

Department, location, time-of-day
Fully integrated rule tester

✔ Audit Logs & System Errors

View system errors
View audit logs
Track system events

✔ Metrics Dashboard

Security denies (RBAC/ABAC)
Usage chart
Recent events

✔ Reports & CSV Exports

Users report
Audit logs
Security events
CSV import report
Metrics CSV

All reports downloadable as CSV.

📁 2. Folder Structure
frontend/
│
├── app/
│   ├── login/
│   ├── dashboard/
│   │   ├── users/
│   │   ├── roles/
│   │   ├── permissions/
│   │   ├── abac/
│   │   ├── audit/
│   │   ├── metrics/
│   │   ├── reports/
│   │   └── system-errors/
│   └── layout.tsx
│
├── components/
│   ├── Sidebar.tsx
│   ├── Spinner.tsx
│   └── Toaster.tsx
│
├── context/
│   └── AuthContext.tsx
│
├── lib/
│   ├── api.ts
│   ├── toast.ts
│   └── utils.ts
│
├── public/
├── Dockerfile
├── package.json
└── tailwind.config.js

🛠 3. Tech Stack
LayerTechnologyFrameworkNext.js 14 (App Router)LanguageTypeScriptStylingTailwindCSSAPI ClientAxiosUILucide IconsToastsSonnerAuthCustom Context (x-user-email)DeploymentDocker

📦 4. Installation (Local Development)
1️⃣ Move to frontend folder
bashcd frontend
2️⃣ Install dependencies
bashnpm install
3️⃣ Create .env.local
envNEXT_PUBLIC_API_URL="http://localhost:4000/api"
4️⃣ Start development server
bashnpm run dev
```

**Frontend available at:** 📌 http://localhost:3000

---

## 🔐 5. How Authentication Works

The frontend uses fake login (simple for educational purposes):

1. User enters an email in `/login`
2. Email is stored in localStorage
3. Every request adds header:
```
x-user-email: <email>
```

4. Backend loads permissions for that user
5. UI updates according to backend responses

---

## 🧩 6. Pages Summary

### 🟦 Dashboard
- Sidebar navigation
- Global toast system
- Protected layouts

### 🟩 Users
- List, edit, delete
- Bulk import CSV
- Role assignment

### 🟧 Roles
- Create, edit, delete
- Assign permissions
- System role protection

### 🟪 Permissions
- Create, edit, delete
- System permissions locked

### 🟨 ABAC Rules
- Create rules
- Evaluate rule sandbox
- Test user attributes

### 🔵 Audit Logs
- View all logs
- Filter by actions

### 🔴 System Errors
- View all backend incidents

### 🟣 Metrics
- Usage statistics
- Security denies
- Recent events

### 🟤 Reports
- Generate/download CSV reports

---

## 🔄 7. API Integration Setup

`/lib/api.ts` configures Axios:
- Base URL from `.env`
- Adds `x-user-email`
- Global error handler
- Redirect on 401
- Toast on error

---

## 🧪 8. QA & Postman Automation

Frontend supports QA workflows:

### ✔ Postman environment
```
base_url = http://localhost:4000/api
admin_email = superadmin@example.com
✔ Automated tests in Postman
Added in Tests:
javascriptpm.test("Status is 200", () =>
  pm.response.to.have.status(200)
);

pm.test("Response time < 500ms", () =>
  pm.expect(pm.response.responseTime).to.be.below(500)
);

pm.test("Response is JSON", () =>
  pm.response.to.be.json
);

🐳 9. Docker Usage
Build frontend:
bashdocker build -t auth-frontend .
Run via docker-compose:
bashdocker-compose up -d
App available at: 📌 http://localhost:3000