"use client";
import { createContext, useContext } from "react";
import type { SiteSettingsDTO } from "@/types";
import { DEFAULT_SETTINGS } from "@/lib/settings-default";

const SiteContext = createContext<SiteSettingsDTO>(DEFAULT_SETTINGS);
export function SiteProvider({ value, children }: { value: SiteSettingsDTO; children: React.ReactNode }) {
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}
export const useSite = () => useContext(SiteContext);
