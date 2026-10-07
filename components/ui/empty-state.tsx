import type { LucideIcon } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

export function EmptyState({ icon: Icon, title, text, ctaText, ctaHref }: { icon: LucideIcon; title: string; text: string; ctaText?: string; ctaHref?: string }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-20 text-center">
      <span className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-line"><Icon className="h-6 w-6" strokeWidth={1.25} /></span>
      <h2 className="font-display text-3xl">{title}</h2>
      <p className="mt-3 text-sm text-muted">{text}</p>
      {ctaText && ctaHref && <ButtonLink href={ctaHref} className="mt-8">{ctaText}</ButtonLink>}
    </div>
  );
}
