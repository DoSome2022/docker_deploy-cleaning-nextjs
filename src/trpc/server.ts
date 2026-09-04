import "server-only";

import { cache } from "react";
import { createHydrationHelpers } from "@trpc/react-query/rsc";

import { createCallerFactory, createTRPCContext } from "@/server/api/trpc";
import { appRouter } from "@/server/api/root";
import { makeQueryClient } from "./query-client";

/**
 * 伺服器端 tRPC helper（用於 Server Component 直接抓資料 / SEO）
 * 用法：
 *   const data = await api.application.byId({ id })
 *   <HydrateClient> ... </HydrateClient>
 */
const createCaller = createCallerFactory(appRouter);

const getQueryClient = cache(makeQueryClient);
const caller = createCaller(createTRPCContext);

export const { trpc: api, HydrateClient } =
  createHydrationHelpers<typeof appRouter>(caller, getQueryClient);
