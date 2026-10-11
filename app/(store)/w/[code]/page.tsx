import type { Metadata } from "next";
import { Heart } from "lucide-react";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import { SharedWishlist } from "@/models/SharedWishlist";
import { ProductCard } from "@/components/product/product-card";
import { EmptyState } from "@/components/ui/empty-state";
import { getProductsByIds } from "@/lib/data";

type Props = { params: Promise<{ code: string }> };

export const metadata: Metadata = { title: "Shared wishlist", robots: { index: false, follow: false } };

export default async function SharedWishlistPage({ params }: Props) {
  const { code } = await params;
  if (!/^[a-z0-9]{4,12}$/.test(code)) notFound();
  await connectDB();
  const list: any = await SharedWishlist.findOne({ code }).lean();
  if (!list) notFound();
  const products = await getProductsByIds((list.ids || []).map(String));
  return (
    <div className="container-wide pb-10 pt-10 md:pt-16">
      <p className="eyebrow mb-3">Wishlist</p>
      <h1 className="display mb-12 text-5xl md:text-7xl">{list.ownerName ? `${list.ownerName}'s picks` : "Shared picks"}</h1>
      {products.length === 0 ? (
        <EmptyState icon={Heart} title="These items are no longer available" text="The pieces on this list have sold out or been removed." ctaText="Shop new arrivals" ctaHref="/shop?new=1" />
      ) : (
        <ul className="grid grid-cols-2 gap-x-3 gap-y-12 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4">{products.map((p) => <li key={p._id}><ProductCard product={p} /></li>)}</ul>
      )}
    </div>
  );
}
