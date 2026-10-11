import { Types } from "mongoose";
import { Offer } from "@/models/Offer";
import { Product } from "@/models/Product";
import { Collection } from "@/models/Collection";

export interface OfferResult {
  discount: number;
  offer: { id: string; name: string; label: string; flash: boolean } | null;
  hint: string | null;
}
export const NO_OFFER: OfferResult = { discount: 0, offer: null, hint: null };

export async function getActiveOffers(flashOnly = false) {
  const now = new Date();
  return Offer.find({
    active: true,
    ...(flashOnly ? { flash: true } : {}),
    $and: [
      { $or: [{ startDate: null }, { startDate: { $exists: false } }, { startDate: { $lte: now } }] },
      { $or: [{ endDate: null }, { endDate: { $exists: false } }, { endDate: { $gte: now } }] },
    ],
  }).lean<any[]>();
}

type Unit = { price: number; cat: string; pid: string; cols: Set<string> };

const inScope = (o: any, u: Unit) => {
  if (o.scope === "all") return true;
  const refs = (o.refs || []).map(String);
  if (o.scope === "category") return refs.includes(u.cat);
  if (o.scope === "products") return refs.includes(u.pid);
  if (o.scope === "collection") return refs.some((r: string) => u.cols.has(r));
  return false;
};

function discountFor(o: any, eligible: Unit[]): number {
  const n = eligible.length;
  if (n === 0 || n < o.minQty) return 0;
  const prices = eligible.map((u) => u.price).sort((a, b) => b - a);
  const total = prices.reduce((s, p) => s + p, 0);
  let d = 0;
  if (o.type === "PERCENT_OFF") d = Math.round((total * o.value) / 100);
  else if (o.type === "BUY_X_GET_Y") {
    const group = o.minQty + o.value;
    for (let g = 0; g + group <= n; g += group) d += prices.slice(g + o.minQty, g + group).reduce((s, p) => s + p, 0);
  } else if (o.type === "BUNDLE_PRICE") {
    for (let g = 0; g + o.minQty <= n; g += o.minQty) d += Math.max(0, prices.slice(g, g + o.minQty).reduce((s, p) => s + p, 0) - o.value);
  }
  return Math.max(0, Math.min(d, total));
}

/** Picks the single best automatic offer for the cart (offers don't stack with each other; coupons stack on top). */
export async function evaluateOffers(lines: { productId: string; quantity: number }[]): Promise<OfferResult> {
  const ids = [...new Set(lines.map((l) => l.productId))].filter((i) => Types.ObjectId.isValid(i));
  if (!ids.length) return NO_OFFER;
  const offers = await getActiveOffers();
  if (!offers.length) return NO_OFFER;
  const products = await Product.find({ _id: { $in: ids } }).select("price category").lean<any[]>();
  const byId = new Map(products.map((p) => [String(p._id), p]));
  const cols = offers.some((o) => o.scope === "collection") ? await Collection.find({ products: { $in: ids } }).select("_id products").lean<any[]>() : [];

  const units: Unit[] = [];
  for (const l of lines) {
    const p = byId.get(l.productId);
    if (!p) continue;
    const colSet = new Set<string>(cols.filter((c) => (c.products || []).some((x: any) => String(x) === l.productId)).map((c) => String(c._id)));
    for (let k = 0; k < l.quantity; k++) units.push({ price: p.price, cat: String(p.category), pid: l.productId, cols: colSet });
  }

  let best: OfferResult = NO_OFFER;
  let hint: { missing: number; text: string } | null = null;
  for (const o of offers) {
    const eligible = units.filter((u) => inScope(o, u));
    const d = discountFor(o, eligible);
    if (d > best.discount) best = { discount: d, offer: { id: String(o._id), name: o.name, label: o.label || o.name, flash: !!o.flash }, hint: null };
    if (d === 0 && eligible.length > 0 && eligible.length < o.minQty && !o.flash) {
      const missing = o.minQty - eligible.length;
      if (!hint || missing < hint.missing) hint = { missing, text: `Add ${missing} more eligible item${missing > 1 ? "s" : ""} to unlock: ${o.label || o.name}` };
    }
  }
  return { ...best, hint: hint?.text || null };
}
