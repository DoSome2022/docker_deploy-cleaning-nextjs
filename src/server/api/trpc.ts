import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import type { User } from "@prisma/client";

import { db } from "@/server/db";
import { auth } from "@/server/auth";
import { checkRateLimit } from "@/server/redis";

/**
 * tRPC 初始化與 context 定義
 *
 * context 每個請求都會建立一次，內含：
 *   - db       : Prisma client
 *   - user     : 目前登入使用者（未登入為 null，來自 Auth.js session）
 *   - session  : Auth.js session（未登入為 null）
 *   - ip       : 客戶 IP（X-Forwarded-For 第一格）
 */

/**
 * 客戶 IP：NPM → nginx 兩層代理下，X-Forwarded-For 第一格先至係真正客戶
 * （X-Real-IP 已被 nginx 覆寫為 NPM IP，唔可以用）
 */
function getClientIp(req?: Request): string {
  const xff = req?.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const xri = req?.headers.get("x-real-ip");
  if (xri) return xri.trim();
  return "unknown";
}

export async function createTRPCContext(opts?: { req?: Request }) {
  const session = await auth();
  const user = session?.user?.id
    ? await db.user.findUnique({ where: { id: session.user.id } })
    : null;

  return { db, user, session, ip: getClientIp(opts?.req) };
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

/**
 * Redis 限流 middleware（fail-open：Redis 唔通自動放行）
 * 所有 procedure（public/protected/admin）都經 baseProcedure，
 * 每 IP 固定窗口計數，超出配額回 429（tRPC TOO_MANY_REQUESTS）
 */
const baseProcedure = t.procedure.use(
  t.middleware(async ({ ctx, next }) => {
    const { allowed, retryAfter } = await checkRateLimit(ctx.ip);
    if (!allowed) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: `請求次數過多，請約 ${retryAfter} 秒後再試`,
      });
    }
    return next();
  }),
);

export const publicProcedure = baseProcedure;
export const protectedProcedure = baseProcedure.use(isAuthed);
export const adminProcedure = baseProcedure.use(isAdmin);
