// src/routes/abac.routes.ts
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { fakeAuth, requirePermission } from "../middleware/auth";
import { evaluateAbacRules } from "../services/abac";

const prisma = new PrismaClient();
const router = Router();

router.use(fakeAuth);

// GET all ABAC rules
router.get(
  "/",
  requirePermission("abac.manage"),
  async (_req, res, next) => {
    try {
      const rules = await prisma.abacRule.findMany({
        orderBy: { createdAt: "desc" }
      });
      res.json(rules);
    } catch (error) {
      next(error);
    }
  }
);

// CREATE rule
router.post(
  "/",
  requirePermission("abac.manage"),
  async (req, res, next) => {
    try {
      const rule = await prisma.abacRule.create({
        data: req.body
      });
      res.status(201).json(rule);
    } catch (error) {
      next(error);
    }
  }
);

// UPDATE rule
router.put(
  "/:id",
  requirePermission("abac.manage"),
  async (req, res, next) => {
    try {
      const rule = await prisma.abacRule.update({
        where: { id: req.params.id },
        data: req.body
      });
      res.json(rule);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE rule
router.delete(
  "/:id",
  requirePermission("abac.manage"),
  async (req, res, next) => {
    try {
      await prisma.abacRule.delete({
        where: { id: req.params.id }
      });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

// SANDBOX / EVALUATE
router.post(
  "/evaluate",
  async (req, res, next) => {
    try {
      const { user, resource, rules } = req.body;

      // MUST await the async function
      const result = await evaluateAbacRules(user, resource, rules);

      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
