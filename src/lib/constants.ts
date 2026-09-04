/**
 * 全站共用常數（對應原 Django models 的 choices）
 * 放在 lib 層，前後端都能 import。
 */

// ── 申請狀態（key 對應 Prisma enum）──
export const APPLICATION_STATUS = {
  PENDING_CONTACT: "待聯繫",
  CONTACTED: "已聯繫（跟進中）",
  COMPLETED: "已完成",
  NOT_ACCEPTED: "未採納（潛在客）",
} as const;

// ── 付款狀態 ──
export const PAYMENT_STATUS = {
  UNPAID: "未找數",
  PAID: "已找數",
} as const;

// ── 服務類型 ──
export const SERVICE_TYPES = {
  OFFICE: "辦公室清潔",
  HOME: "家居清潔",
  DEEP: "深層清潔",
  RENOVATION: "裝修後清潔",
  MOVE_IN: "入伙前清潔",
  CARPET: "洗地毯",
  FLOOR: "地板打蠟／拋光",
  WINDOW: "玻璃幕牆／抹窗",
  OTHER: "其他",
} as const;

// ── 跟進紀錄動作 ──
export const FOLLOWUP_ACTIONS = {
  CONTACT: "聯繫",
  QUOTE_CALL: "報價通話",
  NOTE: "備註",
  COMPLETED: "完成",
} as const;

// ── 香港 18 區 ──
export const DISTRICTS = [
  "中西區",
  "灣仔區",
  "東區",
  "南區",
  "油尖旺區",
  "深水埗區",
  "九龍城區",
  "黃大仙區",
  "觀塘區",
  "荃灣區",
  "葵青區",
  "屯門區",
  "元朗區",
  "北區",
  "大埔區",
  "沙田區",
  "西貢區",
  "離島區",
] as const;
