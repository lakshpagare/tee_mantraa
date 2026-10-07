import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterFormView } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Create account", robots: { index: false } };
export default function RegisterPage() {
  return (
    <AuthShell title="Create account" subtitle="Join for faster checkout, order tracking and a saved wishlist." footer={<>Already a member? <Link href="/login" className="underline text-ink">Sign in</Link></>}>
      <RegisterFormView />
    </AuthShell>
  );
}
