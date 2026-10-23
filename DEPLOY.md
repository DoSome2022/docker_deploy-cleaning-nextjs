# 部署指南（騰訊雲輕量伺服器・香港・NPM 已裝）

架構：`NPM (80/443) → npm-net → cleaning-nextjs-app (Next standalone :3000) → internal → db (PostgreSQL)`

```
公網 ──► NPM ──► app（Next.js 自己 serve 前後端 + /api/trpc + /api/auth）
                      │
                      └──► db（內網，公網掂唔到）

（migrate 係一次性服務：每次 compose up 先跑 db push + seed，成功後 app 先起）
```

## 部署前檢查

- [ ] 域名 DNS A record 已指向伺服器 IP
- [ ] 已複製 `.env.example` → `.env` 並填真實值（AUTH_SECRET 必改、POSTGRES_PASSWORD 必改）
- [ ] 伺服器已裝 Docker + docker compose plugin，專案已 `git clone`（或用 SFTP 上傳）

## 一次性設定（每部伺服器做一次）

```bash
docker network create npm-net
docker network connect npm-net <你個NPM容器名>
```

> 輕量機得 2GB RAM 嘅話，跑 PG + Next 前建議加 swap：
> ```bash
> sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile \
>   && sudo mkswap /swapfile && sudo swapon /swapfile \
>   && echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
> ```

## 首次部署

```bash
cd cleaning-nextjs
cp .env.example .env      # 改好 AUTH_SECRET / POSTGRES_PASSWORD
docker compose up -d --build
docker ps                 # 兩個容器都 running 即成功
```

部署時 `migrate` 服務會自動（每次 `docker compose up` 都跑一次）：
1. `prisma db push` —— 同步資料表（呢個項目冇 migrations，用 db push）
2. 執行 seed —— 建立初始帳號（**upsert，重複啟動安全**）

之後 `app` 服務先會啟動。

**初始帳號（上線後記得改密碼！）：**
- 管理員：`admin` / `admin123`
- 員工：`staff` / `staff123`

## NPM 面板設定（只做一次）

1. 開 `http://伺服器IP:81` 登入 NPM
2. **Proxy Hosts → Add Proxy Host**：
   - Domain：`yourdomain.com`
   - Forward Hostname/IP：`cleaning-nextjs-app`　Port：`3000`
   - 開 **Block Common Exploits** 同 **Websockets Support**（Next dev/HMR 唔使，但無害）
3. **SSL 分頁**：Request a New Certificate → 簽好後開 **Force SSL**
4. 完成後 `https://yourdomain.com` 出網站、`/login` 入後台

## 之後每次更新網站

```bash
cd cleaning-nextjs
git pull
docker compose up -d --build
docker image prune -f
```

**注意：** 每次 `docker compose up -d` 都會重跑 `migrate`（db push + seed）——改咗 `schema.prisma` 後唔使自己手動同步。

## 資料備份

```bash
docker compose exec db pg_dump -U popo popo_db > backup_$(date +%F).sql
```

## 疑難排解

| 問題 | 處理 |
|---|---|
| app 起唔到（等 DB） | DB healthcheck 10 秒一次，等耐少少；`docker compose logs app` 睇進度 |
| 登入 redirect 無限 loop | `AUTH_TRUST_HOST` 有冇設定（compose 已設 "true"）；AUTH_SECRET 有冇填 |
| 改咗 schema 唔生效 | `docker compose restart app`（啟動時自動 db push） |
| NPM 出 502 | `docker ps` 睇 cleaning-nextjs-app 係咪 up 兼喺 `npm-net` 度；healthcheck 要轉 healthy |
| seed 唔想每次跑 | 喺 `docker-compose.yml` 刪 `migrate` 服務 command 入面嘅 `npx tsx prisma/seed.ts` |
