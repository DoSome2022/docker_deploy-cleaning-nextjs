"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * 公開網站導覽列（client component，需用 usePathname 判斷目前頁面 + 手機選單）
 */
const NAV_LINKS = [
  { href: "/", label: "首頁" },
  { href: "/service", label: "服務項目" },
  { href: "/case", label: "工程案例" },
  { href: "/about", label: "關於我們" },
  { href: "/faq", label: "常見問題" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-bold text-emerald-600">寶保清潔</span>
          <span className="hidden text-xs text-gray-500 sm:inline">
            寶保清潔工程有限公司
          </span>
        </Link>

        {/* 桌面選單 */}
        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm text-gray-600 transition-colors hover:text-emerald-600",
                pathname === link.href && "font-medium text-emerald-600"
              )}
            >
              {link.label}
            </Link>
          ))}
          <Button asChild>
            <Link href="/apply">申請服務</Link>
          </Button>
        </nav>

        {/* 手機漢堡按鈕 */}
        <button
          className="md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="選單"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {/* 手機選單 */}
      {open && (
        <nav className="border-t bg-white px-4 py-3 md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block py-2 text-sm text-gray-700 hover:text-emerald-600"
            >
              {link.label}
            </Link>
          ))}
          <Button asChild className="mt-2 w-full">
            <Link href="/apply" onClick={() => setOpen(false)}>
              申請服務
            </Link>
          </Button>
        </nav>
      )}
    </header>
  );
}
