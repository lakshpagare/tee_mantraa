"use client";
import { motion } from "framer-motion";
import { useSite } from "@/hooks/use-site";
import { formatINR } from "@/lib/utils";

export function FreeShippingBar({ subtotal }: { subtotal: number }) {
  const { freeShippingThreshold: t } = useSite();
  const remaining = Math.max(0, t - subtotal);
  return (
    <div>
      <p className="mb-2 text-xs">
        {subtotal === 0 ? <>Free shipping on orders above {formatINR(t)}</> : remaining > 0 ? <>Add <strong>{formatINR(remaining)}</strong> more for <strong>FREE SHIPPING</strong></> : <strong>You've unlocked FREE SHIPPING</strong>}
      </p>
      <div className="h-1 w-full bg-line" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(100, Math.round((subtotal / t) * 100))}>
        <motion.div className="h-full bg-ink" initial={false} animate={{ width: `${Math.min(100, (subtotal / t) * 100)}%` }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} />
      </div>
    </div>
  );
}
