import type { Metadata } from "next";

/**
 * 關於我們頁（server component）
 */
export const metadata: Metadata = {
  title: "關於我們｜寶保清潔",
  description: "寶保清潔工程有限公司簡介與服務理念。",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold">關於我們</h1>
      <div className="mt-6 space-y-4 text-gray-700">
        <p>
          寶保清潔工程有限公司（BAOBAO CLEANING ENGINEERING CO., LTD）為客戶提供專業的清潔及消毒服務，
          服務範圍涵蓋辦公室、家居、中西醫診所、商鋪及學校。
        </p>
        <p>
          我們採用優質清潔劑與專業器材，配合經驗豐富的清潔團隊，確保每個角落都符合衛生標準，
          並可按需要在非辦公時間提供服務，不影響客戶日常運作。
        </p>
      </div>
      <div className="mt-8 rounded-xl bg-gray-50 p-6 text-sm text-gray-600">
        <p className="font-semibold text-gray-800">公司資料</p>
        <p className="mt-2">地址：香港新界荃灣德士古道 62-70 號寶業大廈 A 座 11 樓 A6 室</p>
        <p>Email：popocec2024@gmail.com</p>
        <p>WhatsApp：6588 6370</p>
        <p>24 小時營業</p>
      </div>
    </div>
  );
}
