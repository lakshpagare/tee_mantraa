import type { MetadataRoute } from "next";
import { getAllProductSlugs, getCategories, getCollections } from "@/lib/data";
import { INFO_PAGES } from "@/lib/info-pages";
import { appUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = appUrl();
  const [products, categories, collections] = await Promise.all([getAllProductSlugs(), getCategories(), getCollections()]);
  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/collections`, changeFrequency: "weekly", priority: 0.7 },
    ...categories.map((c) => ({ url: `${base}/category/${c.slug}`, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...collections.map((c) => ({ url: `${base}/collections/${c.slug}`, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...products.map((p: any) => ({ url: `${base}/product/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...[...Object.keys(INFO_PAGES), "faq"].map((s) => ({ url: `${base}/${s}`, changeFrequency: "monthly" as const, priority: 0.3 })),
  ];
}
