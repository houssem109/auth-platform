import cron from "node-cron";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Every 1 minute, check if too many denies happened.
 */
cron.schedule("* * * * *", async () => {
  try {
    const oneMinuteAgo = new Date(Date.now() - 60_000);

    // Count RBAC + ABAC denies in the last minute
    const denyCount = await prisma.metricEvent.count({
      where: {
        type: { in: ["rbac_deny", "abac_deny"] },
        createdAt: { gte: oneMinuteAgo },
      },
    });

    const THRESHOLD = 10; // You can change this

    if (denyCount > THRESHOLD) {
      console.warn(
        `🚨 SECURITY ALERT: High number of access denies (${denyCount} in the last minute)`
      );

      // Optionally log in DB as a system error
      await prisma.systemError.create({
        data: {
          message: `High deny rate: ${denyCount} denies in last minute`,
          code: "SECURITY_ALERT",
          path: "/security/monitor",
          method: "CRON",
        },
      });

      // OPTIONAL — trigger webhook for Slack / Discord / Email
      // await fetch("WEBHOOK_URL", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ denies: denyCount })
      // });
    }
  } catch (err) {
    console.error("Security alert cron failed:", err);
  }
});
