import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { Reveal } from "@/components/motion";
import type { ProductDTO } from "@/types";

export function ProductSection({ data, products, variant = "grid", href = "/shop" }: { data: Record<string, any>; products: ProductDTO[]; variant?: "grid" | "scroll"; href?: string }) {
  if (!products.length) return null;
  return (
    <section className={variant === "scroll" ? "section-y bg-soft" : "section-y"}>
      <div className="container-wide">
        <Reveal className="mb-10 text-center md:mb-14">
          <p className="eyebrow mb-3">{data.eyebrow}</p>
          <h2 className="display text-5xl md:text-7xl">{data.heading}</h2>
        </Reveal>

        {variant === "grid" ? (
          <ul className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4">
            {products.map((p, i) => (
              <li key={p._id}><Reveal delay={(i % 4) * 0.07} y={20}><ProductCard product={p} /></Reveal></li>
            ))}
          </ul>
        ) : (
          <ul className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 md:mx-0 md:grid md:grid-cols-4 md:gap-5 md:overflow-visible md:px-0">
            {products.slice(0, 8).map((p, i) => (
              <li key={p._id} className={`w-[62%] shrink-0 snap-start md:w-auto ${i >= 4 ? "md:hidden lg:hidden" : ""}`}>
                <ProductCard product={p} showRating />
              </li>
            ))}
          </ul>
        )}
        <div className="mt-12 text-center"><Link href={href} className="link-underline text-[11px] font-medium uppercase tracking-[0.25em]">Shop all</Link></div>
      </div>
    </section>
  );
}
