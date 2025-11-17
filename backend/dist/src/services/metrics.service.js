"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logMetric = logMetric;
exports.getOverviewMetrics = getOverviewMetrics;
exports.getSecurityMetrics = getSecurityMetrics;
exports.getUsageMetrics = getUsageMetrics;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function logMetric(type, metadata = null) {
    return prisma.metricEvent.create({
        data: {
            type,
            metadata: metadata ? JSON.stringify(metadata) : null
        }
    });
}
// Helper to convert BigInt to number
function toNumber(n) {
    if (typeof n === "bigint")
        return Number(n);
    return n;
}
async function getOverviewMetrics() {
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({ where: { isActive: true } });
    const auditLogs = await prisma.auditLog.count();
    const recentEvents = await prisma.metricEvent.findMany({
        take: 10,
        orderBy: { createdAt: "desc" }
    });
    return {
        totalUsers,
        activeUsers,
        auditLogs,
        recentEvents
    };
}
// SECURITY METRICS
async function getSecurityMetrics() {
    const rbac = await prisma.metricEvent.count({
        where: { type: "rbac_deny" }
    });
    const abac = await prisma.metricEvent.count({
        where: { type: "abac_deny" }
    });
    return {
        rbacDenies: rbac,
        abacDenies: abac
    };
}
// USAGE METRICS (WITH BIGINT FIX)
async function getUsageMetrics() {
    // Group by date
    const result = await prisma.$queryRawUnsafe(`
    SELECT 
      DATE("createdAt") as date,
      COUNT(*) as count
    FROM "MetricEvent"
    GROUP BY DATE("createdAt")
    ORDER BY DATE("createdAt") DESC
    LIMIT 30;
  `);
    // Convert BigInt → Number
    const safeResult = result.map((r) => ({
        date: r.date,
        count: toNumber(r.count)
    }));
    return safeResult;
}
