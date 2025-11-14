import { PrismaClient } from "@prisma/client";
import axios from "axios";

const prisma = new PrismaClient();

export async function triggerAutomationEvent(
  event: string,
  payload: Record<string, any>
) {
  const rules = await prisma.automationRule.findMany({
    where: { event, enabled: true },
  });

  for (const rule of rules) {
    try {
      await axios.post(rule.targetUrl, {
        event,
        payload,
        triggeredAt: new Date(),
      });
    } catch (err: any) {
      console.error("Automation webhook failed:", err.message);
    }
  }
}
