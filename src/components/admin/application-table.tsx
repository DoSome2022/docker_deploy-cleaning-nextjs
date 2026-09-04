"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/trpc/react";
import { APPLICATION_STATUS } from "@/lib/constants";
import { STATUS_BADGE } from "@/lib/status";

interface ApplicationTableProps {
  status?: string; // 篩選狀態（可選）
  isAdmin: boolean;
  noPagination?: boolean;
}

/**
 * 申請列表共用表格（client component）
 * - 用 tRPC application.list 抓資料（分頁 + 篩選）
 * - 狀態可直接下拉修改（Admin 任意；Staff 已完成鎖死）
 */
export function ApplicationTable({
  status,
  isAdmin,
  noPagination = false,
}: ApplicationTableProps) {
  const utils = trpc.useUtils();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 篩選條件改變時回到第一頁
  useEffect(() => {
    setPage(1);
  }, [status]);

  const { data, isLoading } = trpc.application.list.useQuery({
    // 只在有值時才帶 status，避免空字串觸發 zod enum 驗證錯誤
    ...(status ? { status } : {}),
    page,
    pageSize,
    noPagination,
  });

  const setStatusMutation = trpc.application.setStatus.useMutation({
    onSuccess: () => {
      utils.application.list.invalidate();
    },
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const changeStatus = (
    id: string,
    newStatus: keyof typeof APPLICATION_STATUS
  ) => {
    if (!window.confirm("確定更改此申請的狀態？")) return;
    setStatusMutation.mutate({ id, status: newStatus });
  };

  if (isLoading) {
    return <p className="py-8 text-center text-gray-500">載入中…</p>;
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>稱呼</TableHead>
              <TableHead>電話</TableHead>
              <TableHead>地區</TableHead>
              <TableHead>尺數</TableHead>
              <TableHead>狀態</TableHead>
              <TableHead>申請日期</TableHead>
              <TableHead>更多</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-gray-400">
                  暫無申請
                </TableCell>
              </TableRow>
            ) : (
              items.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    {a.salutation}
                    {a.company && (
                      <small className="ml-1 text-gray-500">（{a.company}）</small>
                    )}
                  </TableCell>
                  <TableCell>{a.phone}</TableCell>
                  <TableCell>{a.district}</TableCell>
                  <TableCell>{a.squareFeet || "—"}</TableCell>
                  <TableCell>
                    {isAdmin || a.status !== "COMPLETED" ? (
                      <Select
                        value={a.status}
                        onValueChange={(v) =>
                          changeStatus(a.id, v as keyof typeof APPLICATION_STATUS)
                        }
                      >
                        <SelectTrigger className="h-8 w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(APPLICATION_STATUS).map(([k, label]) => (
                            <SelectItem key={k} value={k}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span
                        className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[a.status]}`}
                      >
                        🔒 {APPLICATION_STATUS[a.status as keyof typeof APPLICATION_STATUS]}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(a.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/applications/${a.id}`}>查看</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 分頁控制 */}
      {!noPagination && total > pageSize && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span>
            共 {total} 筆 · 第 {page} / {totalPages} 頁
          </span>
          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="rounded border px-2 py-1 text-sm"
            >
              <option value={10}>10 / 頁</option>
              <option value={20}>20 / 頁</option>
              <option value={50}>50 / 頁</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              上一頁
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              下一頁
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
