import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { auth } from "@/server/auth";
import { FinanceView } from "@/components/admin/finance-view";

/**
 * 結算及統計表頁（server component，Admin 專屬）
 * - 非 Admin 直接導回申請列表
 */
export const metadata: Metadata = {
  title: "結算及統計表｜後台",
};

export default async function FinancePage() {
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    redirect("/admin/applications");
  }

  return <FinanceView />;
}
