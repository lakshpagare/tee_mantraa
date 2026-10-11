import { connectDB } from "@/lib/db";
import { Cart } from "@/models/Cart";
import { Product } from "@/models/Product";
import { sendAbandonedCart } from "@/lib/emails";

/**
 * Daily cron (see vercel.json). Vercel sends `Authorization: Bearer $CRON_SECRET` when CRON_SECRET is set.
 * Emails customers whose saved cart has been idle for 1–7 days, once per cart.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return new Response("Unauthorized", { status: 401 });
  await connectDB();
  const now = Date.now();
  const carts: any[] = await Cart.find({
    "items.0": { $exists: true },
    reminderSentAt: { $exists: false },
    updatedAt: { $lt: new Date(now - 3600_000), $gt: new Date(now - 7 * 86400_000) },
  }).populate("user", "name email").limit(100);

  let sent = 0;
  for (const c of carts) {
    if (!c.user?.email) continue;
    const products: any[] = await Product.find({ _id: { $in: c.items.map((i: any) => i.product) }, published: true }).select("name price").lean();
    const byId = new Map(products.map((p) => [String(p._id), p]));
    const items = c.items.filter((i: any) => byId.has(String(i.product))).map((i: any) => ({ name: byId.get(String(i.product)).name, price: byId.get(String(i.product)).price, quantity: i.quantity, color: i.color, size: i.size }));
    if (!items.length) continue;
    try { await sendAbandonedCart(c.user.email, c.user.name, items); c.reminderSentAt = new Date(); await c.save(); sent++; } catch (e) { console.error("[cron]", e); }
  }
  return Response.json({ checked: carts.length, sent });
}
