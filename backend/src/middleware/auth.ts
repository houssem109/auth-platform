import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";

const prisma = new PrismaClient();

// We will attach user object here
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * fakeAuth:
 * - Reads header "x-user-email"
 * - If present: loads that user + roles + permissions
 * - Else: loads first user in DB (e.g. super_admin)
 */
export async function fakeAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const email = req.header("x-user-email") || undefined;

    let user = null;

    if (email) {
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
    } else {
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

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * requirePermission("user.delete")
 * - If no user: 401
 * - If user has permission: next()
 * - Else: 403
 */
export function requirePermission(permissionName: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const hasPermission = user.userRoles.some((ur: any) =>
      ur.role.rolePermissions.some(
        (rp: any) => rp.permission.name === permissionName
      )
    );

    if (!hasPermission) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
}
