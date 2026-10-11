import { handler, ok } from "@/lib/api";
import { getUpsell } from "@/lib/data";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const GET = handler(async (req: Request) => {
  if (!(await rateLimit(`upsell:${clientIp(req)}`, 60, 60_000)).ok) return ok({ products: [] }, 429);
  const sp = new URL(req.url).searchParams;
  const ids = (sp.get("ids") || "").split(",").slice(0, 20);
  const gap = Math.max(0, Math.min(10000, Number(sp.get("gap")) || 0));
  return ok({ products: await getUpsell(ids, gap) });
});
