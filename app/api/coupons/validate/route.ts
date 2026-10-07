import { z } from "zod";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { handler, ok, parseBody } from "@/lib/api";
import { validateCoupon } from "@/lib/coupons";
import { Product } from "@/models/Product";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  code: z.string().min(1).max(30),
  items: z.array(z.object({ productId: z.string().length(24), quantity: z.number().int().min(1).max(10) })).min(1).max(40),
});

export const POST = handler(async (req: Request) => {
  if (!rateLimit(`coupon:${clientIp(req)}`, 30, 60_000).ok) return ok({ ok: false, error: "Too many attempts. Please wait a moment." }, 429);
  const { code, items } = await parseBody(req, schema);
  await connectDB();
  const session = await auth();
  const products = await Product.find({ _id: { $in: items.map((i) => i.productId) } }).select("price").lean<any[]>();
  const price = new Map(products.map((p) => [String(p._id), p.price as number]));
  const subtotal = items.reduce((s, i) => s + (price.get(i.productId) || 0) * i.quantity, 0);
  return ok(await validateCoupon(code, subtotal, session?.user?.id));
});
