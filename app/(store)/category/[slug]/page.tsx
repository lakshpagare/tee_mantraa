import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShopView } from "@/components/shop/shop-view";
import { getCategoryBySlug, type ShopParams } from "@/lib/data";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = await getCategoryBySlug((await params).slug);
  if (!c) return { title: "Category not found" };
  return {
    title: c.name,
    description: c.description || `Shop ${c.name} — premium everyday clothing.`,
    alternates: { canonical: `/category/${c.slug}` },
    openGraph: { title: c.name, description: c.description, images: c.image ? [c.image] : undefined },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const c = await getCategoryBySlug(slug);
  if (!c) notFound();
  const sp = Object.fromEntries(Object.entries(await searchParams).map(([k, v]) => [k, Array.isArray(v) ? v.join(",") : v || ""]).filter(([, v]) => v)) as ShopParams;
  return <ShopView params={{ ...sp, category: slug }} title={c.name} eyebrow="Category" description={c.description} basePath={`/category/${slug}`} lockedCategory />;
}
