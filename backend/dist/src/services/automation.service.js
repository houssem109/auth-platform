"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerAutomationEvent = triggerAutomationEvent;
const client_1 = require("@prisma/client");
const system_service_1 = require("./system.service");
const prisma = new client_1.PrismaClient();
// Simple in-memory circuit breaker for outgoing webhooks
let breakerOpen = false;
let breakerOpenedAt = 0;
const BREAKER_TIMEOUT_MS = 30000; // 30s
const FAILURE_THRESHOLD = 3;
let failureCount = 0;
function canCallWebhooks() {
    if (!breakerOpen)
        return true;
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
async function triggerAutomationEvent(event, payload) {
    // If breaker is open, skip calls
    if (!canCallWebhooks()) {
        console.warn("⚠️ Skipping automation webhook — circuit breaker open");
        return;
    }
    const rules = await prisma.automationRule.findMany({
        where: { event, enabled: true },
    });
    // Use Node 18+ global fetch
    await Promise.all(rules.map(async (rule) => {
        try {
            await (0, system_service_1.withRetry)(() => fetch(rule.targetUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ event, payload }),
            }), { retries: 2, delayMs: 200 });
            registerSuccess();
        }
        catch (err) {
            console.error("❌ Automation webhook failed:", err);
            registerFailure();
        }
    }));
}
