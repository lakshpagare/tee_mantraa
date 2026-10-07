"use client";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

/** Thin reading-progress bar + animated back-to-top button. */
export function ScrollUI() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(window.scrollY > 900);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <>
      <motion.div style={{ scaleX }} className="fixed inset-x-0 top-0 z-[90] h-[2px] origin-left bg-ink" aria-hidden />
      <AnimatePresence>
        {show && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => ((window as any).__lenis ? (window as any).__lenis.scrollTo(0) : window.scrollTo({ top: 0, behavior: "smooth" }))}
            aria-label="Back to top"
            className="fixed bottom-24 right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white shadow-sm transition-colors hover:bg-ink hover:text-white md:bottom-8 md:right-8"
          >
            <ArrowUp className="h-4 w-4" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
