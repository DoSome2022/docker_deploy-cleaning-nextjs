import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";

/**
 * 行銷頁群組 layout（(marketing)）
 * 所有公開頁面（首頁、服務、案例、關於、FAQ、申請）共用 Navbar + Footer。
 * 使用 route group（括號資料夾）→ 不影響 URL。
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="min-h-[70vh]">{children}</main>
      <Footer />
    </>
  );
}
