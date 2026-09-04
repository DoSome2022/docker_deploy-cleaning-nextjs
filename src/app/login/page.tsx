import Link from "next/link";
import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/login-form";

/**
 * 登入頁（server component）
 * 表單邏輯抽到 client 的 <LoginForm />。
 */
export const metadata: Metadata = {
  title: "員工登入｜寶保清潔",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-xl border bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-2xl font-bold">員工登入</h1>
        <p className="mb-6 text-sm text-gray-500">
          管理清潔申請與跟進紀錄
        </p>
        <LoginForm />
        <p className="mt-6 text-center text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-700">
            ← 返回首頁
          </Link>
        </p>
      </div>
    </div>
  );
}
