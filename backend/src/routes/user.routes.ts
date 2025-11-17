// src/routes/user.routes.ts
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { fakeAuth, requirePermission } from "../middleware/auth";
import { logAction } from "../services/audit.service";
import { logMetric } from "../services/metrics.service";
import { triggerAutomationEvent } from "../services/automation.service";

const prisma = new PrismaClient();
const router = Router();

router.use(fakeAuth);

// -------------------------
// Simple CSV parser
// -------------------------
function parseCsv(csv: string) {
  const lines = csv.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return { header: [], rows: [] };

  const header = lines[0].split(",").map((h) => h.trim());
  const rows = lines.slice(1).map((line) =>
    line.split(",").map((v) => v.trim())
  );

  return { header, rows };
}

// -------------------------
// GET USERS
// -------------------------
router.get("/", requirePermission("user.read"), async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      include: { userRoles: true }
    });

    res.json(users);
  } catch (error) {
    next(error);
  }
});
// -------------------------
// CREATE USER
// -------------------------
router.post("/", requirePermission("user.create"), async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, department, location } = req.body;

    // Check if email exists
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const user = await prisma.user.create({
      data: { email, password, firstName, lastName, department, location }
    });

    await logAction({
      userId: req.user?.id,
      action: "user.create",
      resource: "User",
      payload: user
    });

    await logMetric("user_created", { id: user.id, email: user.email });
    await triggerAutomationEvent("user.created", { id: user.id, email: user.email });

    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});


// -------------------------
// UPDATE USER
// -------------------------
router.put("/:id", requirePermission("user.update"), async (req, res, next) => {
  try {
    const { firstName, lastName, isActive, department, location } = req.body;

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { firstName, lastName, isActive, department, location }
    });

    await logAction({
      userId: req.user?.id,
      action: "user.update",
      resource: "User",
      payload: user
    });

    // Sprint 5
    await logMetric("user_updated", { id: user.id });
    await triggerAutomationEvent("user.updated", { id: user.id });

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// -------------------------
// ASSIGN ROLES
// -------------------------
router.post(
  "/:id/roles",
  requirePermission("role.manage"),
  async (req, res, next) => {
    try {
      const { roleIds } = req.body as { roleIds: string[] };

      await prisma.userRole.deleteMany({ where: { userId: req.params.id } });

      await prisma.userRole.createMany({
        data: roleIds.map((roleId) => ({
          userId: req.params.id,
          roleId
        }))
      });

      await logAction({
        userId: req.user?.id,
        action: "role.assign",
        resource: "User",
        payload: { userId: req.params.id, roles: roleIds }
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

// -------------------------
// DELETE USER
// -------------------------
router.delete(
  "/:id",
  requirePermission("user.delete"),
  async (req, res, next) => {
    try {
      await prisma.user.delete({ where: { id: req.params.id } });

      await logAction({
        userId: req.user?.id,
        action: "user.delete",
        resource: "User",
        payload: { deletedUserId: req.params.id }
      });

      // Sprint 5 automation
      await logMetric("user_deleted", { id: req.params.id });
      await triggerAutomationEvent("user.deleted", { id: req.params.id });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

// -------------------------
// BULK IMPORT (CSV)
// -------------------------
router.post(
  "/import",
  requirePermission("user.import"),
  async (req, res, next) => {
    try {
      const csv = req.body as string;

      if (!csv || typeof csv !== "string") {
        return res.status(400).json({ message: "CSV body required as text" });
      }

      const { header, rows } = parseCsv(csv);

      const expectedHeader = [
        "email",
        "password",
        "firstName",
        "lastName",
        "department",
        "location"
      ];

      if (header.join(",") !== expectedHeader.join(",")) {
        return res.status(400).json({
          success: false,
          imported: 0,
          errors: ["Invalid CSV header"]
        });
      }

      const errors: string[] = [];
      const usersToCreate: any[] = [];

      const emailIndex = header.indexOf("email");
      const passwordIndex = header.indexOf("password");
      const firstNameIndex = header.indexOf("firstName");
      const lastNameIndex = header.indexOf("lastName");
      const departmentIndex = header.indexOf("department");
      const locationIndex = header.indexOf("location");

      rows.forEach((cols, i) => {
        const rowNum = i + 2; // line after header

        const email = cols[emailIndex];
        const password = cols[passwordIndex];
        const firstName = cols[firstNameIndex] || null;
        const lastName = cols[lastNameIndex] || null;
        const department = cols[departmentIndex] || null;
        const location = cols[locationIndex] || null;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email || !emailRegex.test(email)) {
          errors.push(`Row ${rowNum}: invalid email "${email}"`);
        }

        if (!password || password.length < 6) {
          errors.push(`Row ${rowNum}: invalid password`);
        }

        usersToCreate.push({
          email,
          password,
          firstName,
          lastName,
          department,
          location
        });
      });

      // ------------------------
      // Errors → rollback
      // ------------------------
      if (errors.length > 0) {
        await logMetric("csv_import_failed", { errors });
        await triggerAutomationEvent("csv.import.failed", { errors });

        return res.status(400).json({
          success: false,
          imported: 0,
          errors
        });
      }

      // ------------------------
      // Insert into DB
      // ------------------------
      const result = await prisma.user.createMany({
        data: usersToCreate,
        skipDuplicates: true
      });

      await logAction({
        userId: req.user?.id,
        action: "user.import",
        resource: "User",
        payload: { imported: result.count }
      });

      await logMetric("csv_import_success", { count: result.count });
      await triggerAutomationEvent("csv.import.success", { count: result.count });

      res.json({
        success: true,
        imported: result.count,
        errors: []
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
