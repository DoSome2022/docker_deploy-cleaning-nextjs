import type { Metadata } from "next";

import { auth } from "@/server/auth";
import { ApplicationDetail } from "@/components/admin/application-detail";

/**
 * 申請詳情頁（server component）
 * - 讀取 URL 參數 id，傳給 client 的 <ApplicationDetail />
 */
export const metadata: Metadata = {
  title: "申請詳情｜後台",
};

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  return <ApplicationDetail id={id} isAdmin={isAdmin} />;
}
