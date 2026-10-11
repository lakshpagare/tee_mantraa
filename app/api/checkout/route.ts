import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { Order } from "@/models/Order";
import { Address } from "@/models/Address";
import { User } from "@/models/User";
import { GiftCard } from "@/models/GiftCard";
import { ApiError, handler, ok, parseBody, requireUser } from "@/lib/api";
import { checkoutSchema } from "@/lib/validators";
import { validateCoupon } from "@/lib/coupons";
import { evaluateOffers } from "@/lib/offers";
import { computeTotals, maxRedeemablePoints } from "@/lib/pricing";
import { getSettings } from "@/lib/data";
import { commitOrderStock, releaseStaleReservations, uniqueOrderNumber } from "@/lib/orders";
import { notifyOrder } from "@/lib/notify";
import { createRazorpayOrder, razorpayConfigured } from "@/lib/razorpay";
import { rateLimit } from "@/lib/rate-limit";

export const POST = handler(async (req: Request) => {
  const user = await requireUser();
  if (!(await rateLimit(`checkout:${user.id}`, 10, 60_000)).ok) throw new ApiError(429, "Too many attempts. Please wait a moment.");
  const body = await parseBody(req, checkoutSchema);
  await connectDB();
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
    return { product: p._id, name: p.name, slug: p.slug, image: p.images?.[0], sku: p.sku, cost: p.costPrice || 0, size: l.size, color: l.color, price: p.price, quantity: l.quantity };
  });

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  // Automatic offers / flash sales first, then the coupon on the remaining amount.
  const offerRes = await evaluateOffers(lines.map((l) => ({ productId: l.productId, quantity: l.quantity })));
  const offerDiscount = offerRes.discount;
  let discount = 0;
  let couponCode: string | undefined;
  if (body.couponCode) {
    const c = await validateCoupon(body.couponCode, subtotal - offerDiscount, user.id);
    if (!c.ok) throw new ApiError(422, c.error);
    discount = c.discount;
    couponCode = c.code;
  }

  // Credits are validated now and actually deducted only after stock is reserved.
  const dbUser: any = await User.findById(user.id).select("points");
  const points = body.usePoints ? maxRedeemablePoints(subtotal, discount + offerDiscount, dbUser?.points || 0) : 0;
  let gift: any = null;
  let giftAmount = 0;
  if (body.giftCardCode) {
    gift = await GiftCard.findOne({ code: body.giftCardCode.toUpperCase() });
    if (!gift || !gift.active || gift.balance <= 0 || (gift.expiryDate && gift.expiryDate < new Date())) throw new ApiError(422, "This gift card is not valid or has no balance");
    giftAmount = Math.min(gift.balance, Math.max(0, subtotal - offerDiscount - discount - points));
  }
  const totals = computeTotals(subtotal, discount + offerDiscount, body.deliveryMethod, settings, { points, gift: giftAmount });
  const method = totals.total === 0 ? "CREDITS" : body.paymentMethod;
  if (method === "RAZORPAY" && !razorpayConfigured()) {
    throw new ApiError(503, "Online payments are not available right now. Please choose Cash on Delivery.");
  }

  // Atomically reserve stock; roll back everything on any failure.
  const reserved: [string, number][] = [];
  let pointsTaken = 0;
  let giftTaken = 0;
  try {
    for (const [pid, qty] of qtyByProduct) {
      const r = await Product.updateOne(
        { _id: pid, $expr: { $gte: [{ $subtract: ["$stock", "$reserved"] }, qty] } },
        { $inc: { reserved: qty } }
      );
      if (!r.modifiedCount) throw new ApiError(409, `Sorry, ${byId.get(pid).name} is low on stock. Please reduce the quantity.`);
      reserved.push([pid, qty]);
    }
    if (totals.loyaltyDiscount > 0) {
      const r = await User.updateOne({ _id: user.id, points: { $gte: totals.loyaltyDiscount } }, { $inc: { points: -totals.loyaltyDiscount } });
      if (!r.modifiedCount) throw new ApiError(409, "Your points balance changed. Please review your order.");
      pointsTaken = totals.loyaltyDiscount;
    }
    if (gift && totals.giftCardAmount > 0) {
      const r = await GiftCard.updateOne({ _id: gift._id, balance: { $gte: totals.giftCardAmount } }, { $inc: { balance: -totals.giftCardAmount } });
      if (!r.modifiedCount) throw new ApiError(409, "The gift card balance changed. Please review your order.");
      giftTaken = totals.giftCardAmount;
    }

    const { email, isDefault: _d, label: _l, ...addr } = body.address;
    const order: any = new Order({
      orderNumber: await uniqueOrderNumber(),
      user: new Types.ObjectId(user.id),
      items,
      shippingAddress: { ...addr, email },
      deliveryMethod: body.deliveryMethod,
      ...totals,
      discount, // coupon only; automatic offers are stored separately
      offerDiscount,
      offerName: offerRes.offer?.name,
      whatsappOptIn: body.whatsappOptIn,
      couponCode,
      giftCardCode: giftTaken ? gift.code : undefined,
      paymentMethod: method,
      timeline: [{ status: "Pending", note: "Order placed", at: new Date() }],
    });

    if (!(await Address.exists({ user: user.id }))) await Address.create({ user: user.id, label: "Home", ...addr, isDefault: true });
    await User.updateOne({ _id: user.id, phone: { $in: [null, ""] } }, { phone: addr.phone });

    if (method === "COD" || method === "CREDITS") {
      order.status = "Confirmed";
      if (method === "CREDITS") order.paymentStatus = "PAID";
      order.timeline.push({ status: "Confirmed", note: method === "COD" ? "Cash on Delivery order confirmed" : "Paid with points / gift card", at: new Date() });
      await commitOrderStock(order);
      reserved.length = 0; pointsTaken = 0; giftTaken = 0; // now owned by the order
      await order.save();
      notifyOrder(order, "placed");
      return ok({ orderId: String(order._id), orderNumber: order.orderNumber }, 201);
    }

    await order.save();
    try {
      const rz = await createRazorpayOrder(order.total, order.orderNumber);
      order.razorpayOrderId = rz.id;
      await order.save();
      reserved.length = 0; pointsTaken = 0; giftTaken = 0;
      return ok(
        { orderId: String(order._id), orderNumber: order.orderNumber, razorpay: { keyId: process.env.RAZORPAY_KEY_ID, razorpayOrderId: rz.id, amount: rz.amount } },
        201
      );
    } catch (e) {
      await Order.deleteOne({ _id: order._id }); // reservation and credits are rolled back by the outer catch
      throw e;
    }
  } catch (e) {
    for (const [pid, qty] of reserved) await Product.updateOne({ _id: pid }, { $inc: { reserved: -qty } });
    if (pointsTaken) await User.updateOne({ _id: user.id }, { $inc: { points: pointsTaken } });
    if (giftTaken && gift) await GiftCard.updateOne({ _id: gift._id }, { $inc: { balance: giftTaken } });
    throw e;
  }
});
