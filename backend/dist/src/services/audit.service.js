"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAction = logAction;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function logAction(params) {
    try {
        await prisma.auditLog.create({
            data: {
                userId: params.userId,
                action: params.action,
                resource: params.resource,
                payload: params.payload ? JSON.stringify(params.payload) : null
            }
        });
    }
    catch (error) {
        console.error("🔥 Error writing audit log:", error);
    }
}
