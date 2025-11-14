// src/routes/reports.routes.ts
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { fakeAuth, requirePermission } from "../middleware/auth";

const prisma = new PrismaClient();
const router = Router();

router.use(fakeAuth);

// Helper: escape CSV values
function csvValue(v: any): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function toCsv(headers: string[], rows: any[]): string {
  const headerLine = headers.join(",");
  const dataLines = rows.map((row) =>
    headers.map((h) => csvValue(row[h])).join(",")
  );
  return [headerLine, ...dataLines].join("\n");
}

/* ============================================================
   USERS REPORT
============================================================ */
router.get(
  "/users.csv",
  requirePermission("audit.read"),
  async (_req, res, next) => {
    try {
      const users = await prisma.user.findMany();

      const headers = [
        "id",
        "email",
        "firstName",
        "lastName",
        "department",
        "location",
        "createdAt"
      ];

      const rows = users.map((u) => ({
        id: u.id,
        email: u.email,
        firstName: u.firstName || "",
        lastName: u.lastName || "",
        department: u.department || "",
        location: u.location || "",
        createdAt: u.createdAt.toISOString()
      }));

      const csv = toCsv(headers, rows);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", 'attachment; filename="users-report.csv"');
      res.send(csv);
    } catch (error) {
      next(error);
    }
  }
);

/* ============================================================
   AUDIT LOGS REPORT
============================================================ */
router.get(
  "/audit.csv",
  requirePermission("audit.read"),
  async (_req, res, next) => {
    try {
      const logs = await prisma.auditLog.findMany({
        include: { user: true },
        orderBy: { createdAt: "desc" }
      });

      const headers = ["id", "userEmail", "action", "resource", "createdAt"];
      const rows = logs.map((l) => ({
        id: l.id,
        userEmail: l.user?.email || "",
        action: l.action,
        resource: l.resource || "",
        createdAt: l.createdAt.toISOString()
      }));

      const csv = toCsv(headers, rows);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", 'attachment; filename="audit-report.csv"');
      res.send(csv);
    } catch (error) {
      next(error);
    }
  }
);

/* ============================================================
   SECURITY REPORT — ABAC & RBAC DENIES
============================================================ */
router.get(
  "/security.csv",
  requirePermission("audit.read"),
  async (_req, res, next) => {
    try {
      const events = await prisma.metricEvent.findMany({
        where: {
          OR: [{ type: "abac_deny" }, { type: "rbac_deny" }]
        },
        orderBy: { createdAt: "desc" }
      });

      const headers = ["id", "type", "metadata", "createdAt"];
      const rows = events.map((e) => ({
        id: e.id,
        type: e.type,
        metadata: e.metadata || "",
        createdAt: e.createdAt.toISOString()
      }));

      const csv = toCsv(headers, rows);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", 'attachment; filename="security-report.csv"');
      res.send(csv);
    } catch (error) {
      next(error);
    }
  }
);

/* ============================================================
   CSV IMPORT REPORT (SUCCESS + FAILED)
============================================================ */
router.get(
  "/import.csv",
  requirePermission("audit.read"),
  async (_req, res, next) => {
    try {
      const events = await prisma.metricEvent.findMany({
        where: {
          OR: [
            { type: "csv_import_success" },
            { type: "csv_import_failed" }
          ]
        },
        orderBy: { createdAt: "desc" }
      });

      const headers = ["id", "type", "metadata", "createdAt"];
      const rows = events.map((e) => ({
        id: e.id,
        type: e.type,
        metadata: e.metadata || "",
        createdAt: e.createdAt.toISOString()
      }));

      const csv = toCsv(headers, rows);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", 'attachment; filename="csv-import-report.csv"');
      res.send(csv);
    } catch (error) {
      next(error);
    }
  }
);

/* ============================================================
   ALL METRICS REPORT
============================================================ */
router.get(
  "/metrics.csv",
  requirePermission("audit.read"),
  async (_req, res, next) => {
    try {
      const events = await prisma.metricEvent.findMany({
        orderBy: { createdAt: "desc" }
      });

      const headers = ["id", "type", "metadata", "createdAt"];
      const rows = events.map((e) => ({
        id: e.id,
        type: e.type,
        metadata: e.metadata || "",
        createdAt: e.createdAt.toISOString()
      }));

      const csv = toCsv(headers, rows);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", 'attachment; filename="all-metrics.csv"');
      res.send(csv);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
