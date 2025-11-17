"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logSystemError = logSystemError;
exports.withRetry = withRetry;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * Log unexpected system error to DB
 */
async function logSystemError(params) {
    try {
        return await prisma.systemError.create({
            data: {
                message: params.message,
                code: params.code,
                stack: params.stack,
                path: params.path,
                method: params.method,
                userEmail: params.userEmail,
            },
        });
    }
    catch (e) {
        // Last fallback: don't crash the app if logging fails
        console.error("❌ Failed to log SystemError:", e);
    }
}
/**
 * Generic retry helper for DB / network operations
 */
async function withRetry(fn, options = {}) {
    const retries = options.retries ?? 2;
    const delayMs = options.delayMs ?? 150;
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await fn();
        }
        catch (err) {
            lastError = err;
            if (attempt === retries)
                break;
            await new Promise((res) => setTimeout(res, delayMs));
        }
    }
    throw lastError;
}
