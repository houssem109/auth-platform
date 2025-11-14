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
 * Falls back to first user in DB if header is not provided.
 * Cached for better performance.
 */
export async function fakeAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const email = req.header("x-user-email") || undefined;
    let user = null;

    if (email) {
      const cached = userCache.get(email);
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
        userCache.set(email, user, 5 * 60 * 1000); // 5 minutes
      }

    } else {
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

    if (user) req.user = user;

    next();
  } catch (error) {
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
export function requirePermission(permissionName: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // -----------------------------------
    // RBAC CHECK
    // -----------------------------------
    const hasPermission = user.userRoles.some((ur: any) =>
      ur.role.rolePermissions.some(
        (rp: any) => rp.permission.name === permissionName
      )
    );

    if (!hasPermission) {
      // Sprint 5: log RBAC deny
      await logMetric("rbac_deny", {
        permission: permissionName,
        user: user.email
      });

      // Sprint 5: automation hook
      await triggerAutomationEvent("rbac.denied", {
        permission: permissionName,
        user: user.email
      });

      return res.status(403).json({ message: "Forbidden (RBAC)" });
    }

    // -----------------------------------
    // ABAC CHECK
    // -----------------------------------
    let rules: AbacRule[] | undefined = abacRuleCache.get(permissionName);

    if (!rules) {
      rules = await prisma.abacRule.findMany({ where: { permissionName } });
      abacRuleCache.set(permissionName, rules, 5 * 60 * 1000);
    }

    if (rules && rules.length > 0) {
      const result = await  evaluateAbacRules(user, {}, rules);

      if (!result.allow) {
        // Sprint 5: log ABAC deny
        await logMetric("abac_deny", {
          rule: result.failedRule,
          permission: permissionName,
          user: user.email
        });

        // Sprint 5: automation hook
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

    next();
  };
}
