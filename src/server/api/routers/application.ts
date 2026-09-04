import { TRPCError } from "@trpc/server";

import {
  adminProcedure,
  protectedProcedure,
  publicProcedure,
  router,
} from "@/server/api/trpc";
import {
  applicationCreateSchema,
  applicationListSchema,
  applicationByIdSchema,
  applicationAssignSchema,
  applicationDetailSchema,
  applicationPaymentSchema,
  applicationSetStatusSchema,
} from "@/lib/validators/application";
import {
  ApplicationStatus,
  PaymentStatus,
  FollowUpAction,
  ServiceType,
  type Prisma,
} from "@prisma/client";

/**
 * 申請表 router：對應原 Django 的 Application 系列 view
 *
 * 狀態機：
 *   PENDING_CONTACT → CONTACTED → COMPLETED / NOT_ACCEPTED → (reopen) CONTACTED
 *
 * 時間戳（contactedAt / completedAt）由 server 在動作當下寫入，之後不可改。
 */

// 列表資料的 include（連同 detail 與 logs 一起撈）
const listInclude = {
  assignedTo: { select: { id: true, username: true, name: true } },
  detail: true,
} satisfies Prisma.ApplicationInclude;

export const applicationRouter = router({
  // ── 公開：客人提交申請 ──
  create: publicProcedure
    .input(applicationCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const app = await ctx.db.application.create({
        data: {
          ...input,
          // 同步建立空的補充資料（對應原 perform_create）
          detail: { create: {} },
        },
        include: listInclude,
      });
      return app;
    }),

  // ── 列表（登入後，分頁 + 篩選）──
  list: protectedProcedure
    .input(applicationListSchema)
    .query(async ({ ctx, input }) => {
      const where: Prisma.ApplicationWhereInput = {};

      if (input.status) where.status = input.status as ApplicationStatus;
      if (input.paymentStatus)
        where.paymentStatus = input.paymentStatus as PaymentStatus;
      if (input.year) where.completedAt = { gte: new Date(input.year, 0, 1), lt: new Date(input.year + 1, 0, 1) };
      if (input.month) {
        // 月份篩選需搭配年份，否則只會篩到該年該月
        const year = input.year ?? new Date().getFullYear();
        where.completedAt = {
          gte: new Date(year, input.month - 1, 1),
          lt: new Date(year, input.month, 1),
        };
      }

      // 不分頁模式（給財務統計用）
      if (input.noPagination) {
        const items = await ctx.db.application.findMany({
          where,
          include: listInclude,
          orderBy: { createdAt: "desc" },
        });
        return { items, total: items.length };
      }

      const [items, total] = await ctx.db.$transaction([
        ctx.db.application.findMany({
          where,
          include: listInclude,
          orderBy: { createdAt: "desc" },
          skip: (input.page - 1) * input.pageSize,
          take: input.pageSize,
        }),
        ctx.db.application.count({ where }),
      ]);

      return { items, total, page: input.page, pageSize: input.pageSize };
    }),

  // ── 單筆（含 logs）──
  byId: protectedProcedure
    .input(applicationByIdSchema)
    .query(async ({ ctx, input }) => {
      const app = await ctx.db.application.findUnique({
        where: { id: input.id },
        include: {
          ...listInclude,
          logs: {
            include: { user: { select: { username: true, name: true } } },
            orderBy: { createdAt: "desc" },
          },
        },
      });
      if (!app) throw new TRPCError({ code: "NOT_FOUND", message: "申請不存在" });
      return app;
    }),

  // ── 指派負責人 ──
  assign: protectedProcedure
    .input(applicationAssignSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.application.update({
        where: { id: input.id },
        data: { assignedToId: input.assignedToId },
        include: listInclude,
      });
    }),

  // ── 更新內部補充資料（staff/admin）──
  updateDetail: protectedProcedure
    .input(applicationDetailSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, serviceType, ...detailData } = input;

      // 同步更新 Application.serviceType（對應原 perform_update）
      await ctx.db.application.update({
        where: { id },
        data: { serviceType: serviceType ? (serviceType as never) : undefined },
      });

      return ctx.db.applicationDetail.upsert({
        where: { applicationId: id },
        create: { applicationId: id, ...detailData, updatedById: ctx.user.id },
        update: { ...detailData, updatedById: ctx.user.id },
      });
    }),

  // ── 專用動作：標記已聯繫（寫入 contactedAt，不可改）──
  markContacted: protectedProcedure
    .input(applicationByIdSchema)
    .mutation(async ({ ctx, input }) => {
      const app = await ctx.db.application.findUnique({ where: { id: input.id } });
      if (!app) throw new TRPCError({ code: "NOT_FOUND" });
      if (app.status !== "PENDING_CONTACT") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "此申請已聯繫過，聯繫時間無法更改" });
      }

      const updated = await ctx.db.application.update({
        where: { id: input.id },
        data: { status: "CONTACTED", contactedAt: new Date() },
        include: listInclude,
      });

      await ctx.db.followUpLog.create({
        data: {
          applicationId: input.id,
          userId: ctx.user.id,
          action: FollowUpAction.CONTACT,
          note: "已聯繫客人",
        },
      });

      return updated;
    }),

  // ── 專用動作：標記完成（寫入 completedAt，不可改）──
  markCompleted: protectedProcedure
    .input(applicationByIdSchema)
    .mutation(async ({ ctx, input }) => {
      const app = await ctx.db.application.findUnique({ where: { id: input.id } });
      if (!app) throw new TRPCError({ code: "NOT_FOUND" });
      if (app.status !== "CONTACTED") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "只有「已聯繫」的申請可以標示已完成" });
      }

      const updated = await ctx.db.application.update({
        where: { id: input.id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          paymentStatus: "UNPAID", // 預設未找數，等 Admin 改
        },
        include: listInclude,
      });

      await ctx.db.followUpLog.create({
        data: {
          applicationId: input.id,
          userId: ctx.user.id,
          action: FollowUpAction.COMPLETED,
          note: "工程已完成",
        },
      });

      return updated;
    }),

  // ── 標記未採納 ──
  markNotAccepted: protectedProcedure
    .input(applicationByIdSchema)
    .mutation(async ({ ctx, input }) => {
      const app = await ctx.db.application.findUnique({ where: { id: input.id } });
      if (!app) throw new TRPCError({ code: "NOT_FOUND" });
      if (app.status !== "CONTACTED") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "只有「已聯繫」的申請可標示未採納" });
      }

      const updated = await ctx.db.application.update({
        where: { id: input.id },
        data: { status: "NOT_ACCEPTED" },
        include: listInclude,
      });

      await ctx.db.followUpLog.create({
        data: {
          applicationId: input.id,
          userId: ctx.user.id,
          action: FollowUpAction.NOTE,
          note: "未採納（潛在客，可再報價）",
        },
      });

      return updated;
    }),

  // ── 客人反悔：未採納 → 轉回跟進中（只有 Admin）──
  reopen: adminProcedure
    .input(applicationByIdSchema)
    .mutation(async ({ ctx, input }) => {
      const app = await ctx.db.application.findUnique({ where: { id: input.id } });
      if (!app) throw new TRPCError({ code: "NOT_FOUND" });
      if (app.status !== "NOT_ACCEPTED") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "只有「未採納」的申請可以轉回跟進中" });
      }

      const updated = await ctx.db.application.update({
        where: { id: input.id },
        data: { status: "CONTACTED" }, // 保留原 contactedAt
        include: listInclude,
      });

      await ctx.db.followUpLog.create({
        data: {
          applicationId: input.id,
          userId: ctx.user.id,
          action: FollowUpAction.NOTE,
          note: "客人反悔，轉回跟進中",
        },
      });

      return updated;
    }),

  // ── 付款狀態（只有 Admin）──
  setPayment: adminProcedure
    .input(applicationPaymentSchema)
    .mutation(async ({ ctx, input }) => {
      const app = await ctx.db.application.findUnique({ where: { id: input.id } });
      if (!app) throw new TRPCError({ code: "NOT_FOUND" });
      if (app.status !== "COMPLETED") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "只有「已完成」申請可設定找數狀態" });
      }

      return ctx.db.application.update({
        where: { id: input.id },
        data: { paymentStatus: input.paymentStatus },
        include: listInclude,
      });
    }),

  // ── 設定狀態（admin 任意改；staff 已完成鎖死）──
  setStatus: protectedProcedure
    .input(applicationSetStatusSchema)
    .mutation(async ({ ctx, input }) => {
      const app = await ctx.db.application.findUnique({ where: { id: input.id } });
      if (!app) throw new TRPCError({ code: "NOT_FOUND" });

      // ⛔ 規則：已完成鎖死，staff 不能轉去其他狀態（admin 才可）
      if (ctx.user.role !== "ADMIN" && app.status === "COMPLETED" && input.status !== "COMPLETED") {
        throw new TRPCError({ code: "FORBIDDEN", message: "已完成申請不能轉去其他狀態（只有 Admin 可修改）" });
      }

      const now = new Date();
      const data: Prisma.ApplicationUpdateInput = { status: input.status as ApplicationStatus };

      // 時間戳自動維護（不會覆蓋已存在的時間）
      if (input.status === "CONTACTED" && !app.contactedAt) data.contactedAt = now;
      if (input.status === "COMPLETED") {
        if (!app.completedAt) data.completedAt = now;
        if (!app.paymentStatus) data.paymentStatus = "UNPAID";
      }

      const updated = await ctx.db.application.update({
        where: { id: input.id },
        data,
        include: listInclude,
      });

      const who = ctx.user.role === "ADMIN" ? "Admin" : "Staff";
      await ctx.db.followUpLog.create({
        data: {
          applicationId: input.id,
          userId: ctx.user.id,
          action: FollowUpAction.NOTE,
          note: `${who} 將狀態更改為「${input.status}」`,
        },
      });

      return updated;
    }),
});
