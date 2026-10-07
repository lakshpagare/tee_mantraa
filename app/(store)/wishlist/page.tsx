import type { Metadata } from "next";
import { WishlistView } from "@/components/account/wishlist-view";

export const metadata: Metadata = { title: "Wishlist", robots: { index: false } };
export default function WishlistPage() {
  return (
    <div className="container-wide pb-10 pt-10 md:pt-16">
      <p className="eyebrow mb-3">Saved for later</p>
      <h1 className="display mb-12 text-5xl md:text-7xl">Wishlist</h1>
      <WishlistView />
    </div>
  );
}
