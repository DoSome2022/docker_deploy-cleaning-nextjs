"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/trpc/react";
import {
  applicationCreateSchema,
  type ApplicationCreateInput,
} from "@/lib/validators/application";
import { DISTRICTS } from "@/lib/constants";

/**
 * 公開申請表（client component）
 * - react-hook-form + zod 驗證
 * - 提交後呼叫 tRPC application.create
 */
export function ApplyForm() {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationCreateInput>({
    resolver: zodResolver(applicationCreateSchema),
    defaultValues: {
      salutation: "",
      phone: "",
      whatsapp: "",
      email: "",
      company: "",
      district: "",
      squareFeet: "",
      remark: "",
    },
  });

  const createMutation = trpc.application.create.useMutation({
    onSuccess: () => {
      toast.success("申請已送出！我們會盡快聯絡你。");
      reset();
    },
    onError: (err) => {
      toast.error(err.message || "提交失敗，請檢查資料");
    },
  });

  const onSubmit = handleSubmit((values) => {
    createMutation.mutate(values);
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <Label htmlFor="company">公司 / 機構名稱</Label>
        <Input id="company" className="mt-1" {...register("company")} />
      </div>

      <div>
        <Label htmlFor="email">電郵</Label>
        <Input id="email" type="email" className="mt-1" {...register("email")} />
        {errors.email && (
          <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="salutation">稱呼 *</Label>
        <Input id="salutation" className="mt-1" {...register("salutation")} />
        {errors.salutation && (
          <p className="mt-1 text-sm text-red-500">{errors.salutation.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="phone">聯絡電話 *</Label>
        <Input id="phone" className="mt-1" {...register("phone")} />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="whatsapp">WhatsApp</Label>
        <Input id="whatsapp" className="mt-1" {...register("whatsapp")} />
      </div>

      <div>
        <Label>地區 *</Label>
        <Select onValueChange={(v) => setValue("district", v)}>
          <SelectTrigger className="mt-1 w-full">
            <SelectValue placeholder="請選擇地區" />
          </SelectTrigger>
          <SelectContent>
            {DISTRICTS.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.district && (
          <p className="mt-1 text-sm text-red-500">{errors.district.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="squareFeet">尺數</Label>
        <Input id="squareFeet" className="mt-1" {...register("squareFeet")} />
      </div>

      <div>
        <Label htmlFor="remark">備註</Label>
        <Textarea id="remark" rows={5} className="mt-1" {...register("remark")} />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "送出中…" : "發送申請"}
      </Button>
    </form>
  );
}
