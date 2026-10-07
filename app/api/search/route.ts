import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";
import { handler, ok } from "@/lib/api";
import { escapeRegex, serialize } from "@/lib/utils";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const GET = handler(async (req: Request) => {
  if (!rateLimit(`search:${clientIp(req)}`, 60, 60_000).ok) return ok({ products: [], categories: [] }, 429);
  const q = (new URL(req.url).searchParams.get("q") || "").trim().slice(0, 60);
  if (q.length < 2) return ok({ products: [], categories: [] });
  await connectDB();
  const rx = new RegExp(escapeRegex(q), "i");
  const [products, categories] = await Promise.all([
    Product.find({ published: true, $or: [{ name: rx }, { tags: rx }, { subcategory: rx }] })
      .sort({ bestSeller: -1, sold: -1 })
      .limit(6)
      .select("name slug price compareAtPrice images")
      .lean(),
    Category.find({ active: true, name: rx }).limit(4).select("name slug image").lean(),
  ]);
  return ok(serialize({ products, categories }));
});
