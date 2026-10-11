import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { handler, requireAccess } from "@/lib/api";

const csv = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

export const GET = handler(async (req: Request) => {
  await requireAccess("orders");
  const status = new URL(req.url).searchParams.get("status");
  await connectDB();
  const orders: any[] = await Order.find(status ? { status } : {}).sort({ createdAt: -1 }).limit(5000).lean();
  const rows = [["Order", "Date", "Customer", "Email", "Phone", "City", "State", "PIN", "Items", "Subtotal", "Discount", "Points", "Gift card", "Shipping", "Tax", "Total", "Payment", "Payment status", "Status", "Carrier", "Tracking"]];
  for (const o of orders) {
    rows.push([o.orderNumber, new Date(o.createdAt).toISOString(), o.shippingAddress?.fullName, o.shippingAddress?.email, o.shippingAddress?.phone, o.shippingAddress?.city, o.shippingAddress?.state, o.shippingAddress?.pincode,
      o.items.map((i: any) => `${i.name} (${i.size}/${i.color}) x${i.quantity}`).join("; "), o.subtotal, o.discount, o.loyaltyDiscount || 0, o.giftCardAmount || 0, o.shipping, o.tax, o.total, o.paymentMethod, o.paymentStatus, o.status, o.carrier || "", o.trackingNumber || ""]);
  }
  return new Response(rows.map((r) => r.map(csv).join(",")).join("\n"), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="orders.csv"' } });
});
