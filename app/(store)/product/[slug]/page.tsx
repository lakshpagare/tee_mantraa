import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Gallery } from "@/components/product/gallery";
import { ProductDetails } from "@/components/product/product-details";
import { ProductCard, categoryName } from "@/components/product/product-card";
import { ReviewsSection } from "@/components/product/reviews-section";
import { getProductBySlug, getRelatedProducts, getReviews } from "@/lib/data";
import { appUrl } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

const abs = (src: string) => (src.startsWith("http") ? src : `${appUrl()}${src}`);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProductBySlug((await params).slug);
  if (!p) return { title: "Product not found" };
  const desc = p.shortDescription || p.description.slice(0, 155);
  return {
    title: p.name,
    description: desc,
    alternates: { canonical: `/product/${p.slug}` },
    openGraph: { type: "website", title: p.name, description: desc, images: p.images[0] ? [{ url: abs(p.images[0]) }] : undefined },
    twitter: { card: "summary_large_image", title: p.name, description: desc, images: p.images[0] ? [abs(p.images[0])] : undefined },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const [related, { reviews, breakdown }] = await Promise.all([getRelatedProducts(product), getReviews(product._id)]);
  const cat = typeof product.category === "object" && product.category ? product.category : null;
  const available = product.stock - product.reserved > 0;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      image: product.images.map(abs),
      description: product.shortDescription || product.description,
      sku: product.sku,
      brand: { "@type": "Brand", name: product.brand || "VÉRANO" },
      ...(product.reviewCount > 0 ? { aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviewCount } } : {}),
      offers: {
        "@type": "Offer",
        url: `${appUrl()}/product/${product.slug}`,
        priceCurrency: "INR",
        price: product.price,
        itemCondition: "https://schema.org/NewCondition",
        availability: available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: appUrl() },
        { "@type": "ListItem", position: 2, name: "Shop", item: `${appUrl()}/shop` },
        ...(cat ? [{ "@type": "ListItem", position: 3, name: cat.name, item: `${appUrl()}/category/${cat.slug}` }] : []),
        { "@type": "ListItem", position: cat ? 4 : 3, name: product.name },
      ],
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="container-wide pt-6 md:pt-10">
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-muted">
          <ol className="flex flex-wrap items-center gap-2">
            <li><Link href="/" className="hover:text-ink">Home</Link></li><li aria-hidden>/</li>
            <li><Link href="/shop" className="hover:text-ink">Shop</Link></li><li aria-hidden>/</li>
            {cat && (<><li><Link href={`/category/${cat.slug}`} className="hover:text-ink">{cat.name}</Link></li><li aria-hidden>/</li></>)}
            <li aria-current="page" className="text-ink">{product.name}</li>
          </ol>
        </nav>
        <div className="grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-20">
          <Gallery images={product.images} name={product.name} />
          <ProductDetails product={product} category={categoryName(product)} />
        </div>
      </div>

      <ReviewsSection productId={product._id} rating={product.rating} count={product.reviewCount} reviews={reviews} breakdown={breakdown} />

      {related.length > 0 && (
        <section className="container-wide pb-10" aria-labelledby="related-h">
          <h2 id="related-h" className="display mb-10 text-4xl md:text-5xl">You may also like</h2>
          <ul className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 md:gap-x-5">
            {related.map((p) => <li key={p._id}><ProductCard product={p} /></li>)}
          </ul>
        </section>
      )}
    </>
  );
}
