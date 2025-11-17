"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fakeAuth = fakeAuth;
exports.requirePermission = requirePermission;
// src/middleware/auth.ts
const client_1 = require("@prisma/client");
const cache_1 = require("../services/cache");
const abac_1 = require("../services/abac");
const metrics_service_1 = require("../services/metrics.service");
const automation_service_1 = require("../services/automation.service");
const prisma = new client_1.PrismaClient();
/**
 * fakeAuth:
 * Loads a user from header "x-user-email".
 * Falls back to first user in DB if header is not provided.
 * Cached for better performance.
 */
async function fakeAuth(req, _res, next) {
    try {
        const email = req.header("x-user-email") || undefined;
        let user = null;
        if (email) {
            const cached = cache_1.userCache.get(email);
            if (cached) {
                req.user = cached;
                return next();
            }
            user = await prisma.user.findUnique({
                where: { email },
                include: {
                    userRoles: {
                        include: {
                            role: {
                                include: {
                                    rolePermissions: {
                                        include: { permission: true }
                                    }
                                }
                            }
                        }
                    }
                }
            });
            if (user) {
                cache_1.userCache.set(email, user, 5 * 60 * 1000); // 5 minutes
            }
        }
        else {
            // fallback to first user (super admin)
            user = await prisma.user.findFirst({
                include: {
                    userRoles: {
                        include: {
                            role: {
                                include: {
                                    rolePermissions: {
                                        include: { permission: true }
                                    }
                                }
                            }
                        }
                    }
                }
            });
        }
        if (user)
            req.user = user;
        next();
    }
    catch (error) {
        next(error);
    }
}
/**
 * requirePermission("user.delete")
 * - RBAC check
 * - ABAC evaluation
 * Sprint 5:
 * - Log RBAC deny events
 * - Log ABAC deny events
 * - Trigger automation webhooks
 */
function requirePermission(permissionName) {
    return async (req, res, next) => {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        // -----------------------------------
        // RBAC CHECK
        // -----------------------------------
        const hasPermission = user.userRoles.some((ur) => ur.role.rolePermissions.some((rp) => rp.permission.name === permissionName));
        if (!hasPermission) {
            // Sprint 5: log RBAC deny
            await (0, metrics_service_1.logMetric)("rbac_deny", {
                permission: permissionName,
                user: user.email
            });
            // Sprint 5: automation hook
            await (0, automation_service_1.triggerAutomationEvent)("rbac.denied", {
                permission: permissionName,
                user: user.email
            });
            return res.status(403).json({ message: "Forbidden (RBAC)" });
        }
        // -----------------------------------
        // ABAC CHECK
        // -----------------------------------
        let rules = cache_1.abacRuleCache.get(permissionName);
        if (!rules) {
            rules = await prisma.abacRule.findMany({ where: { permissionName } });
            cache_1.abacRuleCache.set(permissionName, rules, 5 * 60 * 1000);
        }
        if (rules && rules.length > 0) {
            const result = await (0, abac_1.evaluateAbacRules)(user, {}, rules);
            if (!result.allow) {
                // Sprint 5: log ABAC deny
                await (0, metrics_service_1.logMetric)("abac_deny", {
                    rule: result.failedRule,
                    permission: permissionName,
                    user: user.email
                });
                // Sprint 5: automation hook
                await (0, automation_service_1.triggerAutomationEvent)("abac.denied", {
                    rule: result.failedRule,
                    permission: permissionName,
                    user: user.email
                });
                return res.status(403).json({
                    message: "Forbidden (ABAC)",
                    failedRule: result.failedRule
                });
            }
        }
        next();
    };
}
