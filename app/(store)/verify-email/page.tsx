import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { VerifyStatus } from "@/components/auth/verify-status";

export const metadata: Metadata = { title: "Verify email", robots: { index: false } };
export default function VerifyPage() {
  return <AuthShell title="Verify email"><Suspense><VerifyStatus /></Suspense></AuthShell>;
}
