"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  loginSchema,
  type LoginInput,
} from "@/lib/validators/auth";

/**
 * 登入表單（client component）
 * - react-hook-form + zod 驗證
 * - 呼叫 Auth.js signIn("credentials")
 */
export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError("");
    const res = await signIn("credentials", {
      redirect: false,
      username: values.username,
      password: values.password,
    });

    if (res?.error) {
      setError("帳號或密碼錯誤");
      return;
    }

    router.push("/admin/applications");
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <Label htmlFor="username">帳號</Label>
        <Input id="username" className="mt-1" {...register("username")} />
        {errors.username && (
          <p className="mt-1 text-sm text-red-500">{errors.username.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="password">密碼</Label>
        <Input
          id="password"
          type="password"
          className="mt-1"
          {...register("password")}
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "登入中…" : "登入"}
      </Button>
    </form>
  );
}
