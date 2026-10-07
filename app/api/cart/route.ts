import { z } from "zod";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { Cart } from "@/models/Cart";
import { Product } from "@/models/Product";
import { handler, ok, parseBody, requireUser } from "@/lib/api";
import type { CartItem } from "@/types";

const schema = z.object({
  items: z
    .array(z.object({ productId: z.string().length(24), size: z.string().max(20), color: z.string().max(40), quantity: z.number().int().min(1).max(10) }))
    .max(40),
});

export const GET = handler(async () => {
  const user = await requireUser();
  await connectDB();
  const cart = await Cart.findOne({ user: user.id }).lean<any>();
  const ids = (cart?.items || []).map((i: any) => i.product);
  const products = await Product.find({ _id: { $in: ids }, published: true }).select("name slug price compareAtPrice images stock reserved").lean<any[]>();
  const byId = new Map(products.map((p) => [String(p._id), p]));
  const items: CartItem[] = [];
  for (const i of cart?.items || []) {
    const p = byId.get(String(i.product));
    if (!p) continue;
    const avail = Math.max(1, p.stock - p.reserved);
    items.push({
      key: `${p._id}|${i.size}|${i.color}`, productId: String(p._id), slug: p.slug, name: p.name, image: p.images?.[0] || "",
      price: p.price, compareAtPrice: p.compareAtPrice, size: i.size, color: i.color,
      quantity: Math.min(i.quantity, avail), maxQty: Math.min(10, avail),
    });
  }
  return ok({ items });
});

export const PUT = handler(async (req: Request) => {
  const user = await requireUser();
  const { items } = await parseBody(req, schema);
  await connectDB();
  await Cart.findOneAndUpdate(
    { user: user.id },
    { items: items.map((i) => ({ product: new Types.ObjectId(i.productId), size: i.size, color: i.color, quantity: i.quantity })) },
    { upsert: true }
  );
  return ok({ ok: true });
});
