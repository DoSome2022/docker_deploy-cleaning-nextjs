import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { db } from "@/server/db";
import { loginSchema } from "@/lib/validators/auth";

/**
 * Auth.js v5（NextAuth v5）登入系統設定
 *
 * - Credentials provider：以帳號（username）+ 密碼登入，比對 Prisma User
 * - session 策略：JWT（session 存於 httpOnly cookie）
 * - callbacks：把 role / username / id 帶進 session，供 tRPC 做權限判斷
 *
 * 匯出的 auth / handlers / signIn / signOut 供：
 *   - app/api/auth/[...nextauth]/route.ts（handlers）
 *   - tRPC context（auth() 讀取 session）
 *   - 前端登入表單（signIn）
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "帳號", type: "text" },
        password: { label: "密碼", type: "password" },
      },
      // 驗證帳號密碼；回傳 null 代表登入失敗
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await db.user.findUnique({
          where: { username: parsed.data.username },
        });
        if (!user) return null;

        const valid = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash
        );
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name ?? user.username,
          role: user.role,
          username: user.username,
        };
      },
    }),
  ],
  callbacks: {
    // 登入時把自訂欄位寫進 JWT
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
        token.username = (user as { username?: string }).username;
      }
      return token;
    },
    // 每次讀 session 時，把 JWT 欄位同步到 session.user
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as never;
        session.user.username = token.username as string;
      }
      return session;
    },
  },
});
