import { z } from "zod";
import { adminProcedure, router } from "@/server/api/trpc";

/**
 * 財務 / 統計 router（只有 Admin）
 */
export const financeRouter = router({
  // 結算統計：已完成申請的已找數 / 未找數數量
  stats: adminProcedure
    .input(
      z.object({
        year: z.coerce.number().int().optional(),
        month: z.coerce.number().int().min(1).max(12).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: {
        status: "COMPLETED";
        completedAt?: { gte: Date; lt: Date };
      } = { status: "COMPLETED" };

      if (input.year) {
        where.completedAt = {
          gte: new Date(input.year, 0, 1),
          lt: new Date(input.year + 1, 0, 1),
        };
      }
      if (input.month) {
        const year = input.year ?? new Date().getFullYear();
        where.completedAt = {
          gte: new Date(year, input.month - 1, 1),
          lt: new Date(year, input.month, 1),
        };
      }

      const apps = await ctx.db.application.findMany({
        where,
        select: { id: true, paymentStatus: true },
      });

      const paid = apps.filter((a) => a.paymentStatus === "PAID").length;
      return { total: apps.length, paid, unpaid: apps.length - paid };
    }),

  // Staff 進度總覽（對應原 StaffProgressView）
  staffProgress: adminProcedure.query(async ({ ctx }) => {
    const users = await ctx.db.user.findMany({
      where: { role: "STAFF" },
      select: { id: true, username: true, name: true },
    });

    const result = [];
    for (const u of users) {
      const apps = await ctx.db.application.findMany({
        where: { assignedToId: u.id },
        select: { status: true, paymentStatus: true },
      });
      result.push({
        username: u.username,
        name: u.name,
        total: apps.length,
        pendingContact: apps.filter((a) => a.status === "PENDING_CONTACT").length,
        contacted: apps.filter((a) => a.status === "CONTACTED").length,
        completed: apps.filter((a) => a.status === "COMPLETED").length,
        notAccepted: apps.filter((a) => a.status === "NOT_ACCEPTED").length,
        paid: apps.filter((a) => a.paymentStatus === "PAID").length,
      });
    }
    return result;
  }),
});
