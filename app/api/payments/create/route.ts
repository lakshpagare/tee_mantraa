import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { ApiError, handler, ok, parseBody, requireUser } from "@/lib/api";
import { createRazorpayOrder } from "@/lib/razorpay";

const schema = z.object({ orderId: z.string().length(24) });

/** Retry payment for an existing unpaid Razorpay order. */
export const POST = handler(async (req: Request) => {
  const user = await requireUser();
  const { orderId } = await parseBody(req, schema);
  await connectDB();
  const order: any = await Order.findOne({ _id: orderId, user: user.id });
  if (!order || order.paymentMethod !== "RAZORPAY" || order.paymentStatus === "PAID" || order.stockState !== "RESERVED" || order.status !== "Pending") {
    throw new ApiError(409, "This order can no longer be paid online");
  }
  const rz = await createRazorpayOrder(order.total, order.orderNumber);
  order.razorpayOrderId = rz.id;
  order.paymentStatus = "PENDING";
  await order.save();
  return ok({ orderId: String(order._id), razorpay: { keyId: process.env.RAZORPAY_KEY_ID, razorpayOrderId: rz.id, amount: rz.amount } });
});
