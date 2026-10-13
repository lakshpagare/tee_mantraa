"use client";
import Link from "next/link";
import { GitCompare } from "lucide-react";
import { useEffect, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Img } from "@/components/ui/img";
import { Price } from "@/components/ui/price";
import { Stars } from "@/components/ui/stars";
import { Skeleton } from "@/components/ui/skeleton";
import { categoryName } from "@/lib/product-utils";
import { useCompare } from "@/store/compare";
import type { ProductDTO } from "@/types";

export function CompareView() {
  const ids = useCompare((s) => s.ids);
  const toggle = useCompare((s) => s.toggle);
  const [products, setProducts] = useState<ProductDTO[] | null>(null);
  const key = ids.join(",");
  useEffect(() => {
    if (!key) { setProducts([]); return; }
    fetch(`/api/products?ids=${key}`).then((r) => r.json()).then((d) => setProducts(d.products || [])).catch(() => setProducts([]));
  }, [key]);

  if (products === null) return <Skeleton className="h-96 w-full" />;
  const list = products.filter((p) => ids.includes(p._id));
  if (!list.length) return <EmptyState icon={GitCompare} title="Nothing to compare yet" text="Tap “Compare” on up to three products to see them side by side." ctaText="Browse products" ctaHref="/shop" />;

  const rows: [string, (p: ProductDTO) => React.ReactNode][] = [
    ["Category", (p) => categoryName(p) || "—"],
    ["Price", (p) => <Price price={p.price} compareAt={p.compareAtPrice} />],
    ["Rating", (p) => (p.reviewCount ? <span className="flex items-center gap-2"><Stars value={p.rating} size={12} />({p.reviewCount})</span> : "No reviews")],
    ["Material", (p) => p.material || "—"],
    ["Fit", (p) => p.fit || "—"],
    ["Colours", (p) => p.colors.map((c) => c.name).join(", ") || "—"],
    ["Sizes", (p) => p.sizes.join(", ") || "—"],
    ["Availability", (p) => (p.stock - p.reserved > 0 ? "In stock" : "Sold out")],
  ];
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead>
          <tr>
            <th className="w-32 p-3" />
            {list.map((p) => (
              <th key={p._id} className="p-3 align-top font-normal">
                <Link href={`/product/${p.slug}`} className="block"><Img src={p.images[0]} alt={p.name} ratio="4/5" sizes="260px" /></Link>
                <p className="mt-3 font-display text-xl">{p.name}</p>
                <button onClick={() => toggle(p._id)} className="link-underline mt-1 text-[11px] uppercase tracking-[0.18em] text-muted">Remove</button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, render]) => (
            <tr key={label} className="border-t border-line">
              <th scope="row" className="p-3 text-[11px] font-medium uppercase tracking-[0.18em] text-muted">{label}</th>
              {list.map((p) => <td key={p._id} className="p-3">{render(p)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
