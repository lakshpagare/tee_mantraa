"use client";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import type { ReactNode } from "react";
import { SmoothScroll } from "@/components/smooth-scroll";
import { SyncManager } from "@/components/sync-manager";
import { SiteProvider } from "@/hooks/use-site";
import type { SiteSettingsDTO } from "@/types";

export function Providers({ children, settings }: { children: ReactNode; settings: SiteSettingsDTO }) {
  return (
    <SessionProvider>
      <SiteProvider value={settings}>
        <SmoothScroll />
        <SyncManager />
        {children}
        <Toaster position="bottom-center" toastOptions={{ className: "!rounded-none !border !border-line !font-sans !text-sm" }} />
      </SiteProvider>
    </SessionProvider>
  );
}
