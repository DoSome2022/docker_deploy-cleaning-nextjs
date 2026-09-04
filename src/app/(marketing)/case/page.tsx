import type { Metadata } from "next";

/**
 * 工程案例頁（server component）
 * 原專案此頁被註解，這裡先給基本結構，圖片/影片之後補上。
 */
export const metadata: Metadata = {
  title: "工程案例｜寶保清潔",
  description: "辦公室、診所及家居清潔工程案例。",
};

const CASES = [
  { title: "辦公室清潔工程", desc: "寫字樓日常及深層清潔" },
  { title: "中醫診所清潔消毒", desc: "診症室及治療區消毒" },
  { title: "家居裝修後清潔", desc: "入伙前全屋大掃除" },
  { title: "商鋪開舖前清潔", desc: "店面及櫥窗清潔" },
];

export default function CasePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-bold">工程案例</h1>
      <p className="mt-2 text-gray-600">以下是我們曾完成的清潔工程案例。</p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {CASES.map((c) => (
          <div key={c.title} className="rounded-xl border p-5">
            <div className="mb-4 flex h-32 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
              圖片
            </div>
            <h2 className="font-semibold">{c.title}</h2>
            <p className="mt-1 text-sm text-gray-600">{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
