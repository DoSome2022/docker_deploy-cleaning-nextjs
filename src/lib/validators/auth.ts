import { z } from "zod";

/**
 * 認證相關 zod schema
 */

export const loginSchema = z.object({
  username: z.string().min(1, "請輸入帳號"),
  password: z.string().min(1, "請輸入密碼"),
});

export type LoginInput = z.infer<typeof loginSchema>;
