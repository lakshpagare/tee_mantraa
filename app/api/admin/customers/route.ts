import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Order } from "@/models/Order";
import { handler, ok, requireAdmin } from "@/lib/api";
import { escapeRegex, serialize } from "@/lib/utils";

export const GET = handler(async (req: Request) => {
  await requireAdmin();
  const sp = new URL(req.url).searchParams;
  const page = Math.max(1, parseInt(sp.get("page") || "1", 10) || 1);
  const limit = 20;
  const q = (sp.get("q") || "").trim().slice(0, 60);
  const filter: any = { role: "USER" };
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    filter.$or = [{ name: rx }, { email: rx }, { phone: rx }];
  }
  await connectDB();
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean<any[]>(),
    User.countDocuments(filter),
  ]);
  const stats = await Order.aggregate([
    { $match: { user: { $in: users.map((u) => u._id) }, status: { $nin: ["Cancelled", "Returned"] } } },
    { $group: { _id: "$user", orders: { $sum: 1 }, spent: { $sum: "$total" }, last: { $max: "$createdAt" } } },
  ]);
  const map = new Map(stats.map((s: any) => [String(s._id), s]));
  const items = users.map((u) => {
    const s: any = map.get(String(u._id));
    return { ...u, orders: s?.orders || 0, totalSpent: s?.spent || 0, lastOrder: s?.last || null };
  });
  return ok({ items: serialize(items), total, page, pages: Math.max(1, Math.ceil(total / limit)) });
});
