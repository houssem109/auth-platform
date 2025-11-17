"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/abac.routes.ts
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const abac_1 = require("../services/abac");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
router.use(auth_1.fakeAuth);
// GET all ABAC rules
router.get("/", (0, auth_1.requirePermission)("abac.manage"), async (_req, res, next) => {
    try {
        const rules = await prisma.abacRule.findMany({
            orderBy: { createdAt: "desc" }
        });
        res.json(rules);
    }
    catch (error) {
        next(error);
    }
});
// CREATE rule
router.post("/", (0, auth_1.requirePermission)("abac.manage"), async (req, res, next) => {
    try {
        const rule = await prisma.abacRule.create({
            data: req.body
        });
        res.status(201).json(rule);
    }
    catch (error) {
        next(error);
    }
});
// UPDATE rule
router.put("/:id", (0, auth_1.requirePermission)("abac.manage"), async (req, res, next) => {
    try {
        const rule = await prisma.abacRule.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(rule);
    }
    catch (error) {
        next(error);
    }
});
// DELETE rule
router.delete("/:id", (0, auth_1.requirePermission)("abac.manage"), async (req, res, next) => {
    try {
        await prisma.abacRule.delete({
            where: { id: req.params.id }
        });
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
// SANDBOX / EVALUATE
router.post("/evaluate", (0, auth_1.requirePermission)("abac.test"), async (req, res, next) => {
    try {
        const { user, resource, rules } = req.body;
        const result = (0, abac_1.evaluateAbacRules)(user, resource, rules);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
