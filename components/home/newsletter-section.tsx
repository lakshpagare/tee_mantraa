import { NewsletterForm } from "@/components/layout/newsletter-form";
import { Reveal } from "@/components/motion";

export function NewsletterSection({ data }: { data: Record<string, string> }) {
  return (
    <section className="border-t border-line py-24 md:py-32">
      <div className="container-wide max-w-2xl text-center">
        <Reveal><h2 className="display text-5xl md:text-7xl">{data.heading}</h2></Reveal>
        <Reveal delay={0.1}><p className="mx-auto mt-5 max-w-md text-sm text-muted">{data.text}</p></Reveal>
        <Reveal delay={0.2}><div className="mt-10 text-left"><NewsletterForm /></div></Reveal>
      </div>
    </section>
  );
}
