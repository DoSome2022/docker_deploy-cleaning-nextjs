"use client";

import { createTRPCReact } from "@trpc/react-query";

import type { AppRouter } from "@/server/api/root";

/**
 * 前端 tRPC client（型別安全）
 * 用法：`const { data } = trpc.application.list.useQuery({})`
 */
export const trpc = createTRPCReact<AppRouter>();
