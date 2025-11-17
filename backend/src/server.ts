import express from "express";
import cors from "cors";

import userRouter from "./routes/user.routes";
import roleRouter from "./routes/role.routes";
import permissionRouter from "./routes/permission.routes";
import auditRouter from "./routes/audit.routes";
import abacRouter from "./routes/abac.routes";
import metricsRouter from "./routes/metrics.routes";
import reportsRouter from "./routes/reports.routes";
import automationRouter from "./routes/automation.routes";
import systemRouter from "./routes/system.routes";
import systemErrorsRouter from "./routes/systemErrors.routes";

import { rateLimit } from "./middleware/rateLimit";
import { logSystemError } from "./services/system.service";

const app = express();

app.use(cors());

// Normal JSON requests
app.use(express.json());

// CSV import requests
app.use(express.text({ type: "text/csv" }));

// Global lightweight rate limiting (e.g. 100 req / 15s per IP+path)
app.use(
  rateLimit({
    windowMs: 15_000,
    max: 100,
  })
);

// Routes
app.use("/api/users", userRouter);
app.use("/api/roles", roleRouter);
app.use("/api/permissions", permissionRouter);
app.use("/api/audit", auditRouter);
app.use("/api/abac-rules", abacRouter);
app.use("/api/metrics", metricsRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/automation", automationRouter);
app.use("/api/system", systemRouter);
app.use("/api/system-errors", systemErrorsRouter);

// Global error handler (structured)
app.use(
  async (
    err: any,
    req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    const status = err.status || 500;
    const code = err.code || "INTERNAL_ERROR";

    console.error("🔥 Express Error:", err);

    // Async log to DB (don't block response)
    void logSystemError({
      message: err.message || "Unknown error",
      code: String(code),
      stack: err.stack,
      path: req.path,
      method: req.method,
      userEmail: (req as any).user?.email,
    });

    res.status(status).json({
      success: false,
      error: {
        message: err.message || "Internal Server Error",
        code,
      },
    });
  }
);

export default app;
