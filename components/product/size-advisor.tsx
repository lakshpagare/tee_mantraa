"use client";
import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import type { ProductDTO } from "@/types";

const TOPS = ["XS", "S", "M", "L", "XL", "XXL"];

/** Simple, transparent size suggestion. It is a guide, not a guarantee — the size guide has exact measurements. */
export function SizeAdvisor({ product, open, onClose, onPick }: { product: ProductDTO; open: boolean; onClose: () => void; onPick: (size: string) => void }) {
  const numeric = product.sizes.length > 0 && product.sizes.every((s) => /^\d+$/.test(s));
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const [fit, setFit] = useState<"fitted" | "regular" | "relaxed">("regular");
  const [result, setResult] = useState<string | null>(null);

  const suggest = () => {
    let size = "";
    if (numeric) {
      const w = Number(waist);
      if (!w) return;
      const target = fit === "relaxed" ? w + 1 : fit === "fitted" ? w - 1 : w;
      size = product.sizes.reduce((best, s) => (Math.abs(Number(s) - target) < Math.abs(Number(best) - target) ? s : best), product.sizes[0]);
    } else {
      const kg = Number(weight), cm = Number(height);
      if (!kg || !cm) return;
      let idx = kg < 55 ? 0 : kg < 65 ? 1 : kg < 75 ? 2 : kg < 85 ? 3 : kg < 95 ? 4 : 5;
      if (cm > 183) idx += 1;
      if (cm < 160) idx -= 1;
      idx += fit === "relaxed" ? 1 : fit === "fitted" ? -1 : 0;
      const ideal = TOPS[Math.max(0, Math.min(5, idx))];
      // snap to a size this product actually has
      const avail = product.sizes.filter((s) => TOPS.includes(s));
      size = avail.length ? avail.reduce((best, s) => (Math.abs(TOPS.indexOf(s) - idx) < Math.abs(TOPS.indexOf(best) - idx) ? s : best), avail[0]) : ideal;
    }
    setResult(size);
  };
  const field = "h-11 w-full border border-line px-3 text-sm focus:border-ink focus:outline-none";

  return (
    <Modal open={open} onClose={onClose} title="Find my size" className="max-w-md">
      <div className="p-8">
        <h3 className="font-display text-3xl">Find my size</h3>
        <p className="mt-2 text-sm text-muted">Tell us a little about yourself for a suggestion.</p>
        <div className="mt-6 space-y-4">
          {numeric ? (
            <label className="block"><span className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-muted">Waist (inches)</span><input className={field} inputMode="numeric" value={waist} onChange={(e) => setWaist(e.target.value.replace(/\D/g, ""))} /></label>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <label className="block"><span className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-muted">Height (cm)</span><input className={field} inputMode="numeric" value={height} onChange={(e) => setHeight(e.target.value.replace(/\D/g, ""))} /></label>
              <label className="block"><span className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-muted">Weight (kg)</span><input className={field} inputMode="numeric" value={weight} onChange={(e) => setWeight(e.target.value.replace(/\D/g, ""))} /></label>
            </div>
          )}
          <div>
            <span className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-muted">Preferred fit</span>
            <div className="flex gap-2">{(["fitted", "regular", "relaxed"] as const).map((f) => <button key={f} type="button" aria-pressed={fit === f} onClick={() => setFit(f)} className={`h-10 flex-1 border text-xs capitalize ${fit === f ? "border-ink bg-ink text-paper" : "border-line"}`}>{f}</button>)}</div>
          </div>
          <Button type="button" className="w-full" onClick={suggest}>Suggest a size</Button>
          {result && (
            <div role="status" className="border border-line bg-soft p-4 text-center text-sm">
              We suggest <strong className="font-display text-2xl">{result}</strong>
              <p className="mt-1 text-xs text-muted">A guide only — check the size guide for exact measurements.</p>
              <Button type="button" size="sm" variant="outline" className="mt-3" onClick={() => { onPick(result); onClose(); }}>Select {result}</Button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
