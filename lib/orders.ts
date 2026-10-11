import { Product } from "@/models/Product";
import { Order } from "@/models/Order";
import { Coupon } from "@/models/Coupon";
import { User } from "@/models/User";
import { GiftCard } from "@/models/GiftCard";
import { safeEmail, sendLowStockAlert } from "@/lib/emails";
import { notifyOrder } from "@/lib/notify";
import { refundRazorpayPayment, razorpayConfigured } from "@/lib/razorpay";

/** Move an order's inventory from RESERVED to COMMITTED (stock deducted, sales counted). */
export async function commitOrderStock(order: any) {
  if (order.stockState !== "RESERVED") return;
  await Promise.all(
    order.items.map((i: any) =>
      Product.updateOne({ _id: i.product }, { $inc: { stock: -i.quantity, reserved: -i.quantity, sold: i.quantity } })
    )
  );
  order.stockState = "COMMITTED";
  if (order.couponCode) await Coupon.updateOne({ code: order.couponCode }, { $inc: { usedCount: 1 } });

  // Low-stock alert to the admin (fire and forget).
  safeEmail(async () => {
    const products: any[] = await Product.find({ _id: { $in: order.items.map((i: any) => i.product) } }).select("name sku stock reserved lowStockThreshold").lean();
    const low = products
      .map((p) => ({ name: p.name, sku: p.sku, available: p.stock - p.reserved, threshold: p.lowStockThreshold }))
      .filter((p) => p.available <= p.threshold);
    if (low.length) await sendLowStockAlert(low);
  });
}

/** Give back loyalty points and gift-card balance used by an order (once). */
async function refundCredits(order: any) {
  if (order.creditsRefunded) return;
  if (order.loyaltyDiscount > 0) await User.updateOne({ _id: order.user }, { $inc: { points: order.loyaltyDiscount } });
  if (order.giftCardAmount > 0 && order.giftCardCode) await GiftCard.updateOne({ code: order.giftCardCode }, { $inc: { balance: order.giftCardAmount } });
  order.creditsRefunded = true;
}

/** Release held/committed stock (cancellation or return) and refund credits. */
export async function releaseOrderStock(order: any) {
  if (order.stockState === "RELEASED") return;
  const committed = order.stockState === "COMMITTED";
  await Promise.all(
    order.items.map((i: any) =>
      Product.updateOne(
        { _id: i.product },
        committed ? { $inc: { stock: i.quantity, sold: -i.quantity } } : { $inc: { reserved: -i.quantity } }
      )
    )
  );
  if (committed && order.couponCode) await Coupon.updateOne({ code: order.couponCode }, { $inc: { usedCount: -1 } });
  await refundCredits(order);
  order.stockState = "RELEASED";
}

/** Shared by the verify endpoint and the Razorpay webhook. Idempotent. */
export async function markOrderPaid(order: any, paymentId: string) {
  if (order.paymentStatus === "PAID") return false;
  order.paymentStatus = "PAID";
  order.razorpayPaymentId = paymentId;
  if (order.stockState === "RESERVED") {
    order.status = "Confirmed";
    order.timeline.push({ status: "Confirmed", note: "Payment received", at: new Date() });
    await commitOrderStock(order);
    await order.save();
    notifyOrder(order, "placed");
  } else {
    // Paid after the reservation window expired: keep order for manual review/refund.
    order.status = "Pending";
    order.timeline.push({ status: "Pending", note: "Paid after reservation expired — needs review", at: new Date() });
    await order.save();
  }
  return true;
}

export function generateOrderNumber() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `TM-${ymd}-${Math.floor(1000 + Math.random() * 9000)}${Math.floor(Math.random() * 10)}`;
}

export async function uniqueOrderNumber() {
  for (let i = 0; i < 5; i++) {
    const n = generateOrderNumber();
    if (!(await Order.exists({ orderNumber: n }))) return n;
  }
  return `${generateOrderNumber()}${Date.now() % 100}`;
}

/** Free stock held by abandoned (unpaid) online-payment checkouts older than 30 minutes. */
export async function releaseStaleReservations() {
  const stale = await Order.find({
    paymentMethod: "RAZORPAY",
    paymentStatus: "PENDING",
    status: "Pending",
    stockState: "RESERVED",
    createdAt: { $lt: new Date(Date.now() - 30 * 60 * 1000) },
  }).limit(50);
  for (const o of stale) {
    await releaseOrderStock(o);
    o.status = "Cancelled";
    o.paymentStatus = "FAILED";
    o.timeline.push({ status: "Cancelled", note: "Payment not completed in time", at: new Date() });
    await o.save();
  }
}

/** Attempts an automatic Razorpay refund for a paid online order. Adds a timeline note describing the outcome. */
export async function refundIfPaid(order: any): Promise<void> {
  if (order.paymentMethod !== "RAZORPAY" || order.paymentStatus !== "PAID" || !order.razorpayPaymentId) return;
  if (!razorpayConfigured()) {
    order.timeline.push({ status: order.status, note: "Refund pending — issue it from the Razorpay dashboard", at: new Date() });
    return;
  }
  const id = await refundRazorpayPayment(order.razorpayPaymentId, order.total);
  if (id) {
    order.paymentStatus = "REFUNDED";
    order.timeline.push({ status: order.status, note: `Refund of ₹${order.total} initiated (${id})`, at: new Date() });
  } else {
    order.timeline.push({ status: order.status, note: "Automatic refund failed — issue it from the Razorpay dashboard", at: new Date() });
  }
}

/** Cancels an order: releases stock/credits, attempts a refund, records who cancelled and why. Caller saves + notifies. */
export async function cancelOrder(order: any, by: "CUSTOMER" | "ADMIN" | "SYSTEM", reason?: string) {
  await releaseOrderStock(order);
  order.status = "Cancelled";
  order.cancelledBy = by;
  if (reason) order.cancelReason = reason;
  order.timeline.push({ status: "Cancelled", note: `Cancelled by ${by.toLowerCase()}${reason ? `: ${reason}` : ""}`, at: new Date() });
  await refundIfPaid(order);
}
