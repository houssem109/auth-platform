"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
router.use(auth_1.fakeAuth);
/**
 * Get latest system errors
 */
router.get("/", (0, auth_1.requirePermission)("audit.read"), async (_req, res, next) => {
    try {
        const errors = await prisma.systemError.findMany({
            orderBy: { createdAt: "desc" },
            take: 200,
        });
        res.json(errors);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
