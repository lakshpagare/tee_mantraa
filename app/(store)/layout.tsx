import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BottomNav } from "@/components/layout/bottom-nav";
import { SearchOverlay } from "@/components/layout/search-overlay";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { QuickView } from "@/components/product/quick-view";
import { ScrollUI } from "@/components/scroll-ui";
import { getHomepage, getSettings } from "@/lib/data";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [settings, home] = await Promise.all([getSettings(), getHomepage()]);
  return (
    <>
      <Navbar />
      <main id="main" className="min-h-[60vh] pb-16 lg:pb-0">{children}</main>
      <Footer settings={settings} content={home.footer.data as { about: string; copyright: string }} />
      <BottomNav />
      <SearchOverlay />
      <CartDrawer />
      <QuickView />
      <ScrollUI />
    </>
  );
}
