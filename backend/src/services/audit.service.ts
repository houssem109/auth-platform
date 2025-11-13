import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function logAction(params: {
  userId?: string;
  action: string;
  resource?: string;
  payload?: any;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        resource: params.resource,
        payload: params.payload ? JSON.stringify(params.payload) : null
      }
    });
  } catch (error) {
    console.error("🔥 Error writing audit log:", error);
  }
}
