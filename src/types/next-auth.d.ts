import type { DefaultSession } from "next-auth";
import type { Role } from "@prisma/client";

/**
 * Auth.js v5 型別擴充：把自訂欄位（role / username / id）加到 session 與 JWT，
 * 讓 tRPC context 與前端 useSession() 都能取得型別安全的欄位。
 */

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      username: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
    username: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    username: string;
  }
}
