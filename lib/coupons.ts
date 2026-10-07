import { Coupon } from "@/models/Coupon";
import { Order } from "@/models/Order";
import { Types } from "mongoose";

export type CouponResult =
  | { ok: true; discount: number; code: string; description?: string }
  | { ok: false; error: string };

/** Validates a coupon against server-calculated subtotal. */
export async function validateCoupon(rawCode: string, subtotal: number, userId?: string): Promise<CouponResult> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { ok: false, error: "Enter a coupon code" };
  const c = await Coupon.findOne({ code }).lean<any>();
  if (!c || !c.active) return { ok: false, error: "This coupon is not valid" };
  const now = new Date();
  if (c.startDate && c.startDate > now) return { ok: false, error: "This coupon is not active yet" };
  if (c.expiryDate && c.expiryDate < now) return { ok: false, error: "This coupon has expired" };
  if (c.usageLimit && c.usedCount >= c.usageLimit) return { ok: false, error: "This coupon has reached its usage limit" };
  if (subtotal < (c.minOrder || 0)) {
    return { ok: false, error: `Add items worth ₹${Math.ceil(c.minOrder - subtotal)} more to use this coupon` };
  }
  if (userId && c.perUserLimit) {
    const used = await Order.countDocuments({
      user: new Types.ObjectId(userId),
      couponCode: code,
      status: { $nin: ["Cancelled", "Returned"] },
    });
    if (used >= c.perUserLimit) return { ok: false, error: "You have already used this coupon" };
  }
  let discount = c.type === "PERCENT" ? Math.round((subtotal * c.value) / 100) : c.value;
  if (c.maxDiscount) discount = Math.min(discount, c.maxDiscount);
  discount = Math.min(discount, subtotal);
  return { ok: true, discount, code, description: c.description };
}
