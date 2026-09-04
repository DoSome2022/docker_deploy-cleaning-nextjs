"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { ClipboardList, DollarSign, LogOut, User } from "lucide-react";

import { cn } from "@/lib/utils";

interface AdminShellProps {
  user: {
    username: string;
    name?: string | null;
    role: string;
  };
  children: React.ReactNode;
}

/**
 * 後台框架（client component）
 * - 左側導覽列（含角色判斷：Admin 才顯示「結算及統計表」）
 * - 登出按鈕（Auth.js signOut）
 */
export function AdminShell({ user, children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isAdmin = user.role === "ADMIN";

  const menuItems = [
    {
      label: "所有申請",
      href: "/admin/applications",
      icon: <ClipboardList size={17} />,
    },
    ...(isAdmin
      ? [
          {
            label: "結算及統計表",
            href: "/admin/finance",
            icon: <DollarSign size={17} />,
          },
        ]
      : []),
  ];

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 側邊欄 */}
      <aside className="flex w-52 flex-col border-r bg-white">
        <div className="flex h-14 items-center border-b px-4 font-bold text-emerald-600">
          <Link href="/admin/applications">寶保清潔後台</Link>
        </div>
        <nav className="flex-1 space-y-1 px-2 py-3">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-2 text-sm text-gray-600 hover:bg-gray-100",
                pathname.startsWith(item.href) && "bg-gray-100 font-medium text-gray-900"
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="border-t p-3">
          <div className="mb-2 flex items-center gap-2 text-sm text-gray-700">
            <User size={16} />
            <span>
              {user.name ?? user.username}
              {isAdmin && <span className="ml-1 text-xs text-emerald-600">(管理員)</span>}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            <LogOut size={16} />
            <span>登出</span>
          </button>
        </div>
      </aside>

      {/* 內容區 */}
      <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
    </div>
  );
}
