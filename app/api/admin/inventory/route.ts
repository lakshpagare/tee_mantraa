import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { handler, ok, requireAdmin } from "@/lib/api";
import { escapeRegex, serialize } from "@/lib/utils";

export const GET = handler(async (req: Request) => {
  await requireAdmin();
  const sp = new URL(req.url).searchParams;
  const q = (sp.get("q") || "").trim().slice(0, 60);
  const filter = sp.get("filter");
  const and: any[] = [];
  if (q) and.push({ $or: [{ name: new RegExp(escapeRegex(q), "i") }, { sku: new RegExp(escapeRegex(q), "i") }] });
  if (filter === "out") and.push({ $expr: { $lte: [{ $subtract: ["$stock", "$reserved"] }, 0] } });
  if (filter === "low")
    and.push({ $expr: { $and: [{ $gt: [{ $subtract: ["$stock", "$reserved"] }, 0] }, { $lte: [{ $subtract: ["$stock", "$reserved"] }, "$lowStockThreshold"] }] } });
  await connectDB();
  const items = await Product.find(and.length ? { $and: and } : {})
    .sort({ stock: 1 })
    .limit(200)
    .select("name sku images stock reserved lowStockThreshold published")
    .lean();
  return ok({ items: serialize(items) });
});
