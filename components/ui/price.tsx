import { cn, discountPct, formatINR } from "@/lib/utils";

export function Price({ price, compareAt, className, showBadge = false }: { price: number; compareAt?: number; className?: string; showBadge?: boolean }) {
  const pct = discountPct(price, compareAt);
  return (
    <span className={cn("inline-flex flex-wrap items-baseline gap-x-2", className)}>
      <span className="font-medium">{formatINR(price)}</span>
      {pct > 0 && (
        <>
          <s className="text-muted">{formatINR(compareAt!)}</s>
          {showBadge && <span className="text-xs font-medium text-red-700">{pct}% OFF</span>}
        </>
      )}
    </span>
  );
}
