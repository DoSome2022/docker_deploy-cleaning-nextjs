import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import type { User } from "@prisma/client";

import { db } from "@/server/db";
import { auth } from "@/server/auth";

/**
 * tRPC 初始化與 context 定義
 *
 * context 每個請求都會建立一次，內含：
 *   - db       : Prisma client
 *   - user     : 目前登入使用者（未登入為 null，來自 Auth.js session）
 *   - session  : Auth.js session（未登入為 null）
 */

export async function createTRPCContext() {
  const session = await auth();
  const user = session?.user?.id
    ? await db.user.findUnique({ where: { id: session.user.id } })
    : null;

  return { db, user, session };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    // 把 zod 錯誤整理進 response，方便前端顯示欄位錯誤
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;
export const middleware = t.middleware;

/**
 * 權限 middleware
 */

// 需登入（Staff / Admin 皆可）
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "請先登入" });
  }
  return next({ ctx: { user: ctx.user as User } });
});

// 需管理員（Admin）
const isAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "請先登入" });
  }
  if (ctx.user.role !== "ADMIN") {
    throw new TRPCError({ code: "FORBIDDEN", message: "只有管理員可執行" });
  }
  return next({ ctx: { user: ctx.user as User } });
});

export const protectedProcedure = t.procedure.use(isAuthed);
export const adminProcedure = t.procedure.use(isAdmin);
