import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { fakeAuth, requirePermission } from "../middleware/auth";

const prisma = new PrismaClient();
const router = Router();

router.use(fakeAuth);

/**
 * GET all permissions
 * Requires: role.manage  (same as your roles)
 */
router.get("/", requirePermission("role.manage"), async (_req, res, next) => {
  try {
    const perms = await prisma.permission.findMany();
    res.json(perms);
  } catch (error) {
    next(error);
  }
});

/**
 * CREATE a permission
 * Requires: permission.manage
 */
router.post("/", requirePermission("permission.manage"), async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ error: "Name is required" });
    }

    const perm = await prisma.permission.create({
      data: { name: name.trim(), description }
    });

    res.status(201).json(perm);
  } catch (error) {
    next(error);
  }
});

/**
 * UPDATE a permission
 * PUT /permissions/:id
 * Requires: permission.manage
 */
router.put("/:id", requirePermission("permission.manage"), async (req, res, next) => {
  try {
    const id = req.params.id;
    const { name, description } = req.body;

    const existing = await prisma.permission.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Permission not found" });
    }

    const updated = await prisma.permission.update({
      where: { id },
      data: {
        name: name?.trim() ?? existing.name,
        description
      }
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE a permission
 * DELETE /permissions/:id
 * Requires: permission.manage
 */
router.delete("/:id", requirePermission("permission.manage"), async (req, res, next) => {
  try {
    const id = req.params.id;

    const existing = await prisma.permission.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Permission not found" });
    }

    await prisma.permission.delete({ where: { id } });

    res.json({ message: "Permission deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
