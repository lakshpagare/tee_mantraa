"use client";
import { useState } from "react";
import { Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { formatINR } from "@/lib/utils";

interface Totals { subtotal: number; discount: number; shipping: number; tax: number; total: number }

export function CouponBox({ code, error, applying, onApply, onRemove }: { code: string; error: string; applying: boolean; onApply: (c: string) => void; onRemove: () => void }) {
  const [value, setValue] = useState("");
  if (code) {
    return (
      <div className="flex items-center justify-between border border-line bg-soft px-4 py-3 text-sm">
        <span className="flex items-center gap-2"><Tag className="h-4 w-4" /><strong>{code}</strong> applied</span>
        <button onClick={onRemove} aria-label="Remove coupon" className="text-muted hover:text-ink"><X className="h-4 w-4" /></button>
      </div>
    );
  }
  return (
    <form onSubmit={(e) => { e.preventDefault(); onApply(value); }}>
      <div className="flex gap-2">
        <Input aria-label="Coupon code" placeholder="Coupon code" value={value} onChange={(e) => setValue(e.target.value.toUpperCase())} maxLength={30} />
        <Button type="submit" variant="outline" loading={applying}>Apply</Button>
      </div>
      {error && <p role="alert" className="mt-2 text-xs text-red-600">{error}</p>}
    </form>
  );
}

export function TotalsTable({ t }: { t: Totals }) {
  const row = "flex justify-between text-sm";
  return (
    <dl className="space-y-3">
      <div className={row}><dt className="text-muted">Subtotal</dt><dd>{formatINR(t.subtotal)}</dd></div>
      {t.discount > 0 && <div className={row}><dt className="text-muted">Discount</dt><dd className="text-green-700">−{formatINR(t.discount)}</dd></div>}
      <div className={row}><dt className="text-muted">Shipping</dt><dd>{t.shipping === 0 ? "Free" : formatINR(t.shipping)}</dd></div>
      <div className={row}><dt className="text-muted">Tax (GST, included)</dt><dd>{formatINR(t.tax)}</dd></div>
      <div className="flex justify-between border-t border-line pt-4 text-base font-medium"><dt>Total</dt><dd>{formatINR(t.total)}</dd></div>
    </dl>
  );
}
