import { Img } from "@/components/ui/img";
import { ButtonLink } from "@/components/ui/button";
import { Reveal, ImageReveal, Parallax, TextReveal } from "@/components/motion";

export function BrandStory({ data }: { data: Record<string, string> }) {
  return (
    <section className="section-y">
      <div className="container-wide grid items-center gap-12 lg:grid-cols-2 lg:gap-24">
        <ImageReveal direction="left"><Parallax className="aspect-[4/5]" amount={5}><Img src={data.image} alt="Our story" sizes="(max-width:1024px) 100vw, 50vw" className="h-full w-full" /></Parallax></ImageReveal>
        <div>
          <Reveal><p className="eyebrow mb-5">{data.eyebrow}</p></Reveal>
          <TextReveal text={data.heading} className="display text-5xl md:text-7xl" />
          <Reveal delay={0.2}><p className="mt-7 max-w-md font-display text-2xl font-light leading-snug text-muted">{data.text}</p></Reveal>
          <Reveal delay={0.3}><ButtonLink href={data.ctaHref} variant="outline" size="lg" className="mt-10">{data.ctaText}</ButtonLink></Reveal>
        </div>
      </div>
    </section>
  );
}
