"use client";
import { useEffect, useState } from "react";
import { ProductCard } from "@/components/product/product-card";
import { useRecent } from "@/store/recent";
import type { ProductDTO } from "@/types";

/** Shows recently viewed products; pass `track` on a product page to record the visit. */
export function RecentlyViewed({ track, title = "Recently viewed" }: { track?: string; title?: string }) {
  const ids = useRecent((s) => s.ids);
  const push = useRecent((s) => s.push);
  const [products, setProducts] = useState<ProductDTO[]>([]);

  useEffect(() => { if (track) push(track); }, [track, push]);
  const key = ids.filter((i) => i !== track).slice(0, 4).join(",");
  useEffect(() => {
    if (!key) { setProducts([]); return; }
    fetch(`/api/products?ids=${key}`).then((r) => r.json()).then((d) => setProducts(d.products || [])).catch(() => {});
  }, [key]);

  if (!products.length) return null;
  return (
    <section className="container-wide pb-10" aria-labelledby="recent-h">
      <h2 id="recent-h" className="display mb-10 text-4xl md:text-5xl">{title}</h2>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 md:gap-x-5">{products.map((p) => <li key={p._id}><ProductCard product={p} /></li>)}</ul>
    </section>
  );
}
