// src/middleware/auth.ts
import { PrismaClient, AbacRule } from "@prisma/client";
import { Request, Response, NextFunction } from "express";

import { userCache, abacRuleCache } from "../services/cache";
import { evaluateAbacRules } from "../services/abac";

import { logMetric } from "../services/metrics.service";
import { triggerAutomationEvent } from "../services/automation.service";

const prisma = new PrismaClient();

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * fakeAuth:
 * Loads a user from header "x-user-email".
 * Falls back to first user if header isn't set.
 * Cached for performance.
 */
export async function fakeAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    // -----------------------------------------------------
    // 🚀 TEST MODE → AUTO-AUTHENTICATE SUPER ADMIN
    // -----------------------------------------------------
    if (process.env.NODE_ENV === "test") {
      req.user = {
        email: "superadmin@example.com",
        role: "super_admin",
        userRoles: [
          {
            role: {
              rolePermissions: [
                { permission: { name: "*" } },
                { permission: { name: "user.read" } },
                { permission: { name: "user.create" } },
                { permission: { name: "user.delete" } },
                { permission: { name: "user.import" } }
              ]
            }
          }
        ]
      };

      return next();
    }

    // -----------------------------------------------------
    // NORMAL MODE (DEV/PRODUCTION)
    // -----------------------------------------------------

    const email = req.header("x-user-email") || undefined;
    let user = null;

    if (email) {
      // Check cache first
      const cached = userCache.get(email);
      if (cached) {
        req.user = cached;
        return next();
      }

      // Load full user with roles + permissions
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
        userCache.set(email, user, 5 * 60 * 1000); // 5 minutes
      }
    } else {
      // No header → fallback: first user (usually super admin)
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

    if (user) {
      req.user = user;
    }

    return next();
  } catch (error) {
    next(error);
  }
}

/**
 * requirePermission("user.delete")
 * RBAC + ABAC middleware
 */
export function requirePermission(permissionName: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // -----------------------------------------------------
    // RBAC CHECK
    // -----------------------------------------------------
    const hasPermission = user.userRoles.some((ur: any) =>
      ur.role.rolePermissions.some(
        (rp: any) =>
          rp.permission.name === permissionName ||
          rp.permission.name === "*" // wildcard permission
      )
    );

    if (!hasPermission) {
      await logMetric("rbac_deny", {
        permission: permissionName,
        user: user.email
      });

      await triggerAutomationEvent("rbac.denied", {
        permission: permissionName,
        user: user.email
      });

      return res.status(403).json({ message: "Forbidden (RBAC)" });
    }

    // -----------------------------------------------------
    // ABAC CHECK
    // -----------------------------------------------------
    let rules: AbacRule[] | undefined = abacRuleCache.get(permissionName);

    if (!rules) {
      rules = await prisma.abacRule.findMany({ where: { permissionName } });
      abacRuleCache.set(permissionName, rules, 5 * 60 * 1000);
    }

    if (rules && rules.length > 0) {
      const result = await evaluateAbacRules(user, {}, rules);

      if (!result.allow) {
        await logMetric("abac_deny", {
          rule: result.failedRule,
          permission: permissionName,
          user: user.email
        });

        await triggerAutomationEvent("abac.denied", {
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

    return next();
  };
}
