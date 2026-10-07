import { Instagram } from "lucide-react";
import { Img } from "@/components/ui/img";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/motion";

export function SocialGrid({ data }: { data: Record<string, any> }) {
  const images: string[] = (data.images || []).slice(0, 8);
  if (!images.length) return null;
  return (
    <section className="section-y">
      <div className="container-wide">
        <Reveal className="mb-10 text-center"><p className="eyebrow mb-3">Follow along</p><h2 className="display text-5xl md:text-6xl">{data.heading}</h2></Reveal>
        <ul className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
          {images.map((src, i) => (
            <li key={`${src}-${i}`}>
              <a href={data.ctaHref} target="_blank" rel="noopener noreferrer" aria-label={`Instagram post ${i + 1}`} className="group relative block overflow-hidden">
                <Img src={src} alt="" ratio="1/1" sizes="(max-width:768px) 50vw, 25vw" imgClassName="transition-transform duration-[900ms] group-hover:scale-110" />
                <span className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 transition-opacity duration-500 group-hover:opacity-100"><Instagram className="h-7 w-7 text-white" strokeWidth={1.25} /></span>
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-10 text-center"><ButtonLink href={data.ctaHref} variant="outline" size="lg" target="_blank" rel="noopener noreferrer">{data.ctaText}</ButtonLink></div>
      </div>
    </section>
  );
}
