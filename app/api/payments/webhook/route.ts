import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { markOrderPaid } from "@/lib/orders";

/**
 * Razorpay webhook. Configure in Razorpay Dashboard → Settings → Webhooks:
 *   URL: https://YOUR-DOMAIN/api/payments/webhook   Events: payment.captured, order.paid, payment.failed
 *   Secret: same value as RAZORPAY_WEBHOOK_SECRET
 * Confirms orders even when the customer closes the tab before the browser callback.
 */
export async function POST(req: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return new Response("Webhook not configured", { status: 503 });

  const raw = await req.text();
  const signature = req.headers.get("x-razorpay-signature") || "";
  const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return new Response("Invalid signature", { status: 400 });

  try {
    const event = JSON.parse(raw);
    const payment = event?.payload?.payment?.entity;
    const rzOrderId: string | undefined = payment?.order_id || event?.payload?.order?.entity?.id;
    if (!rzOrderId) return new Response("ok");
    await connectDB();
    const order: any = await Order.findOne({ razorpayOrderId: rzOrderId });
    if (!order) return new Response("ok");

    if (event.event === "payment.captured" || event.event === "order.paid") {
      await markOrderPaid(order, payment?.id || "webhook");
    } else if (event.event === "payment.failed" && order.paymentStatus !== "PAID") {
      order.paymentStatus = "FAILED";
      order.timeline.push({ status: order.status, note: "Payment failed at gateway", at: new Date() });
      await order.save();
    }
  } catch (e) {
    console.error("[webhook]", e);
    return new Response("error", { status: 500 }); // Razorpay will retry
  }
  return new Response("ok");
}
