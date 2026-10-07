"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";
import { Img } from "@/components/ui/img";
import { cn } from "@/lib/utils";

export function Gallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const scroller = useRef<HTMLDivElement>(null);
  const list = images.length ? images : ["/images/products/placeholder.svg"];

  return (
    <div className="lg:flex lg:gap-4">
      {/* Desktop thumbnails */}
      <ul className="hidden w-20 shrink-0 flex-col gap-3 lg:flex" aria-label="Product images">
        {list.map((src, i) => (
          <li key={src + i}>
            <button onClick={() => setActive(i)} aria-label={`Show image ${i + 1}`} aria-current={active === i} className={cn("block w-full border transition-colors", active === i ? "border-ink" : "border-transparent opacity-70 hover:opacity-100")}>
              <Img src={src} alt="" ratio="4/5" sizes="80px" />
            </button>
          </li>
        ))}
      </ul>

      {/* Desktop main with hover zoom */}
      <div
        className="relative hidden aspect-[4/5] flex-1 cursor-zoom-in overflow-hidden bg-soft lg:block"
        onMouseEnter={() => setZoom(true)} onMouseLeave={() => setZoom(false)}
        onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`); }}
      >
        <AnimatePresence mode="popLayout">
          <motion.div key={active} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.45 }}>
            <div className="h-full w-full transition-transform duration-300 ease-out" style={{ transform: zoom ? "scale(2)" : "scale(1)", transformOrigin: origin }}>
              <Img src={list[active]} alt={`${name} — view ${active + 1}`} priority sizes="(min-width:1024px) 45vw, 100vw" className="h-full w-full" />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Mobile swipe gallery */}
      <div className="lg:hidden">
        <div ref={scroller} className="no-scrollbar -mx-5 flex snap-x snap-mandatory overflow-x-auto"
          onScroll={(e) => { const el = e.currentTarget; setActive(Math.round(el.scrollLeft / el.clientWidth)); }}>
          {list.map((src, i) => (
            <div key={src + i} className="w-full shrink-0 snap-center"><Img src={src} alt={`${name} — view ${i + 1}`} ratio="4/5" priority={i === 0} sizes="100vw" /></div>
          ))}
        </div>
        {list.length > 1 && <div className="mt-3 flex justify-center gap-2">{list.map((_, i) => <span key={i} className={cn("h-1.5 rounded-full transition-all", i === active ? "w-6 bg-ink" : "w-1.5 bg-ink/25")} />)}</div>}
      </div>
    </div>
  );
}
