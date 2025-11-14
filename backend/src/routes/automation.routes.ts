import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { fakeAuth, requirePermission } from "../middleware/auth";
import { triggerAutomationEvent } from "../services/automation.service";

const prisma = new PrismaClient();
const router = Router();

router.use(fakeAuth);

// List automation rules
router.get(
  "/rules",
  requirePermission("abac.manage"),
  async (_req, res, next) => {
    try {
      const rules = await prisma.automationRule.findMany({
        orderBy: { createdAt: "desc" }
      });
      res.json(rules);
    } catch (error) {
      next(error);
    }
  }
);

// Create rule
router.post(
  "/rules",
  requirePermission("abac.manage"),
  async (req, res, next) => {
    try {
      const rule = await prisma.automationRule.create({
        data: req.body
      });
      res.status(201).json(rule);
    } catch (error) {
      next(error);
    }
  }
);

// Update rule
router.put(
  "/rules/:id",
  requirePermission("abac.manage"),
  async (req, res, next) => {
    try {
      const rule = await prisma.automationRule.update({
        where: { id: req.params.id },
        data: req.body
      });
      res.json(rule);
    } catch (error) {
      next(error);
    }
  }
);

// Delete rule
router.delete(
  "/rules/:id",
  requirePermission("abac.manage"),
  async (req, res, next) => {
    try {
      await prisma.automationRule.delete({
        where: { id: req.params.id }
      });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

// Test trigger endpoint
router.post(
  "/trigger/test",
  requirePermission("abac.manage"),
  async (req, res, next) => {
    try {
      const { event, payload } = req.body;
      await triggerAutomationEvent(event, payload || {});
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
