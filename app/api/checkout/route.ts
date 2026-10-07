import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { Order } from "@/models/Order";
import { Address } from "@/models/Address";
import { User } from "@/models/User";
import { ApiError, handler, ok, parseBody, requireUser } from "@/lib/api";
import { checkoutSchema } from "@/lib/validators";
import { validateCoupon } from "@/lib/coupons";
import { computeTotals } from "@/lib/pricing";
import { getSettings } from "@/lib/data";
import { commitOrderStock, releaseOrderStock, releaseStaleReservations, uniqueOrderNumber } from "@/lib/orders";
import { createRazorpayOrder, razorpayConfigured } from "@/lib/razorpay";
import { rateLimit } from "@/lib/rate-limit";

export const POST = handler(async (req: Request) => {
  const user = await requireUser();
  if (!rateLimit(`checkout:${user.id}`, 10, 60_000).ok) throw new ApiError(429, "Too many attempts. Please wait a moment.");
  const body = await parseBody(req, checkoutSchema);
  await connectDB();
  if (body.paymentMethod === "RAZORPAY" && !razorpayConfigured()) {
    throw new ApiError(503, "Online payments are not available right now. Please choose Cash on Delivery.");
  }
  await releaseStaleReservations();
  const settings = await getSettings();

  // Merge duplicate lines & load products from the DB (client prices are never trusted).
  const merged = new Map<string, (typeof body.items)[number]>();
  for (const it of body.items) {
    const k = `${it.productId}|${it.size}|${it.color}`;
    const ex = merged.get(k);
    merged.set(k, ex ? { ...ex, quantity: Math.min(10, ex.quantity + it.quantity) } : it);
  }
  const lines = [...merged.values()];
  const products = await Product.find({ _id: { $in: lines.map((l) => l.productId) }, published: true });
  const byId = new Map<string, any>(products.map((p: any) => [String(p._id), p]));

  const qtyByProduct = new Map<string, number>();
  const items = lines.map((l) => {
    const p = byId.get(l.productId);
    if (!p) throw new ApiError(409, "An item in your cart is no longer available");
    if (p.sizes.length && !p.sizes.includes(l.size)) throw new ApiError(409, `Please re-select a size for ${p.name}`);
    if (p.colors.length && !p.colors.some((c: any) => c.name === l.color)) throw new ApiError(409, `Please re-select a colour for ${p.name}`);
    qtyByProduct.set(l.productId, (qtyByProduct.get(l.productId) || 0) + l.quantity);
    return {
      product: p._id, name: p.name, slug: p.slug, image: p.images?.[0], sku: p.sku,
      size: l.size, color: l.color, price: p.price, quantity: l.quantity,
    };
  });

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  let discount = 0;
  let couponCode: string | undefined;
  if (body.couponCode) {
    const c = await validateCoupon(body.couponCode, subtotal, user.id);
    if (!c.ok) throw new ApiError(422, c.error);
    discount = c.discount;
    couponCode = c.code;
  }
  const totals = computeTotals(subtotal, discount, body.deliveryMethod, settings);

  // Atomically reserve stock; roll back on any failure.
  const reserved: [string, number][] = [];
  try {
    for (const [pid, qty] of qtyByProduct) {
      const r = await Product.updateOne(
        { _id: pid, $expr: { $gte: [{ $subtract: ["$stock", "$reserved"] }, qty] } },
        { $inc: { reserved: qty } }
      );
      if (!r.modifiedCount) throw new ApiError(409, `Sorry, ${byId.get(pid).name} is low on stock. Please reduce the quantity.`);
      reserved.push([pid, qty]);
    }
    const { email, isDefault: _d, label: _l, ...addr } = body.address;
    const order: any = new Order({
      orderNumber: await uniqueOrderNumber(),
      user: new Types.ObjectId(user.id),
      items,
      shippingAddress: { ...addr, email },
      deliveryMethod: body.deliveryMethod,
      ...totals,
      couponCode,
      paymentMethod: body.paymentMethod,
      timeline: [{ status: "Pending", note: "Order placed", at: new Date() }],
    });

    // Remember the first shipping address for next time.
    if (!(await Address.exists({ user: user.id }))) await Address.create({ user: user.id, label: "Home", ...addr, isDefault: true });
    await User.updateOne({ _id: user.id, phone: { $in: [null, ""] } }, { phone: addr.phone });

    if (body.paymentMethod === "COD") {
      order.status = "Confirmed";
      order.timeline.push({ status: "Confirmed", note: "Cash on Delivery order confirmed", at: new Date() });
      await commitOrderStock(order);
      reserved.length = 0; // committed: nothing left to roll back
      await order.save();
      return ok({ orderId: String(order._id), orderNumber: order.orderNumber }, 201);
    }

    await order.save();
    try {
      const rz = await createRazorpayOrder(order.total, order.orderNumber);
      order.razorpayOrderId = rz.id;
      await order.save();
      reserved.length = 0; // order now owns the reservation
      return ok(
        {
          orderId: String(order._id),
          orderNumber: order.orderNumber,
          razorpay: { keyId: process.env.RAZORPAY_KEY_ID, razorpayOrderId: rz.id, amount: rz.amount },
        },
        201
      );
    } catch (e) {
      await Order.deleteOne({ _id: order._id }); // reservation is rolled back by the outer catch
      throw e;
    }
  } catch (e) {
    for (const [pid, qty] of reserved) await Product.updateOne({ _id: pid }, { $inc: { reserved: -qty } });
    throw e;
  }
});
