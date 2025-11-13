import request from "supertest";
import app from "../server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

afterAll(async () => {
  await prisma.$disconnect();
});

describe("RBAC Middleware", () => {
  it("blocks user without permission from deleting", async () => {
    // Create a normal user without roles
    const userWithoutRole = await prisma.user.create({
      data: {
        email: `normal_${Date.now()}@example.com`,
        password: "123456"
      }
    });

    const targetUser = await prisma.user.create({
      data: {
        email: `target_${Date.now()}@example.com`,
        password: "123456"
      }
    });

    const res = await request(app)
      .delete(`/api/users/${targetUser.id}`)
      .set("x-user-email", userWithoutRole.email); // no permissions

    expect(res.status).toBe(403);
  });

  it("allows super_admin to delete user", async () => {
    const superAdmin = await prisma.user.findUnique({
      where: { email: "superadmin@example.com" }
    });

    if (!superAdmin) {
      throw new Error("superadmin@example.com not found. Did you run seed?");
    }

    const userToDelete = await prisma.user.create({
      data: {
        email: `todelete_${Date.now()}@example.com`,
        password: "123456"
      }
    });

    const res = await request(app)
      .delete(`/api/users/${userToDelete.id}`)
      .set("x-user-email", superAdmin.email);

    expect(res.status).toBe(204);

    const check = await prisma.user.findUnique({
      where: { id: userToDelete.id }
    });

    expect(check).toBeNull();
  });
});
