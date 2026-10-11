"use client";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Light/dark switch. Remembers the choice; defaults to the visitor's system preference. */
export function ThemeToggle({ className, label = false }: { className?: string; label?: boolean }) {
  const [dark, setDark] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => { setDark(document.documentElement.classList.contains("dark")); setReady(true); }, []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try { localStorage.setItem("tm-theme", next ? "dark" : "light"); } catch {}
  };
  return (
    <button type="button" onClick={toggle} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} aria-pressed={ready ? dark : undefined} className={cn("inline-flex items-center justify-center gap-2 transition-opacity hover:opacity-60", className)}>
      {ready && dark ? <Sun className="h-[18px] w-[18px]" strokeWidth={1.5} /> : <Moon className="h-[18px] w-[18px]" strokeWidth={1.5} />}
      {label && <span className="text-[11px] uppercase tracking-[0.22em]">{ready && dark ? "Light mode" : "Dark mode"}</span>}
    </button>
  );
}
