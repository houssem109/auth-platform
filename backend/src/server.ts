// src/server.ts
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

const app = express();

app.use(cors());

// JSON for normal requests
app.use(express.json());

// text parser for CSV import
app.use(express.text({ type: "text/csv" }));

// Routes
app.use("/api/users", userRouter);
app.use("/api/roles", roleRouter);
app.use("/api/permissions", permissionRouter);
app.use("/api/audit", auditRouter);
app.use("/api/abac-rules", abacRouter);
app.use("/api/metrics", metricsRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/automation", automationRouter);

// Global error handler
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("🔥 Express Error:", err);
    res.status(500).json({ error: err?.message || "Internal Server Error" });
  }
);

export default app;
