import type { Metadata } from "next";
import Link from "next/link";
import { Img } from "@/components/ui/img";
import { ProductCard } from "@/components/product/product-card";
import { ImageReveal, Reveal } from "@/components/motion";
import { getLookbook } from "@/lib/data";

export const metadata: Metadata = { title: "Lookbook", description: "Editorial looks from every collection — shop the pieces.", alternates: { canonical: "/lookbook" } };

export default async function LookbookPage() {
  const chapters = await getLookbook();
  return (
    <div className="pb-10 pt-10 md:pt-16">
      <div className="container-wide mb-14"><p className="eyebrow mb-3">Lookbook</p><h1 className="display text-5xl md:text-8xl">Looks we love</h1></div>
      {chapters.map((c, i) => (
        <section key={c._id} className="mb-20 md:mb-32">
          <div className={`container-wide grid items-end gap-8 lg:grid-cols-12 ${i % 2 ? "" : ""}`}>
            <div className={`lg:col-span-7 ${i % 2 ? "lg:order-2" : ""}`}><ImageReveal><Img src={c.image || ""} alt={c.name} ratio="4/3" sizes="(max-width:1024px) 100vw, 58vw" /></ImageReveal></div>
            <Reveal className={`lg:col-span-5 ${i % 2 ? "lg:order-1" : ""}`}>
              <p className="eyebrow mb-3">Chapter {String(i + 1).padStart(2, "0")}</p>
              <h2 className="display text-5xl md:text-6xl">{c.name}</h2>
              <p className="mt-4 max-w-sm text-sm text-muted">{c.description}</p>
              <Link href={`/collections/${c.slug}`} className="link-underline mt-6 inline-block text-[11px] font-medium uppercase tracking-[0.22em]">Shop the collection</Link>
            </Reveal>
          </div>
          {c.products.length > 0 && (
            <ul className="container-wide mt-10 grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 md:gap-x-5">{c.products.map((p) => <li key={p._id}><ProductCard product={p} /></li>)}</ul>
          )}
        </section>
      ))}
    </div>
  );
}
