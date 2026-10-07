import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { handler, ok, requireUser } from "@/lib/api";
import { serialize } from "@/lib/utils";

export const GET = handler(async () => {
  const user = await requireUser();
  await connectDB();
  const orders = await Order.find({ user: user.id }).sort({ createdAt: -1 }).limit(100).lean();
  return ok({ orders: serialize(orders) });
});
