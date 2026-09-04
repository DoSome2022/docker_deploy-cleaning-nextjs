import Link from "next/link";
import type { Metadata } from "next";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SERVICE_PLANS } from "@/lib/service-data";

/**
 * 服務項目列表頁（server component）
 */
export const metadata: Metadata = {
  title: "服務項目｜寶保清潔",
  description: "辦公室、家居、診所、商鋪及學校清潔消毒服務一覽。",
};

export default function ServicePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <h1 className="mb-2 text-3xl font-bold">服務項目</h1>
      <p className="mb-8 text-gray-600">
        六大專業清潔方案，滿足不同場所的衛生需求。
      </p>
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
                <ul className="mt-4 flex flex-wrap gap-2">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700"
                    >
                      {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
