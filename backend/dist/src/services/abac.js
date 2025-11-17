"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateAbacRules = evaluateAbacRules;
const automation_service_1 = require("./automation.service");
const metrics_service_1 = require("./metrics.service");
// Helper to get current time HH:MM
function getCurrentTime() {
    const now = new Date();
    const h = now.getHours().toString().padStart(2, "0");
    const m = now.getMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
}
// Compare time in HH:MM format
function isTimeBetween(now, start, end) {
    return now >= start && now <= end;
}
// Safe JSON parser
function safeParse(value) {
    try {
        return JSON.parse(value);
    }
    catch {
        return value;
    }
}
// ABAC evaluation engine
async function evaluateAbacRules(user, resource, rules) {
    const now = getCurrentTime();
    for (const rule of rules) {
        const userValue = user?.[rule.attribute];
        const ruleValue = safeParse(rule.value);
        let violated = false;
        // -------------------------
        // Department rule
        // -------------------------
        if (rule.attribute === "department") {
            if (rule.operator === "equals" && userValue !== ruleValue) {
                violated = true;
            }
        }
        // -------------------------
        // Location rule
        // -------------------------
        if (rule.attribute === "location") {
            if (rule.operator === "in" && Array.isArray(ruleValue)) {
                if (!ruleValue.includes(userValue))
                    violated = true;
            }
        }
        // -------------------------
        // Time-of-day rule
        // -------------------------
        if (rule.attribute === "time") {
            if (rule.operator === "between" &&
                typeof ruleValue?.start === "string" &&
                typeof ruleValue?.end === "string") {
                if (!isTimeBetween(now, ruleValue.start, ruleValue.end)) {
                    violated = true;
                }
            }
        }
        // ---------------------------------------
        // If violated AND effect is DENY → block
        // ---------------------------------------
        if (violated && rule.effect === "deny") {
            // Sprint 5: record violation
            await (0, metrics_service_1.logMetric)("abac_deny", {
                user: user.email,
                rule: rule.name,
                attribute: rule.attribute
            });
            await (0, automation_service_1.triggerAutomationEvent)("abac.denied", {
                user: user.email,
                rule: rule.name
            });
            return { allow: false, failedRule: rule.name };
        }
    }
    return { allow: true };
}
