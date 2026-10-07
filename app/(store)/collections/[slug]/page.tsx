import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShopView } from "@/components/shop/shop-view";
import { getCollectionBySlug, type ShopParams } from "@/lib/data";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = await getCollectionBySlug((await params).slug);
  if (!c) return { title: "Collection not found" };
  return { title: c.name, description: c.description, alternates: { canonical: `/collections/${c.slug}` }, openGraph: { title: c.name, description: c.description, images: c.image ? [c.image] : undefined } };
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const c = await getCollectionBySlug(slug);
  if (!c) notFound();
  const sp = Object.fromEntries(Object.entries(await searchParams).map(([k, v]) => [k, Array.isArray(v) ? v.join(",") : v || ""]).filter(([, v]) => v)) as ShopParams;
  return <ShopView params={{ ...sp, collection: slug }} title={c.name} eyebrow="Collection" description={c.description} basePath={`/collections/${slug}`} />;
}
