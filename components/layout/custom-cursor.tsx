"use client";
import { useEffect, useRef } from "react";

/** Subtle ring that follows the pointer and grows over interactive elements. Desktop mouse only; skipped for reduced motion. */
export function CustomCursor() {
  const ring = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ring.current;
    if (!el) return;
    let x = -100, y = -100, tx = -100, ty = -100, raf = 0, big = false;
    const move = (e: MouseEvent) => {
      tx = e.clientX; ty = e.clientY;
      el.style.opacity = "1";
      const t = e.target as HTMLElement | null;
      big = !!t?.closest("a, button, [role=button], input, select, textarea, label");
    };
    const leave = () => { el.style.opacity = "0"; };
    const loop = () => {
      x += (tx - x) * 0.18; y += (ty - y) * 0.18;
      el.style.transform = `translate3d(${x - 16}px, ${y - 16}px, 0) scale(${big ? 1.9 : 1})`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", move, { passive: true });
    document.documentElement.addEventListener("mouseleave", leave);
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("mousemove", move); document.documentElement.removeEventListener("mouseleave", leave); };
  }, []);
  return <div ref={ring} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[95] hidden h-8 w-8 rounded-full border border-white opacity-0 mix-blend-difference transition-[opacity] duration-300 lg:block" />;
}
