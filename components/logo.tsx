import { cn } from "@/lib/utils";

/** tee-mantraa mark: a tee silhouette inside a fine circle, with a small dot (a quiet nod to "mantra"). Uses currentColor. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="24" cy="24" r="22.5" />
      <path d="M16.5 14.5 L11 18.5 L13.8 24.2 L18 22 V34 H30 V22 L34.2 24.2 L37 18.5 L31.5 14.5 Q24 19.5 16.5 14.5Z" />
      <circle cx="24" cy="27" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Logo({ name = "tee-mantraa", size = "md", className, showMark = true }: { name?: string; size?: "sm" | "md" | "lg"; className?: string; showMark?: boolean }) {
  const t = { sm: "text-xl", md: "text-[26px] md:text-[30px]", lg: "text-4xl" }[size];
  const m = { sm: "h-7 w-7", md: "h-8 w-8 md:h-9 md:w-9", lg: "h-11 w-11" }[size];
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {showMark && <LogoMark className={cn("shrink-0", m)} />}
      <span className={cn("font-display font-medium leading-none tracking-[0.02em]", t)}>{name}</span>
    </span>
  );
}
