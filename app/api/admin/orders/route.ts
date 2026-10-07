import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { handler, ok, requireAdmin } from "@/lib/api";
import { escapeRegex, serialize } from "@/lib/utils";

export const GET = handler(async (req: Request) => {
  await requireAdmin();
  const sp = new URL(req.url).searchParams;
  const page = Math.max(1, parseInt(sp.get("page") || "1", 10) || 1);
  const limit = 20;
  const filter: any = {};
  const status = sp.get("status");
  const payment = sp.get("payment");
  const q = (sp.get("q") || "").trim().slice(0, 60);
  if (status) filter.status = status;
  if (payment) filter.paymentMethod = payment;
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    filter.$or = [{ orderNumber: rx }, { "shippingAddress.fullName": rx }, { "shippingAddress.email": rx }, { "shippingAddress.phone": rx }];
  }
  await connectDB();
  const [items, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate("user", "name email phone").lean(),
    Order.countDocuments(filter),
  ]);
  return ok({ items: serialize(items), total, page, pages: Math.max(1, Math.ceil(total / limit)) });
});
