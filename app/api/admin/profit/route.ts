import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { handler, ok, requireAccess } from "@/lib/api";
import { getSettings } from "@/lib/data";

const RANGES: Record<string, number> = { today: 1, "7d": 7, "30d": 30, "3m": 90, "1y": 365 };

/**
 * Profit report from stored order snapshots. Definitions:
 *   Net sales      = items value − all discounts (offer, coupon, points, gift card), GST-inclusive
 *   Revenue ex-GST = net sales − GST
 *   COGS           = Σ item cost × qty (cost snapshotted at checkout; older orders use the product's current cost)
 *   Gross profit   = revenue ex-GST − COGS
 *   Net profit     = gross profit − estimated payment gateway fees (Razorpay orders × fee %)
 * Shipping collected is shown separately; courier cost isn't tracked, so it is not deducted.
 */
export const GET = handler(async (req: Request) => {
  await requireAccess("profit");
  const range = new URL(req.url).searchParams.get("range") || "30d";
  const days = RANGES[range] || 30;
  const now = new Date();
  const since = new Date(new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() - (days - 1) * 86400000);
  await connectDB();
  const [settings, orders] = await Promise.all([
    getSettings(),
    Order.find({ createdAt: { $gte: since }, status: { $nin: ["Cancelled", "Returned"] } }).limit(5000).select("items subtotal discount offerDiscount loyaltyDiscount giftCardAmount shipping tax total paymentMethod createdAt").lean<any[]>(),
  ]);
  const productIds = [...new Set(orders.flatMap((o) => o.items.map((i: any) => String(i.product))))];
  const products = await Product.find({ _id: { $in: productIds } }).select("costPrice category name").populate("category", "name").lean<any[]>();
  const pById = new Map(products.map((p) => [String(p._id), p]));
  const feePct = settings.gatewayFeePct ?? 2;

  const totals = { orders: 0, units: 0, grossSales: 0, discounts: 0, netSales: 0, gst: 0, revenueExGst: 0, cogs: 0, grossProfit: 0, gatewayFees: 0, netProfit: 0, shipping: 0, missingCost: 0 };
  const byDay = new Map<string, { date: string; revenue: number; profit: number }>();
  const byProduct = new Map<string, { name: string; units: number; revenue: number; cogs: number }>();
  const byCategory = new Map<string, { name: string; revenue: number; cogs: number }>();
  const fmt = days > 120 ? (d: Date) => d.toISOString().slice(0, 7) : (d: Date) => d.toISOString().slice(0, 10);

  for (const o of orders) {
    const discounts = (o.discount || 0) + (o.offerDiscount || 0) + (o.loyaltyDiscount || 0) + (o.giftCardAmount || 0);
    const net = Math.max(0, o.subtotal - discounts);
    const gst = Math.min(o.tax || 0, net);
    const exGst = net - gst;
    let cogs = 0;
    for (const i of o.items) {
      const p = pById.get(String(i.product));
      const unitCost = i.cost > 0 ? i.cost : p?.costPrice || 0;
      if (!unitCost) totals.missingCost += i.quantity;
      cogs += unitCost * i.quantity;
      totals.units += i.quantity;
      // spread order-level discounts proportionally across lines for per-product / per-category figures
      const share = o.subtotal > 0 ? (i.price * i.quantity) / o.subtotal : 0;
      const lineRev = (exGst) * share;
      const prod = byProduct.get(String(i.product)) || { name: i.name, units: 0, revenue: 0, cogs: 0 };
      prod.units += i.quantity; prod.revenue += lineRev; prod.cogs += unitCost * i.quantity;
      byProduct.set(String(i.product), prod);
      const cn = p?.category?.name || "Uncategorised";
      const cat = byCategory.get(cn) || { name: cn, revenue: 0, cogs: 0 };
      cat.revenue += lineRev; cat.cogs += unitCost * i.quantity;
      byCategory.set(cn, cat);
    }
    const fee = o.paymentMethod === "RAZORPAY" ? (o.total * feePct) / 100 : 0;
    const gross = exGst - cogs;
    totals.orders += 1; totals.grossSales += o.subtotal; totals.discounts += discounts; totals.netSales += net; totals.gst += gst;
    totals.revenueExGst += exGst; totals.cogs += cogs; totals.grossProfit += gross; totals.gatewayFees += fee; totals.netProfit += gross - fee; totals.shipping += o.shipping || 0;
    const key = fmt(new Date(o.createdAt));
    const d = byDay.get(key) || { date: key, revenue: 0, profit: 0 };
    d.revenue += exGst; d.profit += gross - fee;
    byDay.set(key, d);
  }
  const r = (n: number) => Math.round(n);
  const rows = (m: Map<string, any>) => [...m.values()].map((x) => ({ ...x, revenue: r(x.revenue), cogs: r(x.cogs), profit: r(x.revenue - x.cogs), margin: x.revenue > 0 ? Math.round(((x.revenue - x.cogs) / x.revenue) * 1000) / 10 : 0 })).sort((a, b) => b.profit - a.profit);
  return ok({
    range,
    feePct,
    totals: Object.fromEntries(Object.entries(totals).map(([k, v]) => [k, r(v as number)])),
    marginPct: totals.revenueExGst > 0 ? Math.round((totals.netProfit / totals.revenueExGst) * 1000) / 10 : 0,
    series: [...byDay.values()].sort((a, b) => a.date.localeCompare(b.date)).map((d) => ({ date: d.date, revenue: r(d.revenue), profit: r(d.profit) })),
    products: rows(byProduct).slice(0, 15),
    categories: rows(byCategory),
  });
});
