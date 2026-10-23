import type { NextConfig } from "next";

/**
 * Next.js 16 主設定檔
 * output: "standalone" — build 時輸出獨立可執行 bundle（.next/standalone），
 * 部署時唔使裝 node_modules，直接 node server.js 起機（配合 Dockerfile 用）。
 */
const nextConfig: NextConfig = {
  output: "standalone",
};

export default nextConfig;
