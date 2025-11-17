"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/tests/userImport.test.ts
const supertest_1 = __importDefault(require("supertest"));
const server_1 = __importDefault(require("../server"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
afterAll(async () => {
    await prisma.$disconnect();
});
describe("Bulk User Import (CSV)", () => {
    it("imports users from valid CSV", async () => {
        const csv = [
            "email,password,firstName,lastName,department,location",
            "csvuser1@example.com,secret1,Csv,User1,IT,Tunis",
            "csvuser2@example.com,secret2,Csv,User2,HR,Sousse"
        ].join("\n");
        const res = await (0, supertest_1.default)(server_1.default)
            .post("/api/users/import")
            .set("x-user-email", "superadmin@example.com")
            .set("Content-Type", "text/csv")
            .send(csv);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.imported).toBeGreaterThanOrEqual(1);
        const u1 = await prisma.user.findUnique({
            where: { email: "csvuser1@example.com" }
        });
        expect(u1).not.toBeNull();
    });
    it("returns errors and does not import when CSV is invalid", async () => {
        const badCsv = [
            "email,password,firstName,lastName,department,location",
            "not_an_email,123,Csv,Bad,IT,Tunis"
        ].join("\n");
        const res = await (0, supertest_1.default)(server_1.default)
            .post("/api/users/import")
            .set("x-user-email", "superadmin@example.com")
            .set("Content-Type", "text/csv")
            .send(badCsv);
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(Array.isArray(res.body.errors)).toBe(true);
        expect(res.body.imported).toBe(0);
        const u = await prisma.user.findUnique({
            where: { email: "not_an_email" }
        });
        expect(u).toBeNull();
    });
});
