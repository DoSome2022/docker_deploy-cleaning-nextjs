import Link from "next/link";
import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SERVICE_PLANS } from "@/lib/service-data";

/**
 * 首頁（server component，可做 SEO）
 */
export const metadata: Metadata = {
  title: "寶保清潔工程有限公司｜專業清潔服務",
  description: "辦公室、家居、診所、商鋪及學校專業清潔與消毒服務，24 小時營業。",
};

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-emerald-600 py-20 text-center text-white">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="text-3xl font-bold md:text-5xl">
            專業清潔，讓環境煥然一新
          </h1>
          <p className="mt-4 text-lg text-emerald-50">
            辦公室、家居、診所、商鋪及學校的清潔與消毒專家，24 小時為你服務。
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link href="/apply">立即申請</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent text-white hover:bg-emerald-700 hover:text-white">
              <Link href="/service">查看服務</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 服務項目 */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="mb-8 text-center text-2xl font-bold">我們的服務</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICE_PLANS.map((plan) => (
            <Link key={plan.id} href={`/service/${plan.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle>{plan.title}</CardTitle>
                  <CardDescription>{plan.en}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{plan.desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-50 py-16 text-center">
        <h2 className="text-xl font-bold">需要清潔服務？</h2>
        <p className="mt-2 text-gray-600">填寫申請表，我們會盡快聯絡你。</p>
        <Button asChild size="lg" className="mt-6">
          <Link href="/apply">填寫申請表</Link>
        </Button>
      </section>
    </>
  );
}
