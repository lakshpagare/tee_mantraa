"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { GitCompare, X } from "lucide-react";
import { toast } from "sonner";
import { MAX_COMPARE, useCompare } from "@/store/compare";
import { cn } from "@/lib/utils";

export function CompareToggle({ productId, className }: { productId: string; className?: string }) {
  const active = useCompare((s) => s.ids.includes(productId));
  const toggle = useCompare((s) => s.toggle);
  return (
    <button type="button" aria-pressed={active} onClick={() => {
      const r = toggle(productId);
      if (r === "full") toast.error(`You can compare up to ${MAX_COMPARE} products`);
      else toast(r === "added" ? "Added to compare" : "Removed from compare");
    }} className={cn("inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] transition-opacity hover:opacity-60", className)}>
      <GitCompare className="h-4 w-4" strokeWidth={1.5} />{active ? "In compare" : "Compare"}
    </button>
  );
}

export function CompareBar() {
  const ids = useCompare((s) => s.ids);
  const clear = useCompare((s) => s.clear);
  return (
    <AnimatePresence>
      {ids.length > 0 && (
        <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} className="fixed bottom-20 left-1/2 z-40 flex -translate-x-1/2 items-center gap-4 border border-line bg-paper px-5 py-3 shadow-lg lg:bottom-6">
          <span className="text-xs">{ids.length} selected</span>
          <Link href="/compare" className="bg-ink px-4 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-paper">Compare</Link>
          <button onClick={clear} aria-label="Clear compare list"><X className="h-4 w-4" /></button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
