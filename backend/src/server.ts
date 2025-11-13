import express from "express";
import cors from "cors";
import userRouter from "./routes/user.routes";
import roleRouter from "./routes/role.routes";
import permissionRouter from "./routes/permission.routes";
import auditRouter from "./routes/audit.routes";



const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRouter);
app.use("/api/roles", roleRouter);
app.use("/api/permissions", permissionRouter);
app.use("/api/audit", auditRouter);
// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("🔥 Express Error:", err);
  res.status(500).json({ error: err?.message || "Internal Server Error" });
});

export default app;
