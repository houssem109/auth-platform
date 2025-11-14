import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
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

  // 3) Make sure a super admin user exists
  const superAdminEmail = "superadmin@example.com";

  let superAdmin = await prisma.user.findUnique({
    where: { email: superAdminEmail }
  });

  if (!superAdmin) {
    superAdmin = await prisma.user.create({
      data: {
        email: superAdminEmail,
        password: "password", // TODO: hash later
        firstName: "Super",
        lastName: "Admin",
        department: "IT",
        location: "Tunis"
      }
    });
  }

  // 4) Attach super_admin role to that user
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

  // 5) Give super_admin ALL permissions
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

  console.log("✅ Seed completed: roles, permissions, super_admin user");
}

main()
  .catch((err) => {
    console.error("❌ Seed error:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
