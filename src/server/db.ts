import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client 單例（避免開發時 hot-reload 重複建立連線）
 * 全伺服器端程式都從這裡 import。
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
