import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { handler, ok } from "@/lib/api";
import { serialize } from "@/lib/utils";
import { searchProducts } from "@/lib/search";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const GET = handler(async (req: Request) => {
  if (!(await rateLimit(`search:${clientIp(req)}`, 90, 60_000)).ok) return ok({ products: [], categories: [], suggestions: [], didYouMean: null }, 429);
  const q = (new URL(req.url).searchParams.get("q") || "").trim().slice(0, 60);
  const r = await searchProducts(q, 6);
  if (!r.ids.length) return ok({ products: [], categories: r.categories, suggestions: r.suggestions, didYouMean: r.didYouMean });
  await connectDB();
  const docs = await Product.find({ _id: { $in: r.ids }, published: true }).select("name slug price compareAtPrice images").lean<any[]>();
  const order = new Map(r.ids.map((id, i) => [id, i]));
  docs.sort((a, b) => (order.get(String(a._id)) ?? 0) - (order.get(String(b._id)) ?? 0));
  return ok(serialize({ products: docs, categories: r.categories.map((c) => ({ _id: c.slug, ...c })), suggestions: r.suggestions, didYouMean: r.didYouMean }));
});
