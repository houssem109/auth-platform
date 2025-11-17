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
describe("User API", () => {
    it("creates a user (as super_admin)", async () => {
        const uniqueEmail = `test_${Date.now()}@example.com`;
        const res = await (0, supertest_1.default)(server_1.default)
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
