/**
 * 狀態顯示用的 badge 樣式（Tailwind class）
 * key 對應 Prisma 的 ApplicationStatus enum
 */
export const STATUS_BADGE: Record<string, string> = {
  PENDING_CONTACT: "bg-red-500 text-white",
  CONTACTED: "bg-yellow-400 text-black",
  COMPLETED: "bg-emerald-500 text-white",
  NOT_ACCEPTED: "bg-gray-400 text-white",
};

/** 付款狀態 badge 樣式 */
export const PAYMENT_BADGE: Record<string, string> = {
  UNPAID: "bg-amber-100 text-amber-800 border border-amber-300",
  PAID: "bg-emerald-100 text-emerald-800 border border-emerald-300",
};
