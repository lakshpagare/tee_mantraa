import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Img } from "@/components/ui/img";
import { getPostBySlug } from "@/lib/data";
import { appUrl, formatDate } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getPostBySlug((await params).slug);
  if (!p) return { title: "Not found" };
  return { title: p.title, description: p.excerpt, alternates: { canonical: `/journal/${p.slug}` }, openGraph: { type: "article", title: p.title, description: p.excerpt, images: p.coverImage ? [p.coverImage.startsWith("http") ? p.coverImage : `${appUrl()}${p.coverImage}`] : undefined } };
}

/** Minimal formatting: blank line = paragraph, "## " = heading. Content is rendered as text (never as HTML). */
function Body({ text }: { text: string }) {
  return (
    <div className="space-y-6 text-[17px] leading-relaxed text-ink/85">
      {text.split(/\n{2,}/).map((block, i) =>
        block.startsWith("## ") ? <h2 key={i} className="pt-4 font-display text-3xl">{block.slice(3)}</h2> : <p key={i} className="whitespace-pre-line">{block}</p>
      )}
    </div>
  );
}

export default async function PostPage({ params }: Props) {
  const post = await getPostBySlug((await params).slug);
  if (!post) notFound();
  return (
    <article className="container-wide max-w-3xl pb-10 pt-10 md:pt-16">
      <Link href="/journal" className="eyebrow link-underline">← Journal</Link>
      <h1 className="display mt-6 text-5xl md:text-7xl">{post.title}</h1>
      <p className="mt-4 text-[11px] uppercase tracking-[0.2em] text-muted">{formatDate(post.publishedAt || post.createdAt)} · {post.author}</p>
      {post.coverImage && <div className="my-10"><Img src={post.coverImage} alt={post.title} ratio="16/9" priority sizes="(max-width:1024px) 100vw, 768px" /></div>}
      <Body text={post.content} />
    </article>
  );
}
