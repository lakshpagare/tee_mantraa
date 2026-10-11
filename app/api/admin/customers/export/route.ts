import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Order } from "@/models/Order";
import { handler, requireAccess } from "@/lib/api";

const csv = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

export const GET = handler(async () => {
  await requireAccess("customers");
  await connectDB();
  const users: any[] = await User.find({ role: "USER" }).sort({ createdAt: -1 }).limit(5000).lean();
  const stats = await Order.aggregate([{ $match: { status: { $nin: ["Cancelled", "Returned"] } } }, { $group: { _id: "$user", orders: { $sum: 1 }, spent: { $sum: "$total" }, last: { $max: "$createdAt" } } }]);
  const map = new Map(stats.map((s: any) => [String(s._id), s]));
  const rows: unknown[][] = [["Name", "Email", "Phone", "Status", "Points", "Joined", "Orders", "Total spent", "Last order"]];
  for (const u of users) {
    const s: any = map.get(String(u._id));
    rows.push([u.name, u.email, u.phone || "", u.status, u.points || 0, new Date(u.createdAt).toISOString(), s?.orders || 0, s?.spent || 0, s?.last ? new Date(s.last).toISOString() : ""]);
  }
  return new Response(rows.map((r) => r.map(csv).join(",")).join("\n"), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="customers.csv"' } });
});
