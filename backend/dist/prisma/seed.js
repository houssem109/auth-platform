"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log("🌱 Seeding roles, permissions, super_admin...");
    // 1) Seed roles
    const roles = [
        { name: "super_admin", isSystem: true, description: "Full access to everything" },
        { name: "admin", isSystem: true, description: "Manage users and roles (limited)" },
        { name: "support", isSystem: true, description: "Support-level access" },
        { name: "manager", isSystem: false, description: "Business manager" },
        { name: "client", isSystem: false, description: "End user" },
        { name: "partner", isSystem: false, description: "External partner" }
    ];
    for (const role of roles) {
        await prisma.role.upsert({
            where: { name: role.name },
            update: {},
            create: role
        });
    }
    // 2) Seed permissions (Sprint 2 + 3 + 4)
    const permissions = [
        { name: "user.read", description: "Read users" },
        { name: "user.create", description: "Create users" },
        { name: "user.update", description: "Update users" },
        { name: "user.delete", description: "Delete users" },
        { name: "user.import", description: "Bulk import users from CSV" },
        { name: "role.manage", description: "Manage roles and role assignments" },
        { name: "permission.manage", description: "Manage permissions" },
        { name: "audit.read", description: "View audit logs" },
        { name: "abac.manage", description: "Manage ABAC rules" },
        { name: "abac.test", description: "Evaluate ABAC rules in sandbox" }
    ];
    for (const perm of permissions) {
        await prisma.permission.upsert({
            where: { name: perm.name },
            update: {},
            create: perm
        });
    }
    // 3) Ensure super admin user exists
    const superAdminEmail = "superadmin@example.com";
    let superAdmin = await prisma.user.findUnique({
        where: { email: superAdminEmail }
    });
    if (!superAdmin) {
        superAdmin = await prisma.user.create({
            data: {
                email: superAdminEmail,
                password: "password", // temporary plaintext
                firstName: "Super",
                lastName: "Admin",
                // IMPORTANT: ABAC FIX
                department: "HR",
                location: "Tunis"
            }
        });
    }
    else {
        // If exists, ensure department stays HR so ABAC never blocks it
        await prisma.user.update({
            where: { email: superAdminEmail },
            data: {
                department: "HR",
                location: "Tunis"
            }
        });
    }
    // 4) Attach super_admin role to user
    const superAdminRole = await prisma.role.findUnique({
        where: { name: "super_admin" }
    });
    if (!superAdminRole) {
        throw new Error("super_admin role not found");
    }
    const existingUserRole = await prisma.userRole.findUnique({
        where: {
            userId_roleId: {
                userId: superAdmin.id,
                roleId: superAdminRole.id
            }
        }
    });
    if (!existingUserRole) {
        await prisma.userRole.create({
            data: {
                userId: superAdmin.id,
                roleId: superAdminRole.id
            }
        });
    }
    // 5) Assign ALL permissions to super_admin
    const allPerms = await prisma.permission.findMany();
    for (const perm of allPerms) {
        const existingRP = await prisma.rolePermission.findUnique({
            where: {
                roleId_permissionId: {
                    roleId: superAdminRole.id,
                    permissionId: perm.id
                }
            }
        });
        if (!existingRP) {
            await prisma.rolePermission.create({
                data: {
                    roleId: superAdminRole.id,
                    permissionId: perm.id
                }
            });
        }
    }
    console.log("✅ Seed completed successfully");
}
main()
    .catch((err) => {
    console.error("❌ Seed error:", err);
})
    .finally(async () => {
    await prisma.$disconnect();
});
