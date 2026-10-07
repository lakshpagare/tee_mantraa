"use client";
import { useEffect, useRef } from "react";
import { Img } from "@/components/ui/img";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/motion";

/** Full-bleed banner. GSAP ScrollTrigger scrubs an image scale-down as it enters (skipped for reduced motion). */
export function CollectionBanner({ data }: { data: Record<string, string> }) {
  const wrap = useRef<HTMLElement>(null);
  const img = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let ctx: { revert: () => void } | undefined;
    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        gsap.fromTo(img.current, { scale: 1.35 }, { scale: 1, ease: "none", scrollTrigger: { trigger: wrap.current, start: "top bottom", end: "center center", scrub: true } });
        gsap.fromTo(wrap.current, { clipPath: "inset(8% 6% 8% 6%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: wrap.current, start: "top 90%", end: "top 20%", scrub: true } });
      }, wrap);
    })();
    return () => ctx?.revert();
  }, []);

  return (
    <section ref={wrap} className="relative h-[85svh] min-h-[520px] w-full overflow-hidden bg-ink text-white">
      <div ref={img} className="absolute inset-0"><Img src={data.image} alt={data.heading} sizes="100vw" className="h-full w-full" /></div>
      <div className="absolute inset-0 bg-black/30" />
      <div className="container-wide relative z-10 flex h-full flex-col items-center justify-center text-center">
        <Reveal><p className="eyebrow mb-5 !text-white/80">Featured Collection</p></Reveal>
        <Reveal delay={0.1}><h2 className="display text-6xl md:text-[9rem]">{data.heading}</h2></Reveal>
        <Reveal delay={0.2}><p className="mt-5 font-display text-2xl italic md:text-3xl">{data.subheading}</p></Reveal>
        <Reveal delay={0.3}><ButtonLink href={data.ctaHref} variant="light" size="lg" className="mt-9">{data.ctaText}</ButtonLink></Reveal>
      </div>
    </section>
  );
}
