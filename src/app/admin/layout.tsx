import { redirect } from "next/navigation";

import { auth } from "@/server/auth";
import { AdminShell } from "@/components/admin/admin-shell";

/**
 * 後台 layout（server component）
 * - 使用 Auth.js auth() 做登入守衛：未登入 → redirect 到 /login
 * - 把使用者資料傳給 client 的 <AdminShell /> 顯示側邊欄
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <AdminShell
      user={{
        username: session.user.username,
        name: session.user.name,
        role: session.user.role,
      }}
    >
      {children}
    </AdminShell>
  );
}
