import type { SiteSettingsDTO } from "@/types";

export type PricingSettings = Pick<SiteSettingsDTO, "freeShippingThreshold" | "shippingFee" | "expressFee" | "taxRate">;

/** Loyalty: 1 point = ₹1. Redemption is capped at 20% of the post-coupon subtotal. */
export const LOYALTY_CAP = 0.2;
export const POINTS_PER_RUPEES = 100; // earn 1 point per ₹100 on delivery
export const REFERRAL_SIGNUP_POINTS = 50;
export const REFERRAL_REWARD_POINTS = 100;

export const maxRedeemablePoints = (subtotal: number, discount: number, balance: number) =>
  Math.max(0, Math.min(balance, Math.floor(Math.max(0, subtotal - discount) * LOYALTY_CAP)));

/**
 * Prices are GST-inclusive (standard for Indian retail). Tax is reported for the invoice breakdown but NOT
 * added on top. Shipping is decided on the post-coupon amount; loyalty points / gift cards pay for items
 * and never reduce shipping eligibility.
 */
export function computeTotals(
  subtotal: number,
  discount: number,
  delivery: "standard" | "express",
  s: PricingSettings,
  credits: { points?: number; gift?: number } = {}
) {
  const afterDiscount = Math.max(0, subtotal - discount);
  const loyaltyDiscount = Math.min(credits.points || 0, afterDiscount);
  const giftCardAmount = Math.min(credits.gift || 0, afterDiscount - loyaltyDiscount);
  const shipping =
    delivery === "express" ? s.expressFee : afterDiscount >= s.freeShippingThreshold || afterDiscount === 0 ? 0 : s.shippingFee;
  const tax = Math.round((afterDiscount * s.taxRate) / (100 + s.taxRate));
  return { subtotal, discount, loyaltyDiscount, giftCardAmount, shipping, tax, total: afterDiscount - loyaltyDiscount - giftCardAmount + shipping };
}
