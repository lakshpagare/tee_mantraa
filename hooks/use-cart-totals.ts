"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { cartSubtotal, useCart } from "@/store/cart";
import { useSite } from "@/hooks/use-site";
import { computeTotals } from "@/lib/pricing";

/** Cart totals + coupon handling. The server recalculates everything at checkout; this is for display. */
export function useCartTotals(delivery: "standard" | "express" = "standard") {
  const items = useCart((s) => s.items);
  const couponCode = useCart((s) => s.couponCode);
  const setCoupon = useCart((s) => s.setCoupon);
  const site = useSite();
  const [discount, setDiscount] = useState(0);
  const [error, setError] = useState("");
  const [applying, setApplying] = useState(false);
  const subtotal = cartSubtotal(items);
  const lines = useMemo(() => items.map((i) => ({ productId: i.productId, quantity: i.quantity })), [items]);
  const signature = lines.map((l) => `${l.productId}:${l.quantity}`).join(",");

  const validate = useCallback(
    async (code: string) => {
      const res = await fetch("/api/coupons/validate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, items: lines }) });
      return (await res.json()) as { ok: boolean; discount?: number; code?: string; error?: string };
    },
    [lines]
  );

  // Re-validate when the cart changes.
  useEffect(() => {
    if (!couponCode || !lines.length) { setDiscount(0); return; }
    let cancelled = false;
    validate(couponCode).then((r) => {
      if (cancelled) return;
      if (r.ok) setDiscount(r.discount || 0);
      else { setDiscount(0); setCoupon(""); toast.error(r.error || "Coupon removed"); }
    }).catch(() => {});
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [couponCode, signature]);

  const apply = async (code: string) => {
    setError("");
    if (!code.trim()) return setError("Enter a coupon code");
    setApplying(true);
    try {
      const r = await validate(code);
      if (!r.ok) return setError(r.error || "Invalid coupon");
      setDiscount(r.discount || 0);
      setCoupon(r.code || code.toUpperCase());
      toast.success(`Coupon ${r.code} applied`);
    } catch {
      setError("Could not check the coupon. Please try again.");
    } finally {
      setApplying(false);
    }
  };
  const remove = () => { setCoupon(""); setDiscount(0); setError(""); };

  return { items, couponCode, discount, error, applying, apply, remove, subtotal, totals: computeTotals(subtotal, discount, delivery, site) };
}
