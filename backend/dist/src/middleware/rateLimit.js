"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimit = rateLimit;
const buckets = new Map();
// Simple in-memory rate limiter
function rateLimit(options) {
    const { windowMs, max } = options;
    return (req, res, next) => {
        const ip = req.ip || req.headers["x-forwarded-for"]?.toString() || "unknown";
        const key = `${ip}:${req.path}`;
        const now = Date.now();
        const bucket = buckets.get(key);
        if (!bucket || now - bucket.windowStart > windowMs) {
            buckets.set(key, { count: 1, windowStart: now });
            return next();
        }
        if (bucket.count >= max) {
            return res.status(429).json({
                success: false,
                error: {
                    code: "RATE_LIMITED",
                    message: "Too many requests, please try again later.",
                },
            });
        }
        bucket.count += 1;
        return next();
    };
}
