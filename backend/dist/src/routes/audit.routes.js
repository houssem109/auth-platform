"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
router.use(auth_1.fakeAuth);
// only super_admin or special permission
router.get("/", (0, auth_1.requirePermission)("audit.read"), async (_req, res, next) => {
    try {
        const logs = await prisma.auditLog.findMany({
            include: { user: true },
            orderBy: { createdAt: "desc" }
        });
        res.json(logs);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
