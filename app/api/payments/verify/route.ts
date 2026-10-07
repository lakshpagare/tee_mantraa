import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { ApiError, handler, ok, parseBody, requireUser } from "@/lib/api";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { commitOrderStock } from "@/lib/orders";

const schema = z.object({
  orderId: z.string().length(24),
  razorpay_order_id: z.string().min(5),
  razorpay_payment_id: z.string().min(5),
  razorpay_signature: z.string().min(10),
});

export const POST = handler(async (req: Request) => {
  const user = await requireUser();
  const b = await parseBody(req, schema);
  await connectDB();
  const order: any = await Order.findOne({ _id: b.orderId, user: user.id });
  if (!order || order.razorpayOrderId !== b.razorpay_order_id) throw new ApiError(404, "Order not found");
  if (order.paymentStatus === "PAID") return ok({ ok: true, orderId: String(order._id) });

  if (!verifyRazorpaySignature(b.razorpay_order_id, b.razorpay_payment_id, b.razorpay_signature)) {
    order.paymentStatus = "FAILED";
    order.timeline.push({ status: order.status, note: "Payment verification failed", at: new Date() });
    await order.save();
    throw new ApiError(400, "Payment could not be verified. If money was debited, contact support with your order number.");
  }

  order.paymentStatus = "PAID";
  order.razorpayPaymentId = b.razorpay_payment_id;
  if (order.stockState === "RESERVED") {
    order.status = "Confirmed";
    order.timeline.push({ status: "Confirmed", note: "Payment received", at: new Date() });
    await commitOrderStock(order);
  } else {
    // Paid after the reservation window expired: keep order for manual review/refund.
    order.status = "Pending";
    order.timeline.push({ status: "Pending", note: "Paid after reservation expired — needs review", at: new Date() });
  }
  await order.save();
  return ok({ ok: true, orderId: String(order._id) });
});
