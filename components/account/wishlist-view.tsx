"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Share2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Img } from "@/components/ui/img";
import { Price } from "@/components/ui/price";
import { ProductGridSkeleton } from "@/components/ui/skeleton";
import { useCart } from "@/store/cart";
import { useUI } from "@/store/ui";
import { useWishlist } from "@/store/wishlist";
import type { ProductDTO } from "@/types";

export function WishlistView() {
  const ids = useWishlist((s) => s.ids);
  const toggle = useWishlist((s) => s.toggle);
  const addItem = useCart((s) => s.addItem);
  const { openQuickView, setCartOpen } = useUI();
  const [products, setProducts] = useState<ProductDTO[] | null>(null);
  const key = ids.join(",");

  useEffect(() => {
    if (!ids.length) { setProducts([]); return; }
    const ctrl = new AbortController();
    fetch(`/api/products?ids=${key}`, { signal: ctrl.signal }).then((r) => r.json()).then((d) => setProducts(d.products || [])).catch(() => {});
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const [sharing, setSharing] = useState(false);
  const share = async () => {
    setSharing(true);
    try {
      const r = await fetch("/api/wishlist/share", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      const text = "Take a look at my wishlist";
      if (navigator.share) { try { await navigator.share({ title: "My wishlist", text, url: d.url }); return; } catch { /* user dismissed: fall through to copy */ } }
      await navigator.clipboard?.writeText(d.url);
      toast.success(`Link copied: ${d.url.replace(/^https?:\/\//, "")}`);
    } catch (e: any) { toast.error(e.message || "Could not create a link"); } finally { setSharing(false); }
  };

  const moveToCart = (p: ProductDTO) => {
    const avail = Math.max(0, p.stock - p.reserved);
    const simple = p.sizes.length <= 1 && p.colors.length <= 1;
    if (simple) {
      const r = addItem({ productId: p._id, slug: p.slug, name: p.name, image: p.images[0] || "", price: p.price, compareAtPrice: p.compareAtPrice, size: p.sizes[0] || "One Size", color: p.colors[0]?.name || "Default", maxQty: avail });
      if (r.added) { toggle(p._id); setCartOpen(true); } else toast.error("Already at the maximum quantity");
    } else {
      openQuickView(p, () => toggle(p._id));
      toast.message("Choose your size to move it to the bag");
    }
  };

  if (products === null) return <ProductGridSkeleton count={4} />;
  const visible = products.filter((p) => ids.includes(p._id));
  if (!visible.length) return <EmptyState icon={Heart} title="Your wishlist is empty" text="Tap the heart on anything you love and it will wait for you here." ctaText="Discover new arrivals" ctaHref="/shop?new=1" />;

  return (
    <>
    <div className="mb-8 flex flex-wrap items-center gap-3">
      <Button variant="outline" size="sm" onClick={share} loading={sharing}><Share2 className="h-4 w-4" />Share wishlist</Button>
      <a className="inline-flex h-9 items-center border border-line px-4 text-[11px] uppercase tracking-[0.2em] hover:border-ink" target="_blank" rel="noopener noreferrer" onClick={async (e) => {
        e.preventDefault();
        try { const r = await fetch("/api/wishlist/share", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids }) }); const d = await r.json(); if (!r.ok) throw new Error(d.error); window.open(`https://wa.me/?text=${encodeURIComponent(`Take a look at my wishlist: ${d.url}`)}`, "_blank", "noopener"); } catch (err: any) { toast.error(err.message || "Could not create a link"); }
      }} href="#">Send on WhatsApp</a>
    </div>
    <ul className="grid grid-cols-2 gap-x-3 gap-y-12 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4">
      <AnimatePresence>
        {visible.map((p) => (
          <motion.li key={p._id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.4 }}>
            <Link href={`/product/${p.slug}`} className="block"><Img src={p.images[0]} alt={p.name} ratio="4/5" sizes="(max-width:768px) 50vw, 25vw" /></Link>
            <h3 className="mt-3 text-sm">{p.name}</h3>
            <Price price={p.price} compareAt={p.compareAtPrice} className="text-sm" />
            <div className="mt-3 flex gap-2">
              <Button size="sm" className="flex-1" onClick={() => moveToCart(p)} disabled={p.stock - p.reserved <= 0}>{p.stock - p.reserved <= 0 ? "Sold out" : "Move to bag"}</Button>
              <Button size="sm" variant="outline" aria-label={`Remove ${p.name} from wishlist`} onClick={() => toggle(p._id)}>Remove</Button>
            </div>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
    </>
  );
}
