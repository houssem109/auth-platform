import { PrismaClient, SystemError } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Log unexpected system error to DB
 */
export async function logSystemError(params: {
  message: string;
  code?: string;
  stack?: string;
  path?: string;
  method?: string;
  userEmail?: string;
}): Promise<SystemError | void> {
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
  } catch (e) {
    // Last fallback: don't crash the app if logging fails
    console.error("❌ Failed to log SystemError:", e);
  }
}

/**
 * Generic retry helper for DB / network operations
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: { retries?: number; delayMs?: number } = {}
): Promise<T> {
  const retries = options.retries ?? 2;
  const delayMs = options.delayMs ?? 150;

  let lastError: any;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt === retries) break;
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }

  throw lastError;
}
