import type { Metadata } from "next";
import Link from "next/link";
import { Gift } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Reveal } from "@/components/motion";
import { ButtonLink } from "@/components/ui/button";
import { getCollectionBySlug, getSettings, getShopProducts, type ShopParams } from "@/lib/data";
import { whatsappLink } from "@/lib/whatsapp";
import { cn, formatINR } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Gift Collection",
  description: "Thoughtful, ready-to-give pieces — tees, hoodies, accessories and more. Shop gifts by budget.",
  alternates: { canonical: "/gifts" },
};

const BUDGETS = [1000, 2000, 3000];

export default async function GiftsPage({ searchParams }: { searchParams: Promise<{ max?: string }> }) {
  const { max } = await searchParams;
  const maxPrice = BUDGETS.includes(Number(max)) ? String(Number(max)) : undefined;
  const base: ShopParams = maxPrice ? { max: maxPrice } : {};

  // 1) the "Gift Collection" collection if you've made one (Admin → Collections, slug: gift-collection)
  // 2) otherwise products tagged "gift"; 3) otherwise our best sellers
  const [col, settings] = await Promise.all([getCollectionBySlug("gift-collection"), getSettings()]);
  let products = col?.products?.length ? (await getShopProducts({ ...base, collection: "gift-collection", sort: "best-selling" })).products : [];
  if (!products.length) products = (await getShopProducts({ ...base, q: "gift" })).products;
  if (!products.length) products = (await getShopProducts({ ...base, sort: "best-selling" })).products;

  const wa = whatsappLink(settings.whatsapp, "Hi! I'd like help choosing a gift / a gift card.");
  return (
    <div className="pb-10">
      <section className="bg-[#0d0d0c] text-white">
        <div className="container-wide py-16 text-center md:py-24">
          <Reveal><p className="mb-4 text-[11px] font-medium uppercase tracking-[0.35em] text-[#c9a24a]">Gift Collection</p></Reveal>
          <Reveal delay={0.1}><h1 className="display text-5xl md:text-8xl">Give a little <em className="font-light">style</em></h1></Reveal>
          <Reveal delay={0.2}><p className="mx-auto mt-5 max-w-md font-display text-xl italic text-white/70 md:text-2xl">Thoughtful pieces, ready to give.</p></Reveal>
        </div>
      </section>

      <div className="container-wide pt-10">
        <div className="mb-10 flex flex-wrap items-center gap-2" role="group" aria-label="Filter gifts by budget">
          <span className="mr-2 text-[11px] uppercase tracking-[0.2em] text-muted">Budget</span>
          <Link href="/gifts" aria-current={!maxPrice} className={cn("border px-4 py-2 text-xs", !maxPrice ? "border-ink bg-ink text-paper" : "border-line hover:border-ink")}>All gifts</Link>
          {BUDGETS.map((b) => (
            <Link key={b} href={`/gifts?max=${b}`} aria-current={maxPrice === String(b)} className={cn("border px-4 py-2 text-xs", maxPrice === String(b) ? "border-ink bg-ink text-paper" : "border-line hover:border-ink")}>Under {formatINR(b)}</Link>
          ))}
        </div>

        {products.length === 0 ? (
          <EmptyState icon={Gift} title="No gifts in this budget yet" text="Try a different budget or browse everything we have." ctaText="Shop all" ctaHref="/shop" />
        ) : (
          <ul className="grid grid-cols-2 gap-x-3 gap-y-12 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4">
            {products.map((p, i) => <li key={p._id}><ProductCard product={p} priority={i < 4} /></li>)}
          </ul>
        )}

        <section className="mt-20 grid items-center gap-6 border border-line p-8 md:grid-cols-[1fr_auto] md:p-12" aria-labelledby="giftcard-h">
          <div>
            <p className="eyebrow mb-2">Can't decide?</p>
            <h2 id="giftcard-h" className="display text-4xl md:text-5xl">Send a gift card</h2>
            <p className="mt-3 max-w-lg text-sm text-muted">Gift cards are issued by our team and can be redeemed at checkout. Message us with the amount and who it's for, and we'll send you the code.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center bg-ink px-7 text-[11px] font-medium uppercase tracking-[0.2em] text-paper">Ask on WhatsApp</a>}
            <ButtonLink href="/contact" variant="outline">Contact us</ButtonLink>
          </div>
        </section>
      </div>
    </div>
  );
}
