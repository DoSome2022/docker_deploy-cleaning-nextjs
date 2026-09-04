import { protectedProcedure, router } from "@/server/api/trpc";

/**
 * Staff 名單 router：指派負責人時的下拉選單資料
 */
export const staffRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.user.findMany({
      select: { id: true, username: true, name: true, role: true },
      orderBy: { username: "asc" },
    });
  }),
});
