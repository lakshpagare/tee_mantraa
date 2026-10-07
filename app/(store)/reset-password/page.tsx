import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetForm } from "@/components/auth/reset-form";

export const metadata: Metadata = { title: "Choose a new password", robots: { index: false } };
export default function ResetPage() {
  return <AuthShell title="New password"><Suspense><ResetForm /></Suspense></AuthShell>;
}
