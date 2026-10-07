"use client";
import Lenis from "lenis";
import { useEffect } from "react";

/** Lenis smooth scrolling, integrated with GSAP ScrollTrigger. Disabled for reduced-motion users. */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    (window as any).__lenis = lenis;
    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    let off: (() => void) | undefined;
    import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
      const onScroll = () => ScrollTrigger.update();
      lenis.on("scroll", onScroll);
      off = () => lenis.off("scroll", onScroll);
    });
    return () => {
      cancelAnimationFrame(raf);
      off?.();
      lenis.destroy();
      (window as any).__lenis = undefined;
    };
  }, []);
  return null;
}
