"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/metrics.routes.ts
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const metrics_service_1 = require("../services/metrics.service");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
router.use(auth_1.fakeAuth);
/* -------------------------------------------
   TEST METRIC EVENT
-------------------------------------------- */
router.post("/test", (0, auth_1.requirePermission)("audit.read"), async (req, res, next) => {
    try {
        const { type, metadata } = req.body;
        const event = await prisma.metricEvent.create({
            data: {
                type,
                metadata: JSON.stringify(metadata || {})
            }
        });
        res.json(event);
    }
    catch (error) {
        next(error);
    }
});
/* -------------------------------------------
   DASHBOARD METRICS
-------------------------------------------- */
router.get("/overview", (0, auth_1.requirePermission)("audit.read"), async (_req, res) => {
    res.json(await (0, metrics_service_1.getOverviewMetrics)());
});
router.get("/security", (0, auth_1.requirePermission)("audit.read"), async (_req, res) => {
    res.json(await (0, metrics_service_1.getSecurityMetrics)());
});
router.get("/usage", (0, auth_1.requirePermission)("audit.read"), async (_req, res) => {
    res.json(await (0, metrics_service_1.getUsageMetrics)());
});
exports.default = router;
