import type { Metadata } from "next";
import { ShopView } from "@/components/shop/shop-view";
import type { ShopParams } from "@/lib/data";

type SP = Promise<Record<string, string | string[] | undefined>>;
const flat = (sp: Record<string, string | string[] | undefined>): ShopParams =>
  Object.fromEntries(Object.entries(sp).map(([k, v]) => [k, Array.isArray(v) ? v.join(",") : v || ""]).filter(([, v]) => v)) as ShopParams;

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const sp = flat(await searchParams);
  const title = sp.q ? `Search: ${sp.q}` : sp.sale ? "Sale" : sp.new ? "New Arrivals" : sp.gender ? (sp.gender === "men" ? "Men" : "Women") : "Shop All";
  // Filtered URLs canonicalise to /shop to avoid duplicate-content indexing.
  return { title, description: `Browse ${title.toLowerCase()} — premium everyday clothing.`, alternates: { canonical: "/shop" } };
}

export default async function ShopPage({ searchParams }: { searchParams: SP }) {
  const sp = flat(await searchParams);
  const title = sp.q ? `Results for “${sp.q}”` : sp.sale ? "Sale" : sp.new ? "New Arrivals" : sp.gender === "men" ? "Men" : sp.gender === "women" ? "Women" : "All Products";
  return <ShopView params={sp} title={title} eyebrow={sp.sale ? "Limited time" : sp.new ? "Just landed" : "Shop"} />;
}
