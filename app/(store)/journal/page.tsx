import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Img } from "@/components/ui/img";
import { EmptyState } from "@/components/ui/empty-state";
import { getPosts } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Journal", description: "Style notes, behind-the-scenes and care guides.", alternates: { canonical: "/journal" } };

export default async function JournalPage() {
  const posts = await getPosts();
  return (
    <div className="container-wide pb-10 pt-10 md:pt-16">
      <p className="eyebrow mb-3">The Journal</p>
      <h1 className="display mb-12 text-5xl md:text-7xl">Notes on style</h1>
      {posts.length === 0 ? (
        <EmptyState icon={BookOpen} title="First stories coming soon" text="We're writing our first style notes. Check back shortly." ctaText="Shop the collection" ctaHref="/shop" />
      ) : (
        <ul className="grid gap-x-6 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p: any) => (
            <li key={p._id}>
              <Link href={`/journal/${p.slug}`} className="group block">
                <Img src={p.coverImage || ""} alt={p.title} ratio="4/3" sizes="(max-width:768px) 100vw, 33vw" imgClassName="transition-transform duration-[1200ms] group-hover:scale-105" />
                <p className="mt-4 text-[11px] uppercase tracking-[0.2em] text-muted">{formatDate(p.publishedAt || p.createdAt)} · {p.author}</p>
                <h2 className="mt-2 font-display text-3xl leading-tight">{p.title}</h2>
                <p className="mt-2 line-clamp-2 text-sm text-muted">{p.excerpt}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
