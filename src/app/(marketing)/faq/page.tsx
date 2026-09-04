import type { Metadata } from "next";

/**
 * 常見問題頁（server component）
 */
export const metadata: Metadata = {
  title: "常見問題｜寶保清潔",
  description: "清潔服務常見問題解答。",
};

const FAQS = [
  {
    q: "你們的服務時間是？",
    a: "我們提供 24 小時服務，並可按需要在非辦公時間進行清潔，不影響你的日常運作。",
  },
  {
    q: "如何預約清潔服務？",
    a: "可透過網站「申請服務」填寫申請表，我們會盡快聯絡你報價及安排時間。",
  },
  {
    q: "清潔服務是否包括清潔劑及器材？",
    a: "包括。我們會自備優質清潔劑及專業器材，無需客戶額外準備。",
  },
  {
    q: "家居清潔對寵物安全嗎？",
    a: "我們採用對家人及寵物安全的優質清潔劑，可安心使用。",
  },
  {
    q: "診所清潔是否符合感染控制要求？",
    a: "我們採用醫療級消毒劑，遵循感染控制指引，並妥善處理醫療廢物。",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold">常見問題</h1>
      <div className="mt-8 space-y-4">
        {FAQS.map((item) => (
          <div key={item.q} className="rounded-xl border p-5">
            <h2 className="font-semibold">{item.q}</h2>
            <p className="mt-2 text-sm text-gray-600">{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
