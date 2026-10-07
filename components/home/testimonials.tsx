"use client";
import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Stars } from "@/components/ui/stars";
import type { TestimonialDTO } from "@/types";

export function Testimonials({ data, items }: { data: Record<string, string>; items: TestimonialDTO[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = items.length;
  useEffect(() => {
    if (paused || n < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((x) => (x + 1) % n), 6500);
    return () => clearInterval(t);
  }, [paused, n]);
  if (!n) return null;
  const t = items[i];
  return (
    <section className="section-y bg-soft" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} aria-roledescription="carousel" aria-label="Customer reviews">
      <div className="container-wide max-w-4xl text-center">
        <p className="eyebrow mb-3">{data.eyebrow}</p>
        <h2 className="display mb-12 text-4xl md:text-6xl">{data.heading}</h2>
        <div className="relative min-h-[260px]" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.figure key={t._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.5 }}>
              <Stars value={t.rating} size={16} className="justify-center" />
              <blockquote className="mx-auto mt-6 max-w-2xl font-display text-2xl font-light italic leading-snug md:text-4xl">“{t.text}”</blockquote>
              <figcaption className="mt-8 text-sm">
                <span className="font-medium">{t.name}</span>
                {t.product && <span className="text-muted"> · {t.product}</span>}
                {t.verified && <span className="mt-1 flex items-center justify-center gap-1 text-[11px] uppercase tracking-[0.16em] text-muted"><BadgeCheck className="h-3.5 w-3.5" />Verified purchase</span>}
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>
        {n > 1 && (
          <div className="mt-6 flex items-center justify-center gap-5">
            <button aria-label="Previous review" onClick={() => setI((i - 1 + n) % n)} className="p-2 hover:opacity-60"><ChevronLeft className="h-5 w-5" /></button>
            <div className="flex gap-2">{items.map((x, k) => <button key={x._id} aria-label={`Go to review ${k + 1}`} aria-current={k === i} onClick={() => setI(k)} className={`h-1.5 rounded-full transition-all ${k === i ? "w-6 bg-ink" : "w-1.5 bg-ink/25"}`} />)}</div>
            <button aria-label="Next review" onClick={() => setI((i + 1) % n)} className="p-2 hover:opacity-60"><ChevronRight className="h-5 w-5" /></button>
          </div>
        )}
      </div>
    </section>
  );
}
