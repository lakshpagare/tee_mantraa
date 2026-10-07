import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/motion";

export function PromoBanner({ data }: { data: Record<string, string> }) {
  return (
    <section className="bg-ink py-20 text-center text-white md:py-28">
      <div className="container-wide">
        <Reveal><h2 className="display text-6xl md:text-[8rem]">{data.heading}</h2></Reveal>
        <Reveal delay={0.1}><p className="mt-4 font-display text-2xl italic text-white/80">{data.subheading}</p></Reveal>
        <Reveal delay={0.2}><ButtonLink href={data.ctaHref} variant="light" size="lg" className="mt-9">{data.ctaText}</ButtonLink></Reveal>
      </div>
    </section>
  );
}
