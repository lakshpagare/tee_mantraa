import { Hero } from "@/components/home/hero";
import { Marquee } from "@/components/motion";
import { CategorySection } from "@/components/home/category-section";
import { ProductSection } from "@/components/home/product-section";
import { EditorialSection } from "@/components/home/editorial-section";
import { CollectionBanner } from "@/components/home/collection-banner";
import { PromoBanner } from "@/components/home/promo-banner";
import { BrandStory } from "@/components/home/brand-story";
import { Testimonials } from "@/components/home/testimonials";
import { SocialGrid } from "@/components/home/social-grid";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { getActiveBanner, getBestSellers, getCategories, getHomepage, getNewArrivals, getTestimonials } from "@/lib/data";

export default async function HomePage() {
  const [home, categories, testimonials, banner] = await Promise.all([getHomepage(), getCategories(), getTestimonials(), getActiveBanner()]);
  const [newArrivals, bestSellers] = await Promise.all([
    getNewArrivals(8, home.newArrivals.data.productIds || []),
    getBestSellers(8, home.bestSellers.data.productIds || []),
  ]);
  const on = (k: keyof typeof home) => home[k].enabled;

  return (
    <>
      {on("hero") && <Hero data={home.hero.data as any} />}
      {on("marquee") && <Marquee items={home.marquee.data.items || []} />}
      {on("categories") && <CategorySection data={home.categories.data} categories={categories} />}
      {on("newArrivals") && <ProductSection data={home.newArrivals.data} products={newArrivals} href="/shop?new=1" />}
      {on("editorial") && <EditorialSection data={home.editorial.data as any} />}
      {on("collectionBanner") && <CollectionBanner data={home.collectionBanner.data as any} />}
      {on("bestSellers") && <ProductSection data={home.bestSellers.data} products={bestSellers} variant="scroll" href="/shop?sort=best-selling" />}
      {/* Admin → Banners: the newest active, in-date banner overrides the default promo copy. */}
      {on("promo") && (
        <PromoBanner
          data={banner ? { heading: banner.title, subheading: banner.subtitle || "", ctaText: banner.ctaText || "SHOP NOW", ctaHref: banner.ctaLink || "/shop" } : (home.promo.data as any)}
        />
      )}
      {on("story") && <BrandStory data={home.story.data as any} />}
      {on("testimonials") && <Testimonials data={home.testimonials.data as any} items={testimonials} />}
      {on("social") && <SocialGrid data={home.social.data} />}
      {on("newsletter") && <NewsletterSection data={home.newsletter.data as any} />}
    </>
  );
}
