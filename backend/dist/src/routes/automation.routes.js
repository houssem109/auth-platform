"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const automation_service_1 = require("../services/automation.service");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
router.use(auth_1.fakeAuth);
// List automation rules
router.get("/rules", (0, auth_1.requirePermission)("abac.manage"), async (_req, res, next) => {
    try {
        const rules = await prisma.automationRule.findMany({
            orderBy: { createdAt: "desc" }
        });
        res.json(rules);
    }
    catch (error) {
        next(error);
    }
});
// Create rule
router.post("/rules", (0, auth_1.requirePermission)("abac.manage"), async (req, res, next) => {
    try {
        const rule = await prisma.automationRule.create({
            data: req.body
        });
        res.status(201).json(rule);
    }
    catch (error) {
        next(error);
    }
});
// Update rule
router.put("/rules/:id", (0, auth_1.requirePermission)("abac.manage"), async (req, res, next) => {
    try {
        const rule = await prisma.automationRule.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(rule);
    }
    catch (error) {
        next(error);
    }
});
// Delete rule
router.delete("/rules/:id", (0, auth_1.requirePermission)("abac.manage"), async (req, res, next) => {
    try {
        await prisma.automationRule.delete({
            where: { id: req.params.id }
        });
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
// Test trigger endpoint
router.post("/trigger/test", (0, auth_1.requirePermission)("abac.manage"), async (req, res, next) => {
    try {
        const { event, payload } = req.body;
        await (0, automation_service_1.triggerAutomationEvent)(event, payload || {});
        res.json({ success: true });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
