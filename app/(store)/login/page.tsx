import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginFormView } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };
export default function LoginPage() {
  return (
    <AuthShell title="Sign in" subtitle="Welcome back. Access your orders, wishlist and saved details." footer={<>New here? <Link href="/register" className="underline text-ink">Create an account</Link></>}>
      <Suspense><LoginFormView /></Suspense>
    </AuthShell>
  );
}
