"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const server_1 = __importDefault(require("../server"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
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
        const res = await (0, supertest_1.default)(server_1.default)
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
        const res = await (0, supertest_1.default)(server_1.default)
            .delete(`/api/users/${userToDelete.id}`)
            .set("x-user-email", superAdmin.email);
        expect(res.status).toBe(204);
        const check = await prisma.user.findUnique({
            where: { id: userToDelete.id }
        });
        expect(check).toBeNull();
    });
});
