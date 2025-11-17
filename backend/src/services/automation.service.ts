import { PrismaClient } from "@prisma/client";
import { withRetry } from "./system.service";

const prisma = new PrismaClient();

// Simple in-memory circuit breaker for outgoing webhooks
let breakerOpen = false;
let breakerOpenedAt = 0;
const BREAKER_TIMEOUT_MS = 30_000; // 30s
const FAILURE_THRESHOLD = 3;
let failureCount = 0;

function canCallWebhooks(): boolean {
  if (!breakerOpen) return true;
  const now = Date.now();
  if (now - breakerOpenedAt > BREAKER_TIMEOUT_MS) {
    breakerOpen = false;
    failureCount = 0;
    return true;
  }
  return false;
}

function registerSuccess() {
  failureCount = 0;
  breakerOpen = false;
}

function registerFailure() {
  failureCount += 1;
  if (failureCount >= FAILURE_THRESHOLD) {
    breakerOpen = true;
    breakerOpenedAt = Date.now();
    console.warn("⚠️ Automation circuit breaker OPENED");
  }
}

/**
 * Trigger automation rules for a given event.
 * Called from routes (CSV import success/fail, ABAC deny, etc.)
 */
export async function triggerAutomationEvent(
  event: string,
  payload: any
): Promise<void> {
  // If breaker is open, skip calls
  if (!canCallWebhooks()) {
    console.warn("⚠️ Skipping automation webhook — circuit breaker open");
    return;
  }

  const rules = await prisma.automationRule.findMany({
    where: { event, enabled: true },
  });

  // Use Node 18+ global fetch
  await Promise.all(
    rules.map(async (rule) => {
      try {
        await withRetry(
          () =>
            fetch(rule.targetUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ event, payload }),
            }),
          { retries: 2, delayMs: 200 }
        );
        registerSuccess();
      } catch (err) {
        console.error("❌ Automation webhook failed:", err);
        registerFailure();
      }
    })
  );
}
