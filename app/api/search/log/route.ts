import { z } from "zod";
import { connectDB } from "@/lib/db";
import { SearchQuery } from "@/models/SearchQuery";
import { handler, ok, parseBody } from "@/lib/api";
import { norm } from "@/lib/search";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/** Records a submitted search (used for Trending and zero-result insights). No personal data stored. */
export const POST = handler(async (req: Request) => {
  if (!(await rateLimit(`searchlog:${clientIp(req)}`, 30, 60_000)).ok) return ok({ ok: true });
  const { q, results } = await parseBody(req, z.object({ q: z.string().min(2).max(60), results: z.number().int().min(0).max(1000) }));
  const term = norm(q);
  if (term.length < 3) return ok({ ok: true });
  await connectDB();
  await SearchQuery.updateOne({ term }, { $inc: { count: 1, zero: results === 0 ? 1 : 0 }, $set: { lastAt: new Date() } }, { upsert: true });
  return ok({ ok: true });
});
