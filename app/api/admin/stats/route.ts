import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { User } from "@/models/User";
import { Product } from "@/models/Product";
import { handler, ok, requireAdmin } from "@/lib/api";
import { serialize } from "@/lib/utils";

const RANGES: Record<string, number> = { today: 1, "7d": 7, "30d": 30, "3m": 90, "1y": 365 };
const VALID = { status: { $nin: ["Cancelled", "Returned"] } };

export const GET = handler(async (req: Request) => {
  await requireAdmin();
  const range = new URL(req.url).searchParams.get("range") || "30d";
  const days = RANGES[range] || 30;
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const since = new Date(startOfToday.getTime() - (days - 1) * 86400000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const fmt = days > 120 ? "%Y-%m" : "%Y-%m-%d";
  await connectDB();

  const inRange = { ...VALID, createdAt: { $gte: since } };
  const [
    totals, today, month, pending, customers, products, lowStock, series, custSeries, topProducts, topCategories, recent, rangeAgg, paymentSplit,
  ] = await Promise.all([
    Order.aggregate([{ $match: VALID }, { $group: { _id: null, revenue: { $sum: "$total" }, orders: { $sum: 1 } } }]),
    Order.aggregate([{ $match: { ...VALID, createdAt: { $gte: startOfToday } } }, { $group: { _id: null, sales: { $sum: "$total" }, orders: { $sum: 1 } } }]),
    Order.aggregate([{ $match: { ...VALID, createdAt: { $gte: monthStart } } }, { $group: { _id: null, revenue: { $sum: "$total" } } }]),
    Order.countDocuments({ status: "Pending" }),
    User.countDocuments({ role: "USER" }),
    Product.countDocuments({}),
    Product.find({ $expr: { $lte: [{ $subtract: ["$stock", "$reserved"] }, "$lowStockThreshold"] } })
      .sort({ stock: 1 }).limit(8).select("name sku stock reserved lowStockThreshold images").lean(),
    Order.aggregate([
      { $match: inRange },
      { $group: { _id: { $dateToString: { format: fmt, date: "$createdAt" } }, revenue: { $sum: "$total" }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    User.aggregate([
      { $match: { role: "USER", createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: fmt, date: "$createdAt" } }, customers: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate([
      { $match: inRange }, { $unwind: "$items" },
      { $group: { _id: "$items.product", name: { $first: "$items.name" }, image: { $first: "$items.image" }, units: { $sum: "$items.quantity" }, revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } } },
      { $sort: { units: -1 } }, { $limit: 6 },
    ]),
    Order.aggregate([
      { $match: inRange }, { $unwind: "$items" },
      { $lookup: { from: "products", localField: "items.product", foreignField: "_id", as: "p" } }, { $unwind: "$p" },
      { $lookup: { from: "categories", localField: "p.category", foreignField: "_id", as: "c" } }, { $unwind: "$c" },
      { $group: { _id: "$c.name", units: { $sum: "$items.quantity" }, revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } } },
      { $sort: { revenue: -1 } }, { $limit: 8 },
    ]),
    Order.find().sort({ createdAt: -1 }).limit(8).select("orderNumber total status createdAt shippingAddress.fullName paymentMethod").lean(),
    Order.aggregate([
      { $match: inRange },
      { $group: { _id: null, revenue: { $sum: "$total" }, orders: { $sum: 1 }, units: { $sum: { $sum: "$items.quantity" } } } },
    ]),
    Order.aggregate([{ $match: inRange }, { $group: { _id: "$paymentMethod", n: { $sum: 1 } } }]),
  ]);

  const r = rangeAgg[0] || { revenue: 0, orders: 0, units: 0 };
  return ok(
    serialize({
      range,
      totalRevenue: totals[0]?.revenue || 0,
      totalOrders: totals[0]?.orders || 0,
      totalCustomers: customers,
      totalProducts: products,
      todaySales: today[0]?.sales || 0,
      todayOrders: today[0]?.orders || 0,
      monthlyRevenue: month[0]?.revenue || 0,
      pendingOrders: pending,
      lowStock,
      revenueSeries: series.map((s: any) => ({ date: s._id, revenue: s.revenue, orders: s.orders })),
      customerSeries: custSeries.map((s: any) => ({ date: s._id, customers: s.customers })),
      topProducts,
      topCategories: topCategories.map((c: any) => ({ name: c._id, units: c.units, revenue: c.revenue })),
      recentOrders: recent,
      periodRevenue: r.revenue,
      periodOrders: r.orders,
      periodUnits: r.units,
      averageOrderValue: r.orders ? Math.round(r.revenue / r.orders) : 0,
      paymentSplit: paymentSplit.map((p: any) => ({ name: p._id, value: p.n })),
      // Storefront traffic is not tracked in-app. Wire GA4/Plausible here for a real conversion rate.
      conversion: { tracked: false, sessions: null, orders: r.orders },
    })
  );
});
