import request from "supertest";
import app from "../server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

afterAll(async () => {
  await prisma.$disconnect();
});

describe("User API", () => {
  it("creates a user (as super_admin)", async () => {
    const uniqueEmail = `test_${Date.now()}@example.com`;

    const res = await request(app)
      .post("/api/users")
      .set("x-user-email", "superadmin@example.com") // fakeAuth will load super_admin
      .send({
        email: uniqueEmail,
        password: "123456"
      });

    expect(res.status).toBe(201);
    expect(res.body.email).toBe(uniqueEmail);
  });
});
