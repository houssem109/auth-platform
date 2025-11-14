// src/routes/metrics.routes.ts
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { fakeAuth, requirePermission } from "../middleware/auth";
import {
  getOverviewMetrics,
  getSecurityMetrics,
  getUsageMetrics,
} from "../services/metrics.service";

const prisma = new PrismaClient();
const router = Router();

router.use(fakeAuth);

/* -------------------------------------------
   TEST METRIC EVENT
-------------------------------------------- */
router.post(
  "/test",
  requirePermission("audit.read"),
  async (req, res, next) => {
    try {
      const { type, metadata } = req.body;

      const event = await prisma.metricEvent.create({
        data: {
          type,
          metadata: JSON.stringify(metadata || {})
        }
      });

      res.json(event);
    } catch (error) {
      next(error);
    }
  }
);

/* -------------------------------------------
   DASHBOARD METRICS
-------------------------------------------- */
router.get(
  "/overview",
  requirePermission("audit.read"),
  async (_req, res) => {
    res.json(await getOverviewMetrics());
  }
);

router.get(
  "/security",
  requirePermission("audit.read"),
  async (_req, res) => {
    res.json(await getSecurityMetrics());
  }
);

router.get(
  "/usage",
  requirePermission("audit.read"),
  async (_req, res) => {
    res.json(await getUsageMetrics());
  }
);

export default router;
