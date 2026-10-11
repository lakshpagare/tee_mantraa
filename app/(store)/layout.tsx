import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BottomNav } from "@/components/layout/bottom-nav";
import { SearchOverlay } from "@/components/layout/search-overlay";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { QuickView } from "@/components/product/quick-view";
import { ScrollUI } from "@/components/scroll-ui";
import { CompareBar } from "@/components/product/compare";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
import { CustomCursor } from "@/components/layout/custom-cursor";
import { getFlashSales, getHomepage, getSettings } from "@/lib/data";
import { FlashProvider, FlashStrip } from "@/components/flash-sale";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [settings, home, flash] = await Promise.all([getSettings(), getHomepage(), getFlashSales()]);
  return (
    <FlashProvider value={flash}>
      <Navbar />
      <FlashStrip />
      <main id="main" className="min-h-[60vh] pb-16 lg:pb-0">{children}</main>
      <Footer settings={settings} content={home.footer.data as { about: string; copyright: string }} />
      <BottomNav />
      <SearchOverlay />
      <CartDrawer />
      <QuickView />
      <ScrollUI />
      <CompareBar />
      <WhatsAppButton />
      <CustomCursor />
    </FlashProvider>
  );
}
