import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { fakeAuth, requirePermission } from "../middleware/auth";
import { logAction } from "../services/audit.service";

const prisma = new PrismaClient();
const router = Router();

router.use(fakeAuth);

// GET ROLES
router.get("/", requirePermission("role.manage"), async (req, res, next) => {
  try {
    const roles = await prisma.role.findMany({
      include: { rolePermissions: { include: { permission: true } } }
    });

    await logAction({
      userId: req.user?.id,
      action: "role.read",
      resource: "Role"
    });

    res.json(roles);
  } catch (error) {
    next(error);
  }
});

// CREATE ROLE
router.post("/", requirePermission("role.manage"), async (req, res, next) => {
  try {
    const role = await prisma.role.create({ data: req.body });

    await logAction({
      userId: req.user?.id,
      action: "role.create",
      resource: "Role",
      payload: role
    });

    res.status(201).json(role);
  } catch (error) {
    next(error);
  }
});

// UPDATE ROLE
router.put("/:id", requirePermission("role.manage"), async (req, res, next) => {
  try {
    const role = await prisma.role.update({
      where: { id: req.params.id },
      data: req.body
    });

    await logAction({
      userId: req.user?.id,
      action: "role.update",
      resource: "Role",
      payload: role
    });

    res.json(role);
  } catch (error) {
    next(error);
  }
});

// DELETE ROLE
router.delete("/:id", requirePermission("role.manage"), async (req, res, next) => {
  try {
    await prisma.role.delete({ where: { id: req.params.id } });

    await logAction({
      userId: req.user?.id,
      action: "role.delete",
      resource: "Role",
      payload: { roleId: req.params.id }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// ASSIGN PERMISSIONS
router.post("/:id/permissions", requirePermission("role.manage"), async (req, res, next) => {
  try {
    await prisma.rolePermission.deleteMany({ where: { roleId: req.params.id } });

    await prisma.rolePermission.createMany({
      data: req.body.permissionIds.map((pid: string) => ({
        roleId: req.params.id,
        permissionId: pid
      }))
    });

    await logAction({
      userId: req.user?.id,
      action: "role.assignPermissions",
      resource: "Role",
      payload: {
        roleId: req.params.id,
        permissions: req.body.permissionIds
      }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
