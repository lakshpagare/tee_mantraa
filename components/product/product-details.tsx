"use client";
import { Stars } from "@/components/ui/stars";
import { Price } from "@/components/ui/price";
import { Accordion } from "@/components/ui/accordion";
import { VariantPicker } from "@/components/product/variant-picker";
import { useSite } from "@/hooks/use-site";
import { formatINR } from "@/lib/utils";
import type { ProductDTO } from "@/types";

export function ProductDetails({ product, category }: { product: ProductDTO; category: string }) {
  const { freeShippingThreshold } = useSite();
  return (
    <div className="lg:sticky lg:top-28">
      <p className="eyebrow">{category}</p>
      <h1 className="mt-2 font-display text-4xl font-light leading-tight md:text-5xl">{product.name}</h1>
      <div className="mt-4 flex items-center gap-3">
        {product.reviewCount > 0 ? (
          <a href="#reviews" className="flex items-center gap-2"><Stars value={product.rating} /><span className="text-xs text-muted underline">{product.rating.toFixed(1)} · {product.reviewCount} reviews</span></a>
        ) : <span className="text-xs text-muted">No reviews yet</span>}
      </div>
      <Price price={product.price} compareAt={product.compareAtPrice} showBadge className="mt-5 text-xl" />
      <p className="mt-1 text-xs text-muted">Inclusive of all taxes</p>
      {product.shortDescription && <p className="mt-6 text-sm leading-relaxed text-muted">{product.shortDescription}</p>}

      <div className="mt-8"><VariantPicker product={product} /></div>

      <div className="mt-10">
        <Accordion
          items={[
            { title: "Description", content: <p className="whitespace-pre-line">{product.description || product.shortDescription}</p> },
            { title: "Materials", content: <p>{product.material || "Premium fabrics selected for comfort and durability."} Machine wash cold with similar colours. Do not bleach.</p> },
            { title: "Size & Fit", content: <p>{product.fit || "True to size."} Check the size guide above the size selector for measurements. Between sizes? Size up for a relaxed fit.</p> },
            { title: "Shipping", content: <p>Free standard shipping on orders above {formatINR(freeShippingThreshold)}. Orders are dispatched within 24–48 hours and delivered in 3–7 business days. Express delivery available at checkout.</p> },
            { title: "Returns", content: <p>Easy 7-day returns on unworn items with original tags. Refunds are processed within 5–7 business days of the return reaching us.</p> },
          ]}
        />
      </div>
    </div>
  );
}
