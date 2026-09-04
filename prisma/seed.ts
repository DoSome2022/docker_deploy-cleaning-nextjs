/**
 * Prisma seed：建立初始 admin / staff 帳號
 * 執行方式：npm run db:seed
 */
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);
  const staffPassword = await bcrypt.hash("staff123", 10);

  // upsert：避免重複執行時出錯
  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      passwordHash: adminPassword,
      name: "系統管理員",
      role: Role.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { username: "staff" },
    update: {},
    create: {
      username: "staff",
      passwordHash: staffPassword,
      name: "清潔員工",
      role: Role.STAFF,
    },
  });

  console.log("✅ 初始帳號建立完成：");
  console.log("   admin / admin123（管理員）");
  console.log("   staff / staff123（員工）");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
