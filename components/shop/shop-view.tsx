import Link from "next/link";
import { PackageSearch } from "lucide-react";
import { Suspense } from "react";
import { ProductCard } from "@/components/product/product-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ShopSidebar, ShopToolbar } from "@/components/shop/shop-filters";
import { ProductGridSkeleton } from "@/components/ui/skeleton";
import { PAGE_SIZE, getCategories, getShopProducts, type ShopParams } from "@/lib/data";

function pageHref(base: string, sp: ShopParams, page: number) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) if (v && k !== "page") q.set(k, v);
  if (page > 1) q.set("page", String(page));
  const s = q.toString();
  return s ? `${base}?${s}` : base;
}

export async function ShopView({ params, title, eyebrow, description, basePath = "/shop", lockedCategory = false }: { params: ShopParams; title: string; eyebrow?: string; description?: string; basePath?: string; lockedCategory?: boolean }) {
  const [{ products, total, page, pages, colors }, categories] = await Promise.all([getShopProducts(params), getCategories()]);
  return (
    <div className="container-wide pb-10 pt-10 md:pt-16">
      <header className="mb-8 max-w-2xl md:mb-12">
        <p className="eyebrow mb-3">{eyebrow || "Shop"}</p>
        <h1 className="display text-5xl md:text-7xl">{title}</h1>
        {description && <p className="mt-4 text-sm text-muted">{description}</p>}
      </header>
      <div className="flex gap-12">
        <Suspense fallback={<div className="hidden w-64 lg:block" />}><ShopSidebar categories={categories} colors={colors} lockedCategory={lockedCategory} /></Suspense>
        <div className="min-w-0 flex-1">
          <Suspense fallback={null}><ShopToolbar total={total} categories={categories} colors={colors} lockedCategory={lockedCategory} /></Suspense>
          <div className="mt-8">
            {products.length === 0 ? (
              <EmptyState icon={PackageSearch} title="No products found" text="Try removing a filter or searching for something different." ctaText="Clear filters" ctaHref={basePath} />
            ) : (
              <Suspense fallback={<ProductGridSkeleton />}>
                <ul className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 md:gap-x-5 xl:grid-cols-4">
                  {products.map((p, i) => <li key={p._id}><ProductCard product={p} priority={i < 4} /></li>)}
                </ul>
              </Suspense>
            )}
          </div>
          {pages > 1 && (
            <nav aria-label="Pagination" className="mt-14 flex items-center justify-center gap-2">
              {Array.from({ length: pages }).map((_, i) => (
                <Link key={i} href={pageHref(basePath, params, i + 1)} scroll aria-current={page === i + 1 ? "page" : undefined}
                  className={`flex h-10 w-10 items-center justify-center border text-sm ${page === i + 1 ? "border-ink bg-ink text-white" : "border-line hover:border-ink"}`}>{i + 1}</Link>
              ))}
              <span className="sr-only">Page {page} of {pages}, {PAGE_SIZE} per page</span>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
