"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingBag, X } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Img } from "@/components/ui/img";
import { Skeleton } from "@/components/ui/skeleton";
import { CouponBox, TotalsTable } from "@/components/cart/order-summary";
import { FreeShippingBar } from "@/components/cart/free-shipping-bar";
import { QtyStepper } from "@/components/cart/qty-stepper";
import { useCartTotals } from "@/hooks/use-cart-totals";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { toast } from "sonner";
import { formatINR } from "@/lib/utils";

export function CartView() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { items, couponCode, error, applying, apply, remove, subtotal, totals } = useCartTotals();
  const { setQty, remove: removeItem } = useCart();
  const toggleWish = useWishlist((s) => s.toggle);

  if (!mounted) return <div className="container-wide py-16"><Skeleton className="mb-8 h-12 w-64" /><Skeleton className="h-64 w-full" /></div>;
  if (!items.length) return <EmptyState icon={ShoppingBag} title="Your bag is empty" text="Looks like you haven't added anything yet. Let's fix that." ctaText="Continue shopping" ctaHref="/shop" />;

  return (
    <div className="container-wide pb-10 pt-10 md:pt-16">
      <h1 className="display mb-10 text-5xl md:text-7xl">Your Bag</h1>
      <div className="grid gap-12 lg:grid-cols-[1fr_400px] lg:gap-20">
        <div>
          <div className="mb-8 border border-line p-5"><FreeShippingBar subtotal={subtotal} /></div>
          <ul className="divide-y divide-line border-y border-line">
            {items.map((i) => (
              <li key={i.key} className="flex gap-5 py-6">
                <Link href={`/product/${i.slug}`} className="w-24 shrink-0 md:w-32"><Img src={i.image} alt={i.name} ratio="4/5" sizes="128px" /></Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex justify-between gap-4">
                    <div><Link href={`/product/${i.slug}`} className="font-display text-xl">{i.name}</Link><p className="mt-1 text-xs text-muted">{i.color} · Size {i.size}</p></div>
                    <p className="text-sm">{formatINR(i.price * i.quantity)}</p>
                  </div>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
                    <QtyStepper value={i.quantity} max={i.maxQty} onChange={(n) => setQty(i.key, n)} />
                    <div className="flex gap-5 text-xs uppercase tracking-[0.16em]">
                      <button className="link-underline" onClick={async () => { if (!useWishlist.getState().has(i.productId)) await toggleWish(i.productId); removeItem(i.key); toast("Moved to wishlist"); }}>Move to wishlist</button>
                      <button className="link-underline flex items-center gap-1" onClick={() => removeItem(i.key)} aria-label={`Remove ${i.name}`}><X className="h-3.5 w-3.5" />Remove</button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <aside className="h-fit space-y-6 bg-soft p-6 md:p-8 lg:sticky lg:top-28" aria-label="Order summary">
          <h2 className="font-display text-3xl">Order summary</h2>
          <CouponBox code={couponCode} error={error} applying={applying} onApply={apply} onRemove={remove} />
          <TotalsTable t={totals} />
          <ButtonLink href="/checkout" size="lg" className="w-full">Proceed to checkout</ButtonLink>
          <p className="text-center text-xs text-muted">Secure checkout · 7-day returns</p>
        </aside>
      </div>
    </div>
  );
}
