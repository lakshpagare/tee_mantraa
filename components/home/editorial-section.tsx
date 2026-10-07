import { Img } from "@/components/ui/img";
import { ButtonLink } from "@/components/ui/button";
import { Reveal, ImageReveal, Parallax, TextReveal } from "@/components/motion";

export function EditorialSection({ data }: { data: Record<string, string> }) {
  return (
    <section className="section-y bg-soft">
      <div className="container-wide grid items-center gap-10 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-5 lg:pr-10">
          <Reveal><p className="eyebrow mb-5">The Edit</p></Reveal>
          <TextReveal text={data.heading} className="display text-5xl md:text-7xl lg:text-[5.5rem]" />
          <Reveal delay={0.2}><p className="mt-6 max-w-sm font-display text-2xl font-light italic leading-snug text-muted">{data.text}</p></Reveal>
          <Reveal delay={0.3}><ButtonLink href={data.ctaHref} className="mt-9">{data.ctaText}</ButtonLink></Reveal>
        </div>

        <div className="grid grid-cols-5 gap-3 lg:col-span-7 md:gap-5">
          <ImageReveal className="col-span-3">
            <Parallax className="aspect-[4/5]" amount={6}><Img src={data.image1} alt="Editorial look" sizes="(max-width:1024px) 60vw, 35vw" className="h-full w-full" /></Parallax>
          </ImageReveal>
          <div className="col-span-2 flex flex-col gap-3 pt-10 md:gap-5 md:pt-24">
            <ImageReveal delay={0.15}><Img src={data.image2} alt="Detail" ratio="3/4" sizes="(max-width:1024px) 40vw, 24vw" /></ImageReveal>
            <ImageReveal delay={0.3}><Img src={data.image3} alt="Detail" ratio="3/4" sizes="(max-width:1024px) 40vw, 24vw" /></ImageReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
