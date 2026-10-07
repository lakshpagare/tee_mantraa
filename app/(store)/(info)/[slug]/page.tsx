import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Accordion } from "@/components/ui/accordion";
import { Reveal } from "@/components/motion";
import { FAQS, INFO_PAGES } from "@/lib/info-pages";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return [...Object.keys(INFO_PAGES), "faq"].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (slug === "faq") return { title: "FAQ", description: "Answers to common questions.", alternates: { canonical: "/faq" } };
  const p = INFO_PAGES[slug];
  return p ? { title: p.title, description: p.intro, alternates: { canonical: `/${slug}` } } : { title: "Not found" };
}

export default async function InfoPage({ params }: Props) {
  const { slug } = await params;
  if (slug === "faq") {
    return (
      <div className="container-wide max-w-3xl pb-10 pt-10 md:pt-16">
        <p className="eyebrow mb-3">Help</p>
        <h1 className="display mb-10 text-5xl md:text-7xl">FAQ</h1>
        <Accordion defaultOpen={null} items={FAQS.map(([q, a]) => ({ title: q, content: <p>{a}</p> }))} />
      </div>
    );
  }
  const page = INFO_PAGES[slug];
  if (!page) notFound();
  return (
    <div className="container-wide max-w-3xl pb-10 pt-10 md:pt-16">
      <Reveal><p className="eyebrow mb-3">{page.eyebrow}</p><h1 className="display text-5xl md:text-7xl">{page.title}</h1><p className="mt-6 font-display text-2xl font-light italic text-muted">{page.intro}</p></Reveal>
      <div className="mt-14 space-y-10">
        {page.sections.map((s) => (
          <Reveal key={s.heading}><section><h2 className="mb-3 text-[11px] font-medium uppercase tracking-[0.2em]">{s.heading}</h2><p className="leading-relaxed text-muted">{s.body}</p></section></Reveal>
        ))}
      </div>
    </div>
  );
}
