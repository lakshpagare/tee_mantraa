"use client";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/store/cart";

export interface OfferState { discount: number; name: string | null; label: string | null; flash: boolean; hint: string | null }
const NONE: OfferState = { discount: 0, name: null, label: null, flash: false, hint: null };

/** Evaluates automatic offers / flash sales for the current cart on the server. */
export function useOfferEval(enabled = true): OfferState {
  const items = useCart((s) => s.items);
  const [offer, setOffer] = useState<OfferState>(NONE);
  const lines = useMemo(() => items.map((i) => ({ productId: i.productId, quantity: i.quantity })), [items]);
  const signature = lines.map((l) => `${l.productId}:${l.quantity}`).join(",");

  useEffect(() => {
    if (!enabled || !lines.length) { setOffer(NONE); return; }
    let cancelled = false;
    const t = setTimeout(() => {
      fetch("/api/offers/evaluate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: lines }) })
        .then((r) => r.json())
        .then((d) => { if (!cancelled) setOffer({ discount: d.discount || 0, name: d.offer?.name || null, label: d.offer?.label || null, flash: !!d.offer?.flash, hint: d.hint || null }); })
        .catch(() => {});
    }, 200);
    return () => { cancelled = true; clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, enabled]);
  return offer;
}
