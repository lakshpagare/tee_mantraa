/**
 * Rate limiter. Uses Upstash Redis (REST) when UPSTASH_REDIS_REST_URL/TOKEN are set — correct across many
 * serverless instances. Falls back to per-instance memory otherwise.
 */
const hits = new Map<string, { count: number; reset: number }>();

export async function rateLimit(key: string, limit = 10, windowMs = 60_000): Promise<{ ok: boolean; remaining: number }> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    try {
      const k = `rl:${key}`;
      const res = await fetch(`${url}/pipeline`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify([["INCR", k], ["PEXPIRE", k, String(windowMs), "NX"]]),
        cache: "no-store",
      });
      const data = await res.json();
      const count = Number(data?.[0]?.result);
      if (Number.isFinite(count)) return { ok: count <= limit, remaining: Math.max(0, limit - count) };
    } catch {
      /* fall through to memory limiter */
    }
  }
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.reset < now) {
    hits.set(key, { count: 1, reset: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }
  entry.count += 1;
  if (hits.size > 5000) for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
  return { ok: entry.count <= limit, remaining: Math.max(0, limit - entry.count) };
}

export function clientIp(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}
