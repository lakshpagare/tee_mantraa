import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountView } from "@/components/account/account-view";

export const metadata: Metadata = { title: "My Account", robots: { index: false } };
export default function AccountPage() {
  return <Suspense><AccountView /></Suspense>;
}
