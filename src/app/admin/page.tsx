import { redirect } from "next/navigation";

/**
 * /admin 入口：直接導向所有申請列表
 */
export default function AdminIndexPage() {
  redirect("/admin/applications");
}
