import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

/**
 * tRPC HTTP handler（App Router）
 * 所有 `/api/trpc/*` 請求都由這裡處理。
 */
const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: (opts) => createTRPCContext({ req: opts.req }),
    onError:
      process.env.NODE_ENV === "development"
        ? ({ path, error }) => console.error(`tRPC failed on ${path}:`, error)
        : undefined,
  });

export { handler as GET, handler as POST };
