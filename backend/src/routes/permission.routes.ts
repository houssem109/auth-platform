import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { fakeAuth, requirePermission } from "../middleware/auth";

const prisma = new PrismaClient();
const router = Router();

router.use(fakeAuth);

// GET all permissions → role.manage (or permission.manage, but we reuse role.manage)
router.get("/", requirePermission("role.manage"), async (_req, res, next) => {
  try {
    const perms = await prisma.permission.findMany();
    res.json(perms);
  } catch (error) {
    next(error);
  }
});

// CREATE a permission → permission.manage
router.post("/", requirePermission("permission.manage"), async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const perm = await prisma.permission.create({
      data: { name, description }
    });
    res.status(201).json(perm);
  } catch (error) {
    next(error);
  }
});

export default router;
