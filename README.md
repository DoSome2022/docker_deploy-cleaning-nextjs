# 寶保清潔 — Next.js 重構版



- **Next.js 16**（App Router，Server/Client 分離，方便 SEO）
- **Prisma 6**（PostgreSQL）
- **tRPC 11**（型別安全 API）
- **Auth.js v5（NextAuth v5）**（登入系統，Credentials + JWT session）
- **react-hook-form + zod**（表單）
- **shadcn/ui + Tailwind CSS 4**（UI）

## 目錄結構

```
src/
├── app/                # Next.js 路由（每頁一個資料夾，SEO 分離）
│   ├── (marketing)/    # 公開行銷頁（服務、案例、關於、FAQ、申請）
│   ├── (admin)/        # 後台管理（需登入）
│   └── api/trpc/       # tRPC HTTP handler
├── server/             # 伺服器端程式（Prisma、認證、tRPC router）
├── trpc/               # tRPC client / server helper
├── lib/                # 常數、工具、zod schema
└── components/         # shadcn/ui + 業務元件
prisma/
├── schema.prisma       # 資料模型
└── seed.ts             # 初始資料（admin/staff 帳號）
```

## 快速開始

```bash
npm install
# 設定 .env（參考 .env.example）
npx prisma migrate dev   # 建立資料表
npm run db:seed          # 建立初始帳號
npm run dev              # http://localhost:3000
```
�理員：`admin` / `admin123`
- 員工：`staff` / `staff123`
