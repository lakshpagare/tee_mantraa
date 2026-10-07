"use client";
import { Check, Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { WishlistButton } from "@/components/product/wishlist-button";
import { useCart } from "@/store/cart";
import { useUI } from "@/store/ui";
import { cn } from "@/lib/utils";
import type { ProductDTO } from "@/types";

const SIZE_GUIDE = [
  ["XS", "34", "26"], ["S", "36", "28"], ["M", "38", "30"], ["L", "40", "32"], ["XL", "42", "34"], ["XXL", "44", "36"],
];

export function SizeGuideModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Size guide" className="max-w-lg">
      <div className="p-8">
        <h3 className="font-display text-3xl">Size guide</h3>
        <p className="mt-2 text-sm text-muted">Body measurements in inches. If you are between sizes, size up for a relaxed fit.</p>
        <table className="mt-6 w-full text-left text-sm">
          <thead><tr className="border-b border-line text-[11px] uppercase tracking-[0.18em] text-muted"><th className="py-2">Size</th><th>Chest</th><th>Waist</th></tr></thead>
          <tbody>{SIZE_GUIDE.map((r) => <tr key={r[0]} className="border-b border-line"><td className="py-3 font-medium">{r[0]}</td><td>{r[1]}"</td><td>{r[2]}"</td></tr>)}</tbody>
        </table>
        <p className="mt-4 text-xs text-muted">Jeans &amp; trousers are sized by waist (28–36).</p>
      </div>
    </Modal>
  );
}

export function VariantPicker({ product, compact = false, onAdded }: { product: ProductDTO; compact?: boolean; onAdded?: () => void }) {
  const router = useRouter();
  const addItem = useCart((s) => s.addItem);
  const setCartOpen = useUI((s) => s.setCartOpen);
  const [size, setSize] = useState("");
  const [color, setColor] = useState(product.colors[0]?.name || "");
  const [qty, setQty] = useState(1);
  const [guide, setGuide] = useState(false);
  const [busy, setBusy] = useState(false);

  const available = Math.max(0, product.stock - product.reserved);
  const soldOut = available <= 0;
  const low = !soldOut && available <= Math.max(product.lowStockThreshold, 5);
  const needsSize = product.sizes.length > 0 && product.sizes[0] !== "One Size";

  const add = (): boolean => {
    if (needsSize && !size) {
      toast.error("Please select a size");
      return false;
    }
    const res = addItem(
      {
        productId: product._id, slug: product.slug, name: product.name, image: product.images[0] || "", price: product.price,
        compareAtPrice: product.compareAtPrice, size: size || product.sizes[0] || "One Size", color: color || "Default", maxQty: available,
      },
      qty
    );
    if (res.added === 0) {
      toast.error("You already have the maximum available quantity in your bag");
      return false;
    }
    if (res.capped) toast.message(`Only ${available} available — quantity adjusted`);
    onAdded?.();
    return true;
  };

  return (
    <div className="space-y-6">
      {product.colors.length > 0 && (
        <div>
          <p className="mb-3 text-[11px] uppercase tracking-[0.2em]"><span className="text-muted">Colour:</span> {color}</p>
          <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Colour">
            {product.colors.map((c) => (
              <button key={c.name} type="button" role="radio" aria-checked={color === c.name} aria-label={c.name} onClick={() => setColor(c.name)}
                className={cn("relative h-8 w-8 rounded-full border border-line transition-transform hover:scale-110", color === c.name && "ring-1 ring-ink ring-offset-2")}
                style={{ backgroundColor: c.hex }}>
                {color === c.name && <Check className="absolute inset-0 m-auto h-3.5 w-3.5 text-white mix-blend-difference" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {needsSize && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-[0.2em]"><span className="text-muted">Size:</span> {size || "Select"}</p>
            <button type="button" onClick={() => setGuide(true)} className="link-underline text-[11px] uppercase tracking-[0.2em]">Size guide</button>
          </div>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Size">
            {product.sizes.map((s) => (
              <button key={s} type="button" role="radio" aria-checked={size === s} onClick={() => setSize(s)}
                className={cn("h-11 min-w-[3rem] border px-3 text-xs transition-colors", size === s ? "border-ink bg-ink text-white" : "border-line hover:border-ink")}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {low && <p className="text-xs font-medium text-red-700">Only {available} left</p>}

      {!compact && !soldOut && (
        <div className="flex items-center gap-4">
          <span className="text-[11px] uppercase tracking-[0.2em] text-muted">Quantity</span>
          <div className="flex items-center border border-line">
            <button type="button" aria-label="Decrease quantity" className="h-11 w-11 hover:bg-soft" onClick={() => setQty((q) => Math.max(1, q - 1))}><Minus className="mx-auto h-3.5 w-3.5" /></button>
            <span className="w-10 text-center text-sm" aria-live="polite">{qty}</span>
            <button type="button" aria-label="Increase quantity" className="h-11 w-11 hover:bg-soft" onClick={() => setQty((q) => Math.min(Math.min(10, available), q + 1))}><Plus className="mx-auto h-3.5 w-3.5" /></button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          <Button
            className="flex-1"
            size="lg"
            disabled={soldOut}
            loading={busy}
            onClick={() => {
              if (add()) {
                setBusy(true);
                setTimeout(() => setBusy(false), 500);
                setCartOpen(true);
              }
            }}
          >
            {soldOut ? "Sold out" : "Add to cart"}
          </Button>
          {!compact && <WishlistButton productId={product._id} className="h-14 w-14 shrink-0 border border-line hover:border-ink" />}
        </div>
        {!compact && (
          <Button variant="outline" size="lg" disabled={soldOut} onClick={() => { if (add()) router.push("/checkout"); }}>
            Buy now
          </Button>
        )}
      </div>
      <SizeGuideModal open={guide} onClose={() => setGuide(false)} />
    </div>
  );
}
