"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const system_service_1 = require("../services/system.service");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
/**
 * Basic health check
 * GET /api/system/health
 */
router.get("/health", async (_req, res, next) => {
    try {
        const start = Date.now();
        await (0, system_service_1.withRetry)(() => prisma.$queryRaw `SELECT 1`);
        const latency = Date.now() - start;
        res.json({
            status: "ok",
            db: "connected",
            dbLatencyMs: latency,
            uptimeSeconds: Math.round(process.uptime()),
            timestamp: new Date().toISOString(),
        });
    }
    catch (err) {
        next(err);
    }
});
/**
 * Lightweight monitoring snapshot
 * GET /api/system/status
 */
router.get("/status", async (_req, res, next) => {
    try {
        const [users, roles, perms, errors, metrics] = await Promise.all([
            prisma.user.count(),
            prisma.role.count(),
            prisma.permission.count(),
            prisma.systemError.count({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
                    },
                },
            }),
            prisma.metricEvent.count({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
                    },
                },
            }),
        ]);
        res.json({
            status: "ok",
            totals: {
                users,
                roles,
                permissions: perms,
            },
            last24h: {
                systemErrors: errors,
                metricEvents: metrics,
            },
            uptimeSeconds: Math.round(process.uptime()),
        });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
