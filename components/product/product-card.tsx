"use client";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Img } from "@/components/ui/img";
import { Price } from "@/components/ui/price";
import { Stars } from "@/components/ui/stars";
import { WishlistButton } from "@/components/product/wishlist-button";
import { useUI } from "@/store/ui";
import { discountPct } from "@/lib/utils";
import type { ProductDTO } from "@/types";

export const categoryName = (p: ProductDTO) => (typeof p.category === "object" && p.category ? p.category.name : "");

export function ProductCard({ product, showRating = false, priority = false }: { product: ProductDTO; showRating?: boolean; priority?: boolean }) {
  const openQuickView = useUI((s) => s.openQuickView);
  const pct = discountPct(product.price, product.compareAtPrice);
  const soldOut = product.stock - product.reserved <= 0;
  const [first, second] = product.images;

  return (
    <article className="group">
      <div className="relative aspect-[4/5] overflow-hidden bg-soft">
        <Link href={`/product/${product.slug}`} aria-label={product.name} className="absolute inset-0 z-0 block">
          <Img src={first} alt={product.name} priority={priority} sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="absolute inset-0" imgClassName="transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]" />
          {second && (
            <Img src={second} alt="" sizes="(max-width: 768px) 50vw, 25vw" className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
              imgClassName="transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]" />
          )}
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
          {product.bestSeller && <span className="bg-ink px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-white">Best Seller</span>}
          {!product.bestSeller && product.newArrival && <span className="bg-white px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em]">New</span>}
          {pct > 0 && <span className="bg-white px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-red-700">-{pct}%</span>}
        </div>

        <WishlistButton productId={product._id} className="absolute right-2 top-2 z-20 h-9 w-9 rounded-full bg-white/80 backdrop-blur hover:bg-white" />

        {soldOut ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-white/80 py-3 text-center text-[11px] font-medium uppercase tracking-[0.2em]">Sold out</div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => openQuickView(product)}
              aria-label={`Quick add ${product.name}`}
              className="absolute inset-x-3 bottom-3 z-20 hidden translate-y-[130%] bg-white/95 py-3 text-[11px] font-medium uppercase tracking-[0.2em] backdrop-blur transition-all duration-500 hover:bg-ink hover:text-white focus-visible:translate-y-0 group-hover:translate-y-0 lg:block"
            >
              Quick add
            </button>
            <button type="button" onClick={() => openQuickView(product)} aria-label={`Quick add ${product.name}`}
              className="absolute bottom-2 right-2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow lg:hidden">
              <Plus className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      <div className="mt-4 space-y-1">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted">{categoryName(product)}</p>
        <h3 className="text-sm leading-snug">
          <Link href={`/product/${product.slug}`} className="link-underline">{product.name}</Link>
        </h3>
        <Price price={product.price} compareAt={product.compareAtPrice} className="text-sm" />
        {showRating && product.reviewCount > 0 && (
          <div className="flex items-center gap-2 pt-0.5">
            <Stars value={product.rating} size={12} />
            <span className="text-xs text-muted">({product.reviewCount})</span>
          </div>
        )}
      </div>
    </article>
  );
}
