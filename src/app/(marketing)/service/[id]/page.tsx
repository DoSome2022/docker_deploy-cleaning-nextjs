import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getPlanById, SERVICE_PLANS } from "@/lib/service-data";

/**
 * 服務方案詳細頁（server component + generateMetadata 做 SEO）
 * 透過 generateStaticParams 產生靜態路由，並針對每個方案產生專屬 title/description。
 */
export async function generateStaticParams() {
  return SERVICE_PLANS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const plan = getPlanById(id);
  if (!plan) return { title: "找不到方案" };
  return {
    title: `${plan.title}｜寶保清潔`,
    description: plan.desc,
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const plan = getPlanById(id);
  if (!plan) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl font-bold">{plan.title}</h1>
      <p className="mt-1 text-gray-500">{plan.en}</p>

      <p className="mt-6 text-gray-700">{plan.intro}</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>服務特色</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-inside list-disc space-y-2 text-sm text-gray-700">
              {plan.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>服務內容</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-inside list-disc space-y-2 text-sm text-gray-700">
              {plan.items.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10">
        <Button asChild size="lg">
          <Link href="/apply">申請此服務</Link>
        </Button>
      </div>
    </div>
  );
}
