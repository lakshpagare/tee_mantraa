import type { SiteSettingsDTO } from "@/types";

export type PricingSettings = Pick<SiteSettingsDTO, "freeShippingThreshold" | "shippingFee" | "expressFee" | "taxRate">;

/**
 * Prices are GST-inclusive (standard for Indian retail). Tax is reported for the
 * invoice breakdown but NOT added on top of the total.
 */
export function computeTotals(
  subtotal: number,
  discount: number,
  delivery: "standard" | "express",
  s: PricingSettings
) {
  const afterDiscount = Math.max(0, subtotal - discount);
  const base =
    delivery === "express" ? s.expressFee : afterDiscount >= s.freeShippingThreshold || afterDiscount === 0 ? 0 : s.shippingFee;
  const tax = Math.round((afterDiscount * s.taxRate) / (100 + s.taxRate));
  return { subtotal, discount, shipping: base, tax, total: afterDiscount + base };
}
