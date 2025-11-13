import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { fakeAuth, requirePermission } from "../middleware/auth";
import { logAction } from "../services/audit.service";

const prisma = new PrismaClient();
const router = Router();

router.use(fakeAuth);

// GET USERS
router.get("/", requirePermission("user.read"), async (req, res, next) => {
  try {
    const users = await prisma.user.findMany();
    await logAction({
      userId: req.user?.id,
      action: "user.read",
      resource: "User",
      payload: { count: users.length }
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// CREATE USER
router.post("/", requirePermission("user.create"), async (req, res, next) => {
  try {
    const user = await prisma.user.create({ data: req.body });

    await logAction({
      userId: req.user?.id,
      action: "user.create",
      resource: "User",
      payload: user
    });

    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

// UPDATE USER
router.put("/:id", requirePermission("user.update"), async (req, res, next) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: req.body
    });

    await logAction({
      userId: req.user?.id,
      action: "user.update",
      resource: "User",
      payload: user
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// ASSIGN ROLES
router.post("/:id/roles", requirePermission("role.manage"), async (req, res, next) => {
  try {
    await prisma.userRole.deleteMany({ where: { userId: req.params.id } });
    await prisma.userRole.createMany({
      data: req.body.roleIds.map((rid: string) => ({
        userId: req.params.id,
        roleId: rid
      }))
    });

    await logAction({
      userId: req.user?.id,
      action: "role.assign",
      resource: "User",
      payload: { userId: req.params.id, roles: req.body.roleIds }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// DELETE USER
router.delete("/:id", requirePermission("user.delete"), async (req, res, next) => {
  try {
    await prisma.user.delete({
      where: { id: req.params.id }
    });

    await logAction({
      userId: req.user?.id,
      action: "user.delete",
      resource: "User",
      payload: { deletedUserId: req.params.id }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
