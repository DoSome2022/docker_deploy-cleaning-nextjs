import { router } from "@/server/api/trpc";
import { applicationRouter } from "@/server/api/routers/application";
import { followupRouter } from "@/server/api/routers/followup";
import { staffRouter } from "@/server/api/routers/staff";
import { financeRouter } from "@/server/api/routers/finance";

/**
 * 根 router：匯總所有子 router
 * 前端透過 `trpc.<router>.<procedure>` 呼叫
 *
 * 註：登入/登出改由 Auth.js v5 處理（見 src/server/auth.ts），
 *     因此這裡不再有 auth router。
 */
export const appRouter = router({
  application: applicationRouter,
  followup: followupRouter,
  staff: staffRouter,
  finance: financeRouter,
});

export type AppRouter = typeof appRouter;
