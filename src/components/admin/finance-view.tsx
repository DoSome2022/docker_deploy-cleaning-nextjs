"use client";

import { useMemo, useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/trpc/react";

/**
 * 結算及統計表（client component，Admin 專屬）
 * - 篩選年份 / 月份 / 找數狀態（用原生 select，支援「全部」空值）
 * - 顯示已找數 / 未找數統計
 * - 表格中可直接改找數狀態
 */
export function FinanceView() {
  const utils = trpc.useUtils();
  const currentYear = new Date().getFullYear();

  const [year, setYear] = useState(String(currentYear));
  const [month, setMonth] = useState("");
  const [pay, setPay] = useState("");

  const availableYears = useMemo(() => {
    const years: number[] = [];
    for (let y = 2026; y <= currentYear; y++) years.push(y);
    return years;
  }, [currentYear]);

  // 「全部」→ undefined，才不會把 "all" 送進 zod enum
  const yearNum = year ? Number(year) : undefined;
  const monthNum = month ? Number(month) : undefined;
  const payVal = pay || undefined;

  // 統計摘要
  const { data: stats } = trpc.finance.stats.useQuery({
    ...(yearNum ? { year: yearNum } : {}),
    ...(monthNum ? { month: monthNum } : {}),
  });

  // 已完成申請列表（不分頁）
  const { data } = trpc.application.list.useQuery({
    status: "COMPLETED",
    ...(payVal ? { paymentStatus: payVal } : {}),
    ...(yearNum ? { year: yearNum } : {}),
    ...(monthNum ? { month: monthNum } : {}),
    noPagination: true,
  });

  const setPayment = trpc.application.setPayment.useMutation({
    onSuccess: () => {
      utils.application.list.invalidate();
      utils.finance.stats.invalidate();
    },
  });

  const items = data?.items ?? [];

  const selectClass = "rounded border px-2 py-1.5 text-sm";

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">結算及統計表</h1>

      {/* 統計卡片 */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        <div className="rounded-xl border bg-white p-4 text-center">
          <div className="text-2xl font-bold">{stats?.total ?? 0}</div>
          <div className="text-xs text-gray-500">總計（已完成）</div>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
          <div className="text-2xl font-bold text-emerald-600">{stats?.paid ?? 0}</div>
          <div className="text-xs text-emerald-700">✅ 已找數</div>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">{stats?.unpaid ?? 0}</div>
          <div className="text-xs text-amber-700">⏳ 未找數</div>
        </div>
      </div>

      {/* 篩選器 */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className={selectClass}
        >
          <option value="">全部年份</option>
          {availableYears.map((y) => (
            <option key={y} value={String(y)}>
              {y}
            </option>
          ))}
        </select>

        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className={selectClass}
        >
          <option value="">全部月份</option>
          {[...Array(12)].map((_, i) => (
            <option key={i + 1} value={String(i + 1)}>
              {i + 1} 月
            </option>
          ))}
        </select>

        <select
          value={pay}
          onChange={(e) => setPay(e.target.value)}
          className={selectClass}
        >
          <option value="">全部狀態</option>
          <option value="PAID">已找數</option>
          <option value="UNPAID">未找數</option>
        </select>
      </div>

      {/* 表格 */}
      <div className="overflow-x-auto rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>稱呼</TableHead>
              <TableHead>公司</TableHead>
              <TableHead>地區</TableHead>
              <TableHead>完成日期</TableHead>
              <TableHead>找數狀態</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-gray-400">
                  暫無資料
                </TableCell>
              </TableRow>
            ) : (
              items.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{a.salutation}</TableCell>
                  <TableCell>{a.company || "—"}</TableCell>
                  <TableCell>{a.district}</TableCell>
                  <TableCell>
                    {a.completedAt
                      ? new Date(a.completedAt).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <select
                      value={a.paymentStatus ?? "UNPAID"}
                      onChange={(e) =>
                        setPayment.mutate({
                          id: a.id,
                          paymentStatus: e.target.value as "PAID" | "UNPAID",
                        })
                      }
                      className={selectClass}
                    >
                      <option value="UNPAID">未找數</option>
                      <option value="PAID">已找數</option>
                    </select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
