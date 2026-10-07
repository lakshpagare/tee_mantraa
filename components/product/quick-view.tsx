"use client";
import Link from "next/link";
import { Img } from "@/components/ui/img";
import { Modal } from "@/components/ui/modal";
import { Price } from "@/components/ui/price";
import { Stars } from "@/components/ui/stars";
import { VariantPicker } from "@/components/product/variant-picker";
import { useUI } from "@/store/ui";

export function QuickView() {
  const product = useUI((s) => s.quickView);
  const close = useUI((s) => s.closeQuickView);
  const onAdded = useUI((s) => s.quickViewOnAdded);
  return (
    <Modal open={!!product} onClose={close} title="Quick view" className="max-w-4xl">
      {product && (
        <div className="grid md:grid-cols-2">
          <Img src={product.images[0]} alt={product.name} ratio="4/5" sizes="(max-width:768px) 100vw, 450px" className="md:h-full" />
          <div className="flex flex-col p-6 md:p-10">
            <h2 className="pr-8 font-display text-3xl leading-tight">{product.name}</h2>
            {product.reviewCount > 0 && (
              <div className="mt-2 flex items-center gap-2"><Stars value={product.rating} /><span className="text-xs text-muted">{product.rating.toFixed(1)} ({product.reviewCount})</span></div>
            )}
            <Price price={product.price} compareAt={product.compareAtPrice} showBadge className="mt-3 text-lg" />
            {product.shortDescription && <p className="mt-4 text-sm text-muted">{product.shortDescription}</p>}
            <div className="mt-6"><VariantPicker product={product} compact onAdded={() => { onAdded?.(); close(); }} /></div>
            <Link href={`/product/${product.slug}`} onClick={close} className="link-underline mt-6 self-start text-[11px] uppercase tracking-[0.2em]">View full product</Link>
          </div>
        </div>
      )}
    </Modal>
  );
}
