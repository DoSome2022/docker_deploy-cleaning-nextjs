import { FollowUpAction } from "@prisma/client";
import { protectedProcedure, router } from "@/server/api/trpc";
import {
  followupListSchema,
  followupCreateSchema,
} from "@/lib/validators/followup";

/**
 * 跟進紀錄 router：查詢 + 新增（對應原 FollowUpView）
 */
export const followupRouter = router({
  // 某申請的跟進紀錄列表
  list: protectedProcedure
    .input(followupListSchema)
    .query(async ({ ctx, input }) => {
      return ctx.db.followUpLog.findMany({
        where: { applicationId: input.applicationId },
        include: { user: { select: { username: true, name: true } } },
        orderBy: { createdAt: "desc" },
      });
    }),

  // 新增一筆跟進紀錄
  create: protectedProcedure
    .input(followupCreateSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.followUpLog.create({
        data: {
          applicationId: input.applicationId,
          userId: ctx.user.id,
          action: input.action as FollowUpAction,
          note: input.note ?? "",
        },
        include: { user: { select: { username: true, name: true } } },
      });
    }),
});
