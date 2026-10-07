"use client";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useRef } from "react";
import { Img } from "@/components/ui/img";
import { ButtonLink } from "@/components/ui/button";
import { Magnetic } from "@/components/motion";

const EASE = [0.22, 1, 0.36, 1] as const;

export function Hero({ data }: { data: Record<string, string> }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);
  const fade = (delay: number) => ({ initial: reduce ? false : { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0 }, transition: { duration: 1, delay, ease: EASE } });

  return (
    <section ref={ref} className="relative h-[100svh] min-h-[620px] w-full overflow-hidden bg-ink text-white">
      <motion.div
        className="absolute inset-0"
        style={reduce ? undefined : { y }}
        initial={reduce ? false : { clipPath: "inset(0 0 100% 0)" }}
        animate={{ clipPath: "inset(0 0 0% 0)" }}
        transition={{ duration: 1.4, ease: [0.76, 0, 0.24, 1] }}
      >
        <motion.div className="absolute inset-0 scale-110" initial={reduce ? false : { scale: 1.3 }} animate={{ scale: 1.1 }} transition={{ duration: 2.4, ease: EASE }}>
          <Img src={data.image} alt={data.heading || "Hero"} priority sizes="100vw" className="h-full w-full" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/30" />
      </motion.div>

      <motion.div style={reduce ? undefined : { y: textY }} className="container-wide relative z-10 flex h-full flex-col justify-end pb-24 md:pb-28">
        <motion.p {...fade(1.0)} className="mb-4 text-[11px] font-medium uppercase tracking-[0.35em]">{data.eyebrow}</motion.p>
        <motion.h1 {...fade(1.15)} className="display max-w-5xl text-[clamp(3rem,9vw,9rem)]">{data.heading}</motion.h1>
        <motion.p {...fade(1.3)} className="mt-5 font-display text-2xl italic md:text-3xl">{data.subheading}</motion.p>
        <motion.div {...fade(1.45)} className="mt-9 flex flex-wrap gap-4">
          <Magnetic><ButtonLink href={data.primaryHref} variant="light" size="lg">{data.primaryText}</ButtonLink></Magnetic>
          <Magnetic><ButtonLink href={data.secondaryHref} variant="outline-light" size="lg">{data.secondaryText}</ButtonLink></Magnetic>
        </motion.div>
      </motion.div>

      <motion.div {...fade(2)} className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 md:block" aria-hidden>
        <ChevronDown className="h-5 w-5 animate-bounce opacity-70" />
      </motion.div>
    </section>
  );
}
