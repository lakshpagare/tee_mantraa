import { cn } from "@/lib/utils";

/**
 * tee-mantraa logo (gold crest + wordmark), cut out from the brand artwork with a transparent background.
 *  - "deep" gold reads well on light surfaces, "bright" gold on dark ones.
 *  - tone="auto" follows the light/dark theme; use tone="bright" over photos/dark heroes and tone="deep" on always-light areas (admin).
 */
export type LogoTone = "auto" | "bright" | "deep";

const FILES = {
  crest: { bright: "/brand/crest-gold.png", deep: "/brand/crest-deep.png", w: 721, h: 560 },
  wordmark: { bright: "/brand/wordmark-gold.png", deep: "/brand/wordmark-deep.png", w: 1100, h: 122 },
} as const;

function Art({ kind, tone, className, alt = "" }: { kind: keyof typeof FILES; tone: LogoTone; className?: string; alt?: string }) {
  const f = FILES[kind];
  const common = { width: f.w, height: f.h, decoding: "async" as const, draggable: false };
  if (tone === "deep") return <img src={f.deep} alt={alt} className={cn("w-auto select-none", className)} {...common} />;
  if (tone === "bright") return <img src={f.bright} alt={alt} className={cn("w-auto select-none", className)} {...common} />;
  return (
    <>
      <img src={f.deep} alt={alt} className={cn("w-auto select-none dark:hidden", className)} {...common} />
      <img src={f.bright} alt="" aria-hidden className={cn("hidden w-auto select-none dark:block", className)} {...common} />
    </>
  );
}

/** Crest only (404 page, loading screens, favicons in UI). */
export function CrestImage({ tone = "auto", className, alt = "" }: { tone?: LogoTone; className?: string; alt?: string }) {
  return <Art kind="crest" tone={tone} className={className} alt={alt} />;
}

const SIZES = {
  sm: { crest: "h-7", word: "h-[11px]" },
  md: { crest: "h-[30px] sm:h-9 lg:h-10", word: "h-3 sm:h-4 lg:h-[18px]" },
  lg: { crest: "h-14", word: "h-6" },
} as const;

export function Logo({ name = "tee-mantraa", size = "md", tone = "auto", showWordmark = true, className }: { name?: string; size?: "sm" | "md" | "lg"; tone?: LogoTone; showWordmark?: boolean; className?: string }) {
  const s = SIZES[size];
  return (
    <span className={cn("inline-flex items-center gap-2 sm:gap-3", className)}>
      <Art kind="crest" tone={tone} className={s.crest} alt={showWordmark ? "" : name} />
      {showWordmark && <Art kind="wordmark" tone={tone} className={s.word} alt={name} />}
    </span>
  );
}
