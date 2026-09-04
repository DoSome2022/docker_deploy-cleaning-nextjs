import type { Metadata } from "next";

import { auth } from "@/server/auth";
import { ApplicationsView } from "@/components/admin/applications-view";

/**
 * 申請列表頁（server component）
 * - 讀取 session 判斷是否 Admin，傳給 client 元件控制 UI
 */
export const metadata: Metadata = {
  title: "申請列表｜後台",
};

export default async function ApplicationsPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  return <ApplicationsView isAdmin={isAdmin} />;
}
