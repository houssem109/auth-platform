"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/user.routes.ts
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const audit_service_1 = require("../services/audit.service");
const metrics_service_1 = require("../services/metrics.service");
const automation_service_1 = require("../services/automation.service");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
router.use(auth_1.fakeAuth);
// -------------------------
// Simple CSV parser
// -------------------------
function parseCsv(csv) {
    const lines = csv.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2)
        return { header: [], rows: [] };
    const header = lines[0].split(",").map((h) => h.trim());
    const rows = lines.slice(1).map((line) => line.split(",").map((v) => v.trim()));
    return { header, rows };
}
// -------------------------
// GET USERS
// -------------------------
router.get("/", (0, auth_1.requirePermission)("user.read"), async (req, res, next) => {
    try {
        const users = await prisma.user.findMany({
            include: { userRoles: true }
        });
        res.json(users);
    }
    catch (error) {
        next(error);
    }
});
// -------------------------
// CREATE USER
// -------------------------
router.post("/", (0, auth_1.requirePermission)("user.create"), async (req, res, next) => {
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
        await (0, audit_service_1.logAction)({
            userId: req.user?.id,
            action: "user.create",
            resource: "User",
            payload: user
        });
        await (0, metrics_service_1.logMetric)("user_created", { id: user.id, email: user.email });
        await (0, automation_service_1.triggerAutomationEvent)("user.created", { id: user.id, email: user.email });
        res.status(201).json(user);
    }
    catch (error) {
        next(error);
    }
});
// -------------------------
// UPDATE USER
// -------------------------
router.put("/:id", (0, auth_1.requirePermission)("user.update"), async (req, res, next) => {
    try {
        const { firstName, lastName, isActive, department, location } = req.body;
        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: { firstName, lastName, isActive, department, location }
        });
        await (0, audit_service_1.logAction)({
            userId: req.user?.id,
            action: "user.update",
            resource: "User",
            payload: user
        });
        // Sprint 5
        await (0, metrics_service_1.logMetric)("user_updated", { id: user.id });
        await (0, automation_service_1.triggerAutomationEvent)("user.updated", { id: user.id });
        res.json(user);
    }
    catch (error) {
        next(error);
    }
});
// -------------------------
// ASSIGN ROLES
// -------------------------
router.post("/:id/roles", (0, auth_1.requirePermission)("role.manage"), async (req, res, next) => {
    try {
        const { roleIds } = req.body;
        await prisma.userRole.deleteMany({ where: { userId: req.params.id } });
        await prisma.userRole.createMany({
            data: roleIds.map((roleId) => ({
                userId: req.params.id,
                roleId
            }))
        });
        await (0, audit_service_1.logAction)({
            userId: req.user?.id,
            action: "role.assign",
            resource: "User",
            payload: { userId: req.params.id, roles: roleIds }
        });
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
// -------------------------
// DELETE USER
// -------------------------
router.delete("/:id", (0, auth_1.requirePermission)("user.delete"), async (req, res, next) => {
    try {
        await prisma.user.delete({ where: { id: req.params.id } });
        await (0, audit_service_1.logAction)({
            userId: req.user?.id,
            action: "user.delete",
            resource: "User",
            payload: { deletedUserId: req.params.id }
        });
        // Sprint 5 automation
        await (0, metrics_service_1.logMetric)("user_deleted", { id: req.params.id });
        await (0, automation_service_1.triggerAutomationEvent)("user.deleted", { id: req.params.id });
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
// -------------------------
// BULK IMPORT (CSV)
// -------------------------
router.post("/import", (0, auth_1.requirePermission)("user.import"), async (req, res, next) => {
    try {
        const csv = req.body;
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
        const errors = [];
        const usersToCreate = [];
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
            await (0, metrics_service_1.logMetric)("csv_import_failed", { errors });
            await (0, automation_service_1.triggerAutomationEvent)("csv.import.failed", { errors });
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
        await (0, audit_service_1.logAction)({
            userId: req.user?.id,
            action: "user.import",
            resource: "User",
            payload: { imported: result.count }
        });
        await (0, metrics_service_1.logMetric)("csv_import_success", { count: result.count });
        await (0, automation_service_1.triggerAutomationEvent)("csv.import.success", { count: result.count });
        res.json({
            success: true,
            imported: result.count,
            errors: []
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
