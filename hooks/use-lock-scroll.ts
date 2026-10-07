"use client";
import { useEffect } from "react";

/** Locks page scroll (including Lenis) while an overlay is open. */
export function useLockScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const lenis = (window as any).__lenis;
    lenis?.stop();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      lenis?.start();
    };
  }, [locked]);
}
