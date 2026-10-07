import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Layers } from "lucide-react";
import { Img } from "@/components/ui/img";
import { EmptyState } from "@/components/ui/empty-state";
import { getCollections } from "@/lib/data";

export const metadata: Metadata = { title: "Collections", description: "Curated edits for every season and every plan.", alternates: { canonical: "/collections" } };

export default async function CollectionsPage() {
  const collections = await getCollections();
  return (
    <div className="container-wide pb-10 pt-10 md:pt-16">
      <p className="eyebrow mb-3">Curated</p>
      <h1 className="display mb-12 text-5xl md:text-7xl">Collections</h1>
      {collections.length === 0 ? (
        <EmptyState icon={Layers} title="No collections yet" text="New edits are on their way. In the meantime, explore everything we have." ctaText="Shop all" ctaHref="/shop" />
      ) : (
        <ul className="grid gap-5 md:grid-cols-2">
          {collections.map((c) => (
            <li key={c._id}>
              <Link href={`/collections/${c.slug}`} className="group relative block overflow-hidden">
                <Img src={c.image || ""} alt={c.name} ratio="4/3" sizes="(max-width:768px) 100vw, 50vw" imgClassName="transition-transform duration-[1200ms] group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6 text-white">
                  <div><h2 className="font-display text-4xl font-light md:text-5xl">{c.name}</h2><p className="mt-1 max-w-xs text-sm opacity-90">{c.description}</p></div>
                  <ArrowUpRight className="h-7 w-7 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" strokeWidth={1.25} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
