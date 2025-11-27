// src/middleware/performanceMonitor.ts
import { Request, Response, NextFunction } from "express";

export function performanceMonitor(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const start = Date.now();

  // when the response is finished, measure the duration
  res.on("finish", () => {
    const duration = Date.now() - start;

    // Log every request duration (optional)
    // console.log(`[PERF] ${req.method} ${req.path} - ${duration}ms`);

    // Only log slow ones ( > 500 ms )
    if (duration > 500) {
      console.warn(
        `[PERF] Slow API detected: ${req.method} ${req.path} - ${duration}ms`
      );
    }
  });

  next();
}
