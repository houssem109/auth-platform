import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { fakeAuth, requirePermission } from "../middleware/auth";

const prisma = new PrismaClient();
const router = Router();

router.use(fakeAuth);

/**
 * Get latest system errors
 */
router.get(
  "/",
  requirePermission("audit.read"),
  async (_req, res, next) => {
    try {
      const errors = await prisma.systemError.findMany({
        orderBy: { createdAt: "desc" },
        take: 200,
      });
      res.json(errors);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
