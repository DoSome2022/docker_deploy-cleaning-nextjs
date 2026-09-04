import type { Metadata } from "next";

import { ApplyForm } from "@/components/marketing/apply-form";

/**
 * 申請服務頁（server component，SEO）
 * 表單邏輯抽到 client 的 <ApplyForm />，兩者分離。
 */
export const metadata: Metadata = {
  title: "申請服務｜寶保清潔",
  description: "填寫申請表，我們會盡快聯絡你報價及安排清潔服務。",
};

export default function ApplyPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:py-16">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:gap-16">
        {/* 左：申請表單 */}
        <div>
          <h1 className="mb-6 text-2xl font-bold">申請服務</h1>
          <ApplyForm />
        </div>

        {/* 右：聯絡資訊 + 地圖 */}
        <div className="rounded-xl border p-8 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold">聯絡我們</h2>
          <div className="space-y-2 text-gray-600">
            <p>寶保清潔工程有限公司</p>
            <p className="text-sm">BAOBAO CLEANING ENGINEERING CO., LTD</p>
            <p className="text-sm">
              地址：Room A6, 11/F, Block A, Po Yip Building, 62-70 Texaco Road,
              Tsuen Wan, N.T., Hong Kong.
            </p>
            <p className="text-sm">Email：popocec2024@gmail.com</p>
            <p className="text-sm">WhatsApp：6588 6370</p>
            <p className="text-sm">24 小時營業</p>
          </div>
          {/* Google Map（之後可換成自己的 embed） */}
          <iframe
            title="公司位置"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d893.3561462990679!2d114.12019406044507!3d22.36781721720615!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3403f89342a31c1f%3A0x1d6779f90a1866aa!2sNew%20Territories%2C%20Tsuen%20Wan%2C%20Texaco%20Rd%2C%2062-70%E8%99%9F%2C%20Po%20Yip%20Building%2C%20TOWER%20B!5e0!3m2!1sen!2shk!4v1787907493363!5m2!1sen!2shk"
            width="100%"
            height="320"
            className="mt-6"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      </div>
    </div>
  );
}
