"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { Zap } from "lucide-react";
import type { FlashSaleDTO } from "@/lib/data";
import { Price } from "@/components/ui/price";
import type { ProductDTO } from "@/types";

const FlashContext = createContext<FlashSaleDTO[]>([]);
export function FlashProvider({ value, children }: { value: FlashSaleDTO[]; children: React.ReactNode }) {
  return <FlashContext.Provider value={value}>{children}</FlashContext.Provider>;
}

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => { setNow(Date.now()); const t = setInterval(() => setNow(Date.now()), intervalMs); return () => clearInterval(t); }, [intervalMs]);
  return now;
}

const catId = (p: ProductDTO) => (typeof p.category === "object" && p.category ? p.category._id : p.category || "");

/** Reduced price for a product if an active flash sale applies; the best (highest %) sale wins. */
export function useFlashPrice(product: ProductDTO): { price: number; percent: number; endsAt: string; label: string } | null {
  const sales = useContext(FlashContext);
  const now = useNow(30_000);
  if (now === null) return null; // render the normal price on the server / first paint to avoid hydration mismatch
  const hit = sales
    .filter((s) => new Date(s.endsAt).getTime() > now)
    .filter((s) => s.scope === "all" || (s.scope === "category" && s.refs.includes(String(catId(product)))) || (s.scope === "products" && s.refs.includes(product._id)))
    .sort((a, b) => b.percent - a.percent)[0];
  if (!hit) return null;
  return { price: Math.round(product.price * (1 - hit.percent / 100)), percent: hit.percent, endsAt: hit.endsAt, label: hit.label };
}

const pad = (n: number) => String(n).padStart(2, "0");
export function Countdown({ endsAt, className }: { endsAt: string; className?: string }) {
  const now = useNow(1000);
  if (now === null) return <span className={className}>--:--:--</span>;
  const ms = Math.max(0, new Date(endsAt).getTime() - now);
  const d = Math.floor(ms / 86400000), h = Math.floor((ms % 86400000) / 3600000), m = Math.floor((ms % 3600000) / 60000), s = Math.floor((ms % 60000) / 1000);
  return <time dateTime={endsAt} className={className} aria-label={`Ends in ${d} days ${h} hours ${m} minutes`}>{d > 0 ? `${d}d ` : ""}{pad(h)}:{pad(m)}:{pad(s)}</time>;
}

/** Slim strip above the page content while a flash sale is live. */
export function FlashStrip() {
  const sales = useContext(FlashContext);
  const now = useNow(30_000);
  if (now === null) return null;
  const live = sales.filter((s) => new Date(s.endsAt).getTime() > now).sort((a, b) => b.percent - a.percent)[0];
  if (!live) return null;
  return (
    <div role="region" aria-label="Flash sale" className="bg-[#B4231B] text-white">
      <p className="container-wide flex items-center justify-center gap-3 py-2 text-center text-[11px] font-medium uppercase tracking-[0.2em]">
        <Zap className="h-3.5 w-3.5 fill-white" aria-hidden />
        <span>{live.label} · {live.percent}% off</span>
        <span>ends in <Countdown endsAt={live.endsAt} className="tabular-nums" /></span>
      </p>
    </div>
  );
}

/** Price with flash-sale reduction when one applies (used where hooks can't be called conditionally). */
export function FlashPrice({ product, className }: { product: ProductDTO; className?: string }) {
  const flash = useFlashPrice(product);
  return <Price price={flash ? flash.price : product.price} compareAt={flash ? Math.max(product.price, product.compareAtPrice || 0) : product.compareAtPrice} showBadge className={`${className || ""} ${flash ? "text-[#B4231B]" : ""}`} />;
}
