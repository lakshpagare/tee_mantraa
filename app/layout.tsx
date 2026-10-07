import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { getSettings } from "@/lib/data";
import { appUrl } from "@/lib/utils";

// Content is read from MongoDB; render per-request so CMS/admin changes show immediately.
export const dynamic = "force-dynamic";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const display = Cormorant_Garamond({ subsets: ["latin"], weight: ["300", "400", "500", "600"], style: ["normal", "italic"], variable: "--font-display", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    metadataBase: new URL(appUrl()),
    title: { default: `${s.brandName} — ${s.tagline}`, template: `%s | ${s.brandName}` },
    description: "Premium everyday clothing for men and women. Shirts, tees, hoodies, jeans, jackets and accessories, thoughtfully designed in India.",
    openGraph: { type: "website", siteName: s.brandName, title: `${s.brandName} — ${s.tagline}`, locale: "en_IN" },
    twitter: { card: "summary_large_image", title: `${s.brandName} — ${s.tagline}` },
    alternates: { canonical: "/" },
  };
}

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#ffffff" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-ink focus:px-4 focus:py-2 focus:text-white">
          Skip to content
        </a>
        <Providers settings={settings}>{children}</Providers>
      </body>
    </html>
  );
}
