import cron from "node-cron";
import axios from "axios";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

cron.schedule("0 8 * * *", async () => {
  console.log("📊 Daily summary report triggered");

  const users = await prisma.user.count();
  const audit = await prisma.auditLog.count();

  await axios.post("https://your-webhook.com/daily-report", {
    date: new Date(),
    users,
    audit,
  });

  console.log("📤 Daily summary sent");
});
