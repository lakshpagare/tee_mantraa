"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useWishlist } from "@/store/wishlist";
import { cn } from "@/lib/utils";

export function WishlistButton({ productId, className, label = false }: { productId: string; className?: string; label?: boolean }) {
  const active = useWishlist((s) => s.ids.includes(productId));
  const toggle = useWishlist((s) => s.toggle);
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const added = await toggle(productId);
        toast(added ? "Saved to wishlist" : "Removed from wishlist");
      }}
      className={cn("relative inline-flex items-center justify-center gap-2 transition-colors", className)}
    >
      <motion.span key={String(active)} initial={{ scale: 0.6 }} animate={{ scale: [0.6, 1.3, 1] }} transition={{ duration: 0.45 }} className="inline-flex">
        <Heart className={cn("h-[18px] w-[18px]", active && "fill-ink")} strokeWidth={1.5} />
      </motion.span>
      <AnimatePresence>
        {active && (
          <motion.span initial={{ scale: 0.5, opacity: 0.6 }} animate={{ scale: 2.2, opacity: 0 }} transition={{ duration: 0.6 }} className="pointer-events-none absolute inset-0 m-auto h-6 w-6 rounded-full border border-ink" />
        )}
      </AnimatePresence>
      {label && <span className="text-[11px] uppercase tracking-[0.2em]">{active ? "Saved" : "Wishlist"}</span>}
    </button>
  );
}
