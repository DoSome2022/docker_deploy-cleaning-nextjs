"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/trpc/react";
import { APPLICATION_STATUS, SERVICE_TYPES } from "@/lib/constants";
import { STATUS_BADGE } from "@/lib/status";

/**
 * 申請詳情（client component）
 * 包含：申請資料、狀態處理、內部補充資料、跟進紀錄。
 *
 * 註：補充資料全是「選填文字」，無複雜驗證，故用受控 state（useState）而非 react-hook-form；
 *     面向客人的申請表與登入表已用 react-hook-form + zod。
 */
export function ApplicationDetail({
  id,
  isAdmin,
}: {
  id: string;
  isAdmin: boolean;
}) {
  const utils = trpc.useUtils();

  // 補充資料表單 state
  const [detailForm, setDetailForm] = useState({
    detailedAddress: "",
    cleaningScope: "",
    accessInfo: "",
    internalNotes: "",
  });
  const [serviceType, setServiceType] = useState("");
  const [logNote, setLogNote] = useState("");

  // 資料
  const { data: app, isLoading } = trpc.application.byId.useQuery({ id });
  const { data: logs = [] } = trpc.followup.list.useQuery({
    applicationId: id,
  });

  // app 載入後同步到表單
  useEffect(() => {
    if (app) {
      setServiceType(app.serviceType ?? "");
      setDetailForm({
        detailedAddress: app.detail?.detailedAddress ?? "",
        cleaningScope: app.detail?.cleaningScope ?? "",
        accessInfo: app.detail?.accessInfo ?? "",
        internalNotes: app.detail?.internalNotes ?? "",
      });
    }
  }, [app]);

  // 統一刷新相關查詢
  const reload = () => {
    utils.application.byId.invalidate({ id });
    utils.application.list.invalidate();
    utils.followup.list.invalidate({ applicationId: id });
  };

  // ── 各種 mutation ──
  const markContacted = trpc.application.markContacted.useMutation({
    onSuccess: () => {
      reload();
      toast.success("已標記為已聯繫");
    },
    onError: (e) => toast.error(e.message),
  });

  const markCompleted = trpc.application.markCompleted.useMutation({
    onSuccess: () => {
      reload();
      toast.success("已標記為已完成");
    },
    onError: (e) => toast.error(e.message),
  });

  const markNotAccepted = trpc.application.markNotAccepted.useMutation({
    onSuccess: () => {
      reload();
      toast.success("已標記為未採納");
    },
    onError: (e) => toast.error(e.message),
  });

  const setStatus = trpc.application.setStatus.useMutation({
    onSuccess: () => {
      reload();
      toast.success("狀態已更新");
    },
    onError: (e) => toast.error(e.message),
  });

  const setPayment = trpc.application.setPayment.useMutation({
    onSuccess: () => {
      reload();
      toast.success("找數狀態已更新");
    },
    onError: (e) => toast.error(e.message),
  });

  const saveDetail = trpc.application.updateDetail.useMutation({
    onSuccess: () => {
      reload();
      toast.success("已儲存補充資料");
    },
    onError: (e) => toast.error(e.message),
  });

  const addLog = trpc.followup.create.useMutation({
    onSuccess: () => {
      utils.followup.list.invalidate({ applicationId: id });
    },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading || !app) {
    return <p className="p-8 text-gray-500">載入中…</p>;
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* 標題 */}
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-bold">
          申請 #{app.id}：{app.salutation}
          {app.company && (
            <span className="text-sm text-gray-500">（{app.company}）</span>
          )}
        </h1>
        <span className="text-sm text-gray-400">
          申請日期：{new Date(app.createdAt).toLocaleDateString()}
        </span>
      </div>

      {/* ① 申請資料 */}
      <Card className="mb-5">
        <CardHeader>
          <CardTitle>📋 申請資料（客人填寫）</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <p><span className="text-gray-500">電話：</span>{app.phone}</p>
          <p><span className="text-gray-500">WhatsApp：</span>{app.whatsapp || "—"}</p>
          <p><span className="text-gray-500">Email：</span>{app.email || "—"}</p>
          <p><span className="text-gray-500">地區：</span>{app.district}</p>
          <p><span className="text-gray-500">尺數：</span>{app.squareFeet || "—"}</p>
          <p>
            <span className="text-gray-500">狀態：</span>
            <span className={`ml-1 rounded px-2 py-0.5 text-xs text-white ${STATUS_BADGE[app.status]}`}>
              {APPLICATION_STATUS[app.status as keyof typeof APPLICATION_STATUS]}
            </span>
          </p>
          {app.remark && (
            <p className="col-span-2">
              <span className="text-gray-500">備注：</span>
              {app.remark}
            </p>
          )}
        </CardContent>
      </Card>

      {/* ② 狀態與處理 */}
      <Card className="mb-5">
        <CardHeader>
          <CardTitle>📌 狀態與處理</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 狀態下拉：Admin 任意；Staff 已完成鎖死 */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">狀態：</span>
            {isAdmin || app.status !== "COMPLETED" ? (
              <Select
                value={app.status}
                onValueChange={(v) =>
                  setStatus.mutate({
                    id,
                    status: v as keyof typeof APPLICATION_STATUS,
                  })
                }
              >
                <SelectTrigger className="w-44">
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
              <span className="text-sm text-gray-500">
                🔒 {APPLICATION_STATUS.COMPLETED}（鎖定，只有 Admin 可改）
              </span>
            )}
          </div>

          {/* 流程按鈕 */}
          <div className="flex gap-2">
            {app.status === "PENDING_CONTACT" && (
              <Button onClick={() => markContacted.mutate({ id })}>
                📞 聯繫客人（記錄時間）
              </Button>
            )}
            {app.status === "CONTACTED" && (
              <>
                <Button
                  onClick={() => markCompleted.mutate({ id })}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  ✅ 標記完成
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => markNotAccepted.mutate({ id })}
                >
                  ❌ 標記未採納
                </Button>
              </>
            )}
          </div>

          {/* 找數狀態：只有 Admin、且已完成時顯示 */}
          {app.status === "COMPLETED" && isAdmin && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">找數狀態：</span>
              <Select
                value={app.paymentStatus ?? "UNPAID"}
                onValueChange={(v) =>
                  setPayment.mutate({ id, paymentStatus: v as "PAID" | "UNPAID" })
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UNPAID">未找數</SelectItem>
                  <SelectItem value="PAID">已找數</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ③ 內部補充資料 */}
      <Card className="mb-5">
        <CardHeader>
          <CardTitle>📝 內部補充資料（客人看不到）</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>服務類型</Label>
            <Select value={serviceType || "none"} onValueChange={(v) => setServiceType(v === "none" ? "" : v)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="未指定" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">未指定</SelectItem>
                {Object.entries(SERVICE_TYPES).map(([k, label]) => (
                  <SelectItem key={k} value={k}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>詳細地址</Label>
            <Input
              className="mt-1"
              value={detailForm.detailedAddress}
              onChange={(e) => setDetailForm({ ...detailForm, detailedAddress: e.target.value })}
            />
          </div>
          <div>
            <Label>清潔範圍</Label>
            <Textarea
              className="mt-1"
              rows={2}
              value={detailForm.cleaningScope}
              onChange={(e) => setDetailForm({ ...detailForm, cleaningScope: e.target.value })}
            />
          </div>
          <div>
            <Label>進入方式／鎖匙／密碼</Label>
            <Input
              className="mt-1"
              value={detailForm.accessInfo}
              onChange={(e) => setDetailForm({ ...detailForm, accessInfo: e.target.value })}
            />
          </div>
          <div>
            <Label>內部備註</Label>
            <Textarea
              className="mt-1"
              rows={2}
              value={detailForm.internalNotes}
              onChange={(e) => setDetailForm({ ...detailForm, internalNotes: e.target.value })}
            />
          </div>
          <Button
            onClick={() =>
              saveDetail.mutate({
                id,
                serviceType:
                  (serviceType || undefined) as
                    | keyof typeof SERVICE_TYPES
                    | undefined,
                ...detailForm,
              })
            }
            disabled={saveDetail.isPending}
          >
            {saveDetail.isPending ? "儲存中…" : "儲存補充資料"}
          </Button>
        </CardContent>
      </Card>

      {/* ④ 跟進紀錄 */}
      <Card>
        <CardHeader>
          <CardTitle>✍️ 跟進紀錄</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() =>
                addLog.mutate({ applicationId: id, action: "CONTACT", note: "再次聯繫客人" })
              }
            >
              📞 再次聯繫
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                addLog.mutate({ applicationId: id, action: "QUOTE_CALL", note: "進行報價通話" })
              }
            >
              💰 報價通話
            </Button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!logNote.trim()) return;
              addLog.mutate({ applicationId: id, action: "NOTE", note: logNote });
              setLogNote("");
            }}
            className="flex gap-2"
          >
            <Input
              placeholder="新增備註…"
              value={logNote}
              onChange={(e) => setLogNote(e.target.value)}
            />
            <Button type="submit" variant="secondary">
              記錄
            </Button>
          </form>

          <ul className="space-y-2 text-sm">
            {logs.length === 0 && <li className="text-gray-400">（暫無紀錄）</li>}
            {logs.map((log) => (
              <li key={log.id} className="rounded bg-gray-50 px-3 py-2">
                <span className="text-xs text-gray-400">
                  {new Date(log.createdAt).toLocaleString()}
                </span>{" "}
                <strong>{log.user?.name ?? log.user?.username}</strong> ·{" "}
                {log.note}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
