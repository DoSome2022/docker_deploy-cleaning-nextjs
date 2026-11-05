/**
 * Redis 連接層（fail-open 斷路器）
 *
 * 唔靠 socket 事件判斷狀態（Docker Desktop 等環境下停 container 未必觸發
 * 斷線事件）；改用 PING 健康檢查（結果緩存 2 秒）+ 每條指令 1.5 秒超時，
 * 指令一失敗即刻標記 down，之後所有操作 fail-open，唔會拖慢或打冧網站。
 */
import { createClient } from "redis";

const REDIS_URL = process.env.REDIS_URL ?? "redis://127.0.0.1:6387";
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX ?? 120);
const RATE_LIMIT_WINDOW = Number(process.env.RATE_LIMIT_WINDOW_SECONDS ?? 60);

const CMD_TIMEOUT = 1500; // 單條指令最長等待（ms）
const HEALTH_TTL = 2000; // PING 結果緩存時間（ms）

const globalForRedis = globalThis as unknown as {
  redisClient?: ReturnType<typeof createClient>;
};

export const redis =
  globalForRedis.redisClient ??
  createClient({
    url: REDIS_URL,
    socket: {
      connectTimeout: 2000,
      reconnectStrategy: (retries) => Math.min(retries * 500, 5000),
    },
  });

if (!globalForRedis.redisClient) {
  globalForRedis.redisClient = redis;
  redis.on("error", () => {
    /* 連線錯誤唔向外拋 */
  });
  redis.connect().catch(() => {});
}

let redisOk = false;
let checkedAt = 0;

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
  Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("redis timeout")), ms).unref(),
    ),
  ]);

export async function redisHealthy(): Promise<boolean> {
  const now = Date.now();
  if (now - checkedAt < HEALTH_TTL) return redisOk;
  checkedAt = now; // 先標記，避免併發請求一齊 PING
  try {
    redisOk = (await withTimeout(redis.ping(), CMD_TIMEOUT)) === "PONG";
  } catch {
    redisOk = false;
  }
  return redisOk;
}

const markDown = () => {
  redisOk = false;
  checkedAt = 0;
};

async function redisIncr(key: string, ttl: number): Promise<number | null> {
  if (!(await redisHealthy())) return null;
  try {
    const count = await withTimeout(redis.incr(key), CMD_TIMEOUT);
    if (count === 1) await withTimeout(redis.expire(key, ttl), CMD_TIMEOUT);
    return count;
  } catch {
    markDown();
    return null;
  }
}

/**
 * 每 IP 固定窗口限流：回傳 allowed（false = 應回 429）同 retryAfter（秒）
 * Redis 唔通 / 任何異常 → allowed: true（fail-open）
 */
export async function checkRateLimit(
  ip: string,
): Promise<{ allowed: boolean; retryAfter: number }> {
  if (RATE_LIMIT_MAX <= 0) return { allowed: true, retryAfter: 0 };
  const windowKey = Math.floor(Date.now() / 1000 / RATE_LIMIT_WINDOW);
  const count = await redisIncr(`rl:${ip}:${windowKey}`, RATE_LIMIT_WINDOW + 1);
  if (count === null) return { allowed: true, retryAfter: 0 };
  return count > RATE_LIMIT_MAX
    ? { allowed: false, retryAfter: RATE_LIMIT_WINDOW }
    : { allowed: true, retryAfter: 0 };
}
