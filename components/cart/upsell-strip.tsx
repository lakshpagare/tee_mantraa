"use client";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Img } from "@/components/ui/img";
import { FlashPrice } from "@/components/flash-sale";
import { useSite } from "@/hooks/use-site";
import { cartSubtotal, useCart } from "@/store/cart";
import { useUI } from "@/store/ui";
import { cn, formatINR } from "@/lib/utils";
import type { ProductDTO } from "@/types";

/** "Add these too" suggestions based on what's in the bag. Picking one opens quick view to choose a size. */
export function UpsellStrip({ compact = false, className }: { compact?: boolean; className?: string }) {
  const items = useCart((s) => s.items);
  const { freeShippingThreshold } = useSite();
  const openQuickView = useUI((s) => s.openQuickView);
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const ids = [...new Set(items.map((i) => i.productId))].join(",");
  const gap = Math.max(0, freeShippingThreshold - cartSubtotal(items));

  useEffect(() => {
    if (!ids) { setProducts([]); return; }
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      fetch(`/api/upsell?ids=${ids}&gap=${Math.round(gap)}`, { signal: ctrl.signal }).then((r) => r.json()).then((d) => setProducts(d.products || [])).catch(() => {});
    }, 300);
    return () => { clearTimeout(t); ctrl.abort(); };
    // gap is intentionally bucketed so we don't refetch on every small change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids, Math.round(gap / 250)]);

  if (!products.length) return null;
  return (
    <section aria-label="You may also like" className={className}>
      <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.2em]">{gap > 0 && gap < 1500 ? `Add ${formatINR(gap)} more for free shipping` : "Goes well with your bag"}</p>
      <ul className={cn("no-scrollbar flex gap-3 overflow-x-auto", !compact && "md:grid md:grid-cols-4 md:overflow-visible")}>
        {products.map((p) => (
          <li key={p._id} className={cn("shrink-0", compact ? "w-24" : "w-32 md:w-auto")}>
            <div className="relative">
              <Link href={`/product/${p.slug}`} aria-label={p.name}><Img src={p.images[0]} alt={p.name} ratio="4/5" sizes="140px" /></Link>
              <button type="button" onClick={() => openQuickView(p)} aria-label={`Add ${p.name}`} className="absolute bottom-1.5 right-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-paper shadow"><Plus className="h-4 w-4" /></button>
            </div>
            <p className="mt-1.5 line-clamp-1 text-xs">{p.name}</p>
            <FlashPrice product={p} className="text-xs" />
          </li>
        ))}
      </ul>
    </section>
  );
}
