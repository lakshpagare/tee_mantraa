import { unstable_cache } from "next/cache";
import { connectDB } from "@/lib/db";
import { SearchQuery } from "@/models/SearchQuery";
import { handler, ok } from "@/lib/api";

const load = unstable_cache(
  async () => {
    await connectDB();
    const since = new Date(Date.now() - 14 * 86400000);
    const rows: any[] = await SearchQuery.find({ lastAt: { $gte: since }, count: { $gte: 2 }, $expr: { $lt: ["$zero", { $multiply: ["$count", 0.5] }] } }).sort({ count: -1 }).limit(6).select("term").lean();
    return rows.map((r) => r.term as string);
  },
  ["trending-searches"],
  { revalidate: 600 }
);

export const GET = handler(async () => {
  try { return ok({ terms: await load() }); } catch { return ok({ terms: [] }); }
});
