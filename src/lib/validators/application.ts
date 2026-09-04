import { z } from "zod";
import { APPLICATION_STATUS, PAYMENT_STATUS, SERVICE_TYPES } from "@/lib/constants";

/**
 * 申請表相關 zod schema
 */

// ── 公開申請表：只收客人填的欄位（對應原 ApplicationCreateSerializer）──
export const applicationCreateSchema = z.object({
  salutation: z.string().min(1, "請輸入稱呼"),
  phone: z.string().min(1, "請輸入聯絡電話"),
  whatsapp: z.string().optional(),
  email: z.string().email("Email 格式不正確").optional().or(z.literal("")),
  company: z.string().optional(),
  district: z.string().min(1, "請選擇地區"),
  squareFeet: z.string().optional(),
  remark: z.string().optional(),
});

export type ApplicationCreateInput = z.infer<typeof applicationCreateSchema>;

// ── 列表查詢（分頁 + 篩選）──
export const applicationListSchema = z.object({
  status: z.enum(Object.keys(APPLICATION_STATUS) as [string, ...string[]]).optional(),
  paymentStatus: z.enum(Object.keys(PAYMENT_STATUS) as [string, ...string[]]).optional(),
  year: z.coerce.number().int().optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(10),
  noPagination: z.boolean().default(false),
});

export type ApplicationListInput = z.infer<typeof applicationListSchema>;

// ── 單筆查詢 ──
export const applicationByIdSchema = z.object({
  id: z.string().min(1),
});

// ── 指派負責人 ──
export const applicationAssignSchema = z.object({
  id: z.string().min(1),
  assignedToId: z.string().nullable(),
});

// ── 更新內部補充資料 ──
export const applicationDetailSchema = z.object({
  id: z.string().min(1),
  serviceType: z.enum(Object.keys(SERVICE_TYPES) as [string, ...string[]]).optional(),
  detailedAddress: z.string().optional(),
  cleaningScope: z.string().optional(),
  accessInfo: z.string().optional(),
  internalNotes: z.string().optional(),
});

export type ApplicationDetailInput = z.infer<typeof applicationDetailSchema>;

// ── 設定付款狀態 ──
export const applicationPaymentSchema = z.object({
  id: z.string().min(1),
  paymentStatus: z.enum(["PAID", "UNPAID"]),
});

// ── 設定狀態（admin / staff）──
export const applicationSetStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(Object.keys(APPLICATION_STATUS) as [string, ...string[]]),
});
