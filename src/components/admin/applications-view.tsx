"use client";

import { useState } from "react";

import { ApplicationTable } from "@/components/admin/application-table";
import { cn } from "@/lib/utils";

/**
 * 申請列表頁主體（client component）
 * - 頂部狀態 tabs（全部 / 待聯繫 / 跟進中 / 已完成 / 未採納）
 * - 依選中的 tab 篩選資料
 */
const TABS = [
  { key: "", label: "全部" },
  { key: "PENDING_CONTACT", label: "待聯繫" },
  { key: "CONTACTED", label: "跟進中" },
  { key: "COMPLETED", label: "已完成" },
  { key: "NOT_ACCEPTED", label: "未採納" },
];

export function ApplicationsView({ isAdmin }: { isAdmin: boolean }) {
  const [active, setActive] = useState("");

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">申請列表</h1>

      {/* 狀態 tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm transition-colors",
              active === tab.key
                ? "bg-emerald-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <ApplicationTable status={active || undefined} isAdmin={isAdmin} />
    </div>
  );
}
