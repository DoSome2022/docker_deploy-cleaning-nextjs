"use client";

import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import superjson from "superjson";

import { trpc } from "@/trpc/react";
import { makeQueryClient } from "@/trpc/query-client";

/**
 * tRPC Provider：包住整個 app，提供 react-query + tRPC client
 * 放在 root layout 內。
 */
export function TRPCReactProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = makeQueryClient();

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        // 開發時印出請求 log
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === "development" ||
            (opts.direction === "down" && opts.result instanceof Error),
        }),
        httpBatchLink({
          url: "/api/trpc",
          transformer: superjson,
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
