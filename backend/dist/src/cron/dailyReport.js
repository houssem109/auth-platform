"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const axios_1 = __importDefault(require("axios"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
node_cron_1.default.schedule("0 8 * * *", async () => {
    console.log("📊 Daily summary report triggered");
    const users = await prisma.user.count();
    const audit = await prisma.auditLog.count();
    await axios_1.default.post("https://your-webhook.com/daily-report", {
        date: new Date(),
        users,
        audit,
    });
    console.log("📤 Daily summary sent");
});
