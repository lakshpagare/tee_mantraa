import { z } from "zod";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { ApiError, handler, ok, parseBody, requireUser } from "@/lib/api";
import { cancelOrder } from "@/lib/orders";
import { notifyOrder } from "@/lib/notify";
import { rateLimit } from "@/lib/rate-limit";

/** Customers can cancel until the order ships. Online payments are refunded automatically when possible. */
const CANCELLABLE = ["Pending", "Confirmed", "Processing"];

export const POST = handler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const user = await requireUser();
  if (!(await rateLimit(`cancel:${user.id}`, 10, 60 * 60_000)).ok) throw new ApiError(429, "Too many attempts. Try again later.");
  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) throw new ApiError(404, "Order not found");
  const { reason } = await parseBody(req, z.object({ reason: z.string().trim().max(200).optional() }));
  await connectDB();
  const order: any = await Order.findOne({ _id: id, user: user.id });
  if (!order) throw new ApiError(404, "Order not found");
  if (!CANCELLABLE.includes(order.status)) throw new ApiError(409, order.status === "Cancelled" ? "This order is already cancelled" : "This order has already shipped and can't be cancelled. You can request a return after delivery.");
  await cancelOrder(order, "CUSTOMER", reason);
  await order.save();
  notifyOrder(order, "cancelled");
  return ok({ ok: true, refunded: order.paymentStatus === "REFUNDED" });
});
