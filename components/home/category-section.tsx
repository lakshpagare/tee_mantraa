import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Img } from "@/components/ui/img";
import { Reveal, ImageReveal } from "@/components/motion";
import type { CategoryDTO } from "@/types";

const href = (c: CategoryDTO) => (c.slug === "new-arrivals" ? "/shop?new=1" : `/shop?category=${c.slug}`);

export function CategorySection({ data, categories }: { data: Record<string, any>; categories: CategoryDTO[] }) {
  if (!categories.length) return null;
  return (
    <section className="section-y">
      <div className="container-wide">
        <Reveal className="mb-10 flex items-end justify-between md:mb-14">
          <div>
            <p className="eyebrow mb-3">{data.eyebrow}</p>
            <h2 className="display text-5xl md:text-7xl">{data.heading}</h2>
          </div>
          <Link href="/shop" className="link-underline hidden text-[11px] uppercase tracking-[0.22em] md:block">View all</Link>
        </Reveal>

        {/* Mobile: swipe row. Desktop: editorial grid. */}
        <ul className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 md:mx-0 md:grid md:grid-cols-4 md:gap-5 md:overflow-visible md:px-0">
          {categories.map((c, i) => (
            <li key={c._id} className={`w-[72%] shrink-0 snap-start md:w-auto ${i === 0 ? "md:col-span-2 md:row-span-2" : ""}`}>
              <Link href={href(c)} className="group relative block h-full overflow-hidden">
                <ImageReveal delay={(i % 4) * 0.08}>
                  <Img src={c.image || ""} alt={c.name} ratio={i === 0 ? "4/5" : "4/5"} sizes="(max-width:768px) 72vw, (max-width:1200px) 50vw, 33vw" imgClassName="transition-transform duration-[1200ms] ease-out group-hover:scale-[1.07]" />
                </ImageReveal>
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 text-white md:p-6">
                  <div className="transition-transform duration-500 group-hover:-translate-y-1">
                    <h3 className={`font-display font-light ${i === 0 ? "text-5xl" : "text-3xl"}`}>{c.name}</h3>
                    <span className="mt-1 inline-block text-[10px] uppercase tracking-[0.25em] opacity-90">Explore</span>
                  </div>
                  <ArrowUpRight className="h-6 w-6 transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1" strokeWidth={1.25} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
