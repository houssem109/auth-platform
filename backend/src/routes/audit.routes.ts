import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { fakeAuth, requirePermission } from "../middleware/auth";

const prisma = new PrismaClient();
const router = Router();

router.use(fakeAuth);

// only super_admin or special permission
router.get("/", requirePermission("audit.read"), async (_req, res, next) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" }
    });
    res.json(logs);
  } catch (error) {
    next(error);
  }
});

export default router;
