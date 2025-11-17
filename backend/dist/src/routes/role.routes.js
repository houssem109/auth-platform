"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const audit_service_1 = require("../services/audit.service");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
router.use(auth_1.fakeAuth);
// GET ROLES
router.get("/", (0, auth_1.requirePermission)("role.manage"), async (req, res, next) => {
    try {
        const roles = await prisma.role.findMany({
            include: { rolePermissions: { include: { permission: true } } }
        });
        await (0, audit_service_1.logAction)({
            userId: req.user?.id,
            action: "role.read",
            resource: "Role"
        });
        res.json(roles);
    }
    catch (error) {
        next(error);
    }
});
// CREATE ROLE
// CREATE ROLE (safe)
router.post("/", (0, auth_1.requirePermission)("role.manage"), async (req, res, next) => {
    try {
        // Check if role already exists
        const existing = await prisma.role.findUnique({
            where: { name: req.body.name }
        });
        if (existing) {
            return res.status(400).json({
                error: "Role already exists"
            });
        }
        const role = await prisma.role.create({ data: req.body });
        await (0, audit_service_1.logAction)({
            userId: req.user?.id,
            action: "role.create",
            resource: "Role",
            payload: role
        });
        res.status(201).json(role);
    }
    catch (error) {
        next(error);
    }
});
// UPDATE ROLE
router.put("/:id", (0, auth_1.requirePermission)("role.manage"), async (req, res, next) => {
    try {
        const role = await prisma.role.update({
            where: { id: req.params.id },
            data: req.body
        });
        await (0, audit_service_1.logAction)({
            userId: req.user?.id,
            action: "role.update",
            resource: "Role",
            payload: role
        });
        res.json(role);
    }
    catch (error) {
        next(error);
    }
});
// DELETE ROLE
router.delete("/:id", (0, auth_1.requirePermission)("role.manage"), async (req, res, next) => {
    try {
        await prisma.role.delete({ where: { id: req.params.id } });
        await (0, audit_service_1.logAction)({
            userId: req.user?.id,
            action: "role.delete",
            resource: "Role",
            payload: { roleId: req.params.id }
        });
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
// ASSIGN PERMISSIONS
router.post("/:id/permissions", (0, auth_1.requirePermission)("role.manage"), async (req, res, next) => {
    try {
        await prisma.rolePermission.deleteMany({ where: { roleId: req.params.id } });
        await prisma.rolePermission.createMany({
            data: req.body.permissionIds.map((pid) => ({
                roleId: req.params.id,
                permissionId: pid
            }))
        });
        await (0, audit_service_1.logAction)({
            userId: req.user?.id,
            action: "role.assignPermissions",
            resource: "Role",
            payload: {
                roleId: req.params.id,
                permissions: req.body.permissionIds
            }
        });
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
