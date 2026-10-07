import { Product } from "@/models/Product";
import { Order } from "@/models/Order";
import { Coupon } from "@/models/Coupon";

/** Move an order's inventory from RESERVED to COMMITTED (stock deducted, sales counted). */
export async function commitOrderStock(order: any) {
  if (order.stockState !== "RESERVED") return;
  await Promise.all(
    order.items.map((i: any) =>
      Product.updateOne(
        { _id: i.product },
        { $inc: { stock: -i.quantity, reserved: -i.quantity, sold: i.quantity } }
      )
    )
  );
  order.stockState = "COMMITTED";
  if (order.couponCode) await Coupon.updateOne({ code: order.couponCode }, { $inc: { usedCount: 1 } });
}

/** Release held/committed stock (cancellation or return). */
export async function releaseOrderStock(order: any) {
  if (order.stockState === "RELEASED") return;
  const committed = order.stockState === "COMMITTED";
  await Promise.all(
    order.items.map((i: any) =>
      Product.updateOne(
        { _id: i.product },
        committed
          ? { $inc: { stock: i.quantity, sold: -i.quantity } }
          : { $inc: { reserved: -i.quantity } }
      )
    )
  );
  if (committed && order.couponCode) await Coupon.updateOne({ code: order.couponCode }, { $inc: { usedCount: -1 } });
  order.stockState = "RELEASED";
}

export function generateOrderNumber() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `VR-${ymd}-${Math.floor(1000 + Math.random() * 9000)}${Math.floor(Math.random() * 10)}`;
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
