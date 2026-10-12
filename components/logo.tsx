import { cn } from "@/lib/utils";

/**
 * tee-mantraa mark: a lowercase "t" (the first letter of the name) in a fine circle, with a small dot —
 * a quiet nod to the "bindu" in a mantra. Drawn with currentColor so it follows the theme.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="24" cy="24" r="22.5" />
      <path d="M22 11 V31 Q22 35.5 27 35.5" />
      <path d="M15 19 H29" />
      <circle cx="33" cy="16" r="1.7" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Wordmark built from the name itself: "tee" in italic, a quiet hyphen, "mantraa" in a heavier upright. */
export function Wordmark({ name = "tee-mantraa", className }: { name?: string; className?: string }) {
  const i = name.indexOf("-");
  if (i < 1) return <span className={cn("font-display font-medium", className)}>{name}</span>;
  return (
    <span className={cn("font-display leading-none", className)}>
      <span className="font-normal italic">{name.slice(0, i)}</span>
      <span className="mx-[0.06em] font-light opacity-50">-</span>
      <span className="font-semibold tracking-[0.01em]">{name.slice(i + 1)}</span>
    </span>
  );
}

export function Logo({ name = "tee-mantraa", size = "md", className, showMark = true }: { name?: string; size?: "sm" | "md" | "lg"; className?: string; showMark?: boolean }) {
  const t = { sm: "text-xl", md: "text-[26px] md:text-[30px]", lg: "text-4xl" }[size];
  const m = { sm: "h-7 w-7", md: "h-8 w-8 md:h-9 md:w-9", lg: "h-11 w-11" }[size];
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {showMark && <LogoMark className={cn("shrink-0", m)} />}
      <Wordmark name={name} className={t} />
    </span>
  );
}
