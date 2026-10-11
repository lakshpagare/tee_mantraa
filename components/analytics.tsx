"use client";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

declare global {
  interface Window { gtag?: (...a: any[]) => void; fbq?: (...a: any[]) => void; dataLayer?: any[] }
}

const GA = process.env.NEXT_PUBLIC_GA_ID;
const PIXEL = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const META_EVENTS: Record<string, string> = { add_to_cart: "AddToCart", purchase: "Purchase", begin_checkout: "InitiateCheckout" };

/** Fire a commerce event to GA4 and the Meta Pixel (no-ops when they are not configured). */
export function track(event: string, params: Record<string, any> = {}) {
  if (typeof window === "undefined") return;
  try {
    window.gtag?.("event", event, params);
    window.fbq?.("track", META_EVENTS[event] || event, { value: params.value, currency: params.currency });
  } catch { /* analytics must never break the store */ }
}

export function Analytics() {
  const pathname = usePathname();
  useEffect(() => {
    if (GA) window.gtag?.("event", "page_view", { page_path: pathname });
    if (PIXEL) window.fbq?.("track", "PageView");
  }, [pathname]);
  if (!GA && !PIXEL) return null;
  return (
    <>
      {GA && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config','${GA}',{send_page_view:false});`}</Script>
        </>
      )}
      {PIXEL && (
        <Script id="meta-pixel" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${PIXEL}');`}</Script>
      )}
    </>
  );
}
