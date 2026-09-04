import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { TRPCReactProvider } from "@/components/providers";

/**
 * 根 layout：全站共用
 * - 提供 tRPC + react-query Provider
 * - 掛載 sonner Toaster（全域通知）
 * （各頁可用 generateMetadata 覆寫 SEO 資訊）
 */
export const metadata: Metadata = {
  title: "寶保清潔工程有限公司",
  description: "辦公室、家居、診所、商鋪及學校專業清潔服務",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-Hant">
      <body className="antialiased">
        <TRPCReactProvider>
          {children}
          <Toaster richColors position="top-right" />
        </TRPCReactProvider>
      </body>
    </html>
  );
}
