"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const role_routes_1 = __importDefault(require("./routes/role.routes"));
const permission_routes_1 = __importDefault(require("./routes/permission.routes"));
const audit_routes_1 = __importDefault(require("./routes/audit.routes"));
const abac_routes_1 = __importDefault(require("./routes/abac.routes"));
const metrics_routes_1 = __importDefault(require("./routes/metrics.routes"));
const reports_routes_1 = __importDefault(require("./routes/reports.routes"));
const automation_routes_1 = __importDefault(require("./routes/automation.routes"));
const system_routes_1 = __importDefault(require("./routes/system.routes"));
const systemErrors_routes_1 = __importDefault(require("./routes/systemErrors.routes"));
const rateLimit_1 = require("./middleware/rateLimit");
const system_service_1 = require("./services/system.service");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
// Normal JSON requests
app.use(express_1.default.json());
// CSV import requests
app.use(express_1.default.text({ type: "text/csv" }));
// Global lightweight rate limiting (e.g. 100 req / 15s per IP+path)
app.use((0, rateLimit_1.rateLimit)({
    windowMs: 15000,
    max: 100,
}));
// Routes
app.use("/api/users", user_routes_1.default);
app.use("/api/roles", role_routes_1.default);
app.use("/api/permissions", permission_routes_1.default);
app.use("/api/audit", audit_routes_1.default);
app.use("/api/abac-rules", abac_routes_1.default);
app.use("/api/metrics", metrics_routes_1.default);
app.use("/api/reports", reports_routes_1.default);
app.use("/api/automation", automation_routes_1.default);
app.use("/api/system", system_routes_1.default);
app.use("/api/system-errors", systemErrors_routes_1.default);
// Global error handler (structured)
app.use(async (err, req, res, _next) => {
    const status = err.status || 500;
    const code = err.code || "INTERNAL_ERROR";
    console.error("🔥 Express Error:", err);
    // Async log to DB (don't block response)
    void (0, system_service_1.logSystemError)({
        message: err.message || "Unknown error",
        code: String(code),
        stack: err.stack,
        path: req.path,
        method: req.method,
        userEmail: req.user?.email,
    });
    res.status(status).json({
        success: false,
        error: {
            message: err.message || "Internal Server Error",
            code,
        },
    });
});
exports.default = app;
