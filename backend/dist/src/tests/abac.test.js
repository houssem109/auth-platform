"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/tests/abac.test.ts
const supertest_1 = __importDefault(require("supertest"));
const server_1 = __importDefault(require("../server"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
afterAll(async () => {
    await prisma.$disconnect();
});
describe("ABAC Rules", () => {
    it("evaluates ABAC rules in sandbox", async () => {
        const rules = [
            {
                id: "temp",
                name: "HR only",
                description: "Deny if not HR",
                permissionName: "user.read",
                attribute: "department",
                operator: "equals",
                value: "\"HR\"",
                effect: "deny",
                createdAt: new Date().toISOString()
            }
        ];
        const res = await (0, supertest_1.default)(server_1.default)
            .post("/api/abac-rules/evaluate")
            .set("x-user-email", "superadmin@example.com")
            .send({
            user: { department: "IT", location: "Tunis" },
            resource: {},
            rules
        });
        expect(res.status).toBe(200);
        expect(res.body.allow).toBe(false);
        expect(res.body.failedRule).toBe("HR only");
    });
    it("blocks user.read when ABAC rule denies it", async () => {
        // Clean previous rules
        await prisma.abacRule.deleteMany({ where: { permissionName: "user.read" } });
        // Create ABAC rule in DB: deny user.read if department != HR
        await prisma.abacRule.create({
            data: {
                name: "Deny non-HR reading users",
                description: "Only HR can read users",
                permissionName: "user.read",
                attribute: "department",
                operator: "equals",
                value: "\"HR\"",
                effect: "deny"
            }
        });
        // superadmin has department "IT" from seed → should be denied by ABAC
        const res = await (0, supertest_1.default)(server_1.default)
            .get("/api/users")
            .set("x-user-email", "superadmin@example.com");
        expect(res.status).toBe(403);
        expect(res.body.message).toContain("ABAC");
        expect(res.body.failedRule).toBe("Deny non-HR reading users");
    });
});
