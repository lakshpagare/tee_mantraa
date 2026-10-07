import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotForm } from "@/components/auth/forgot-form";

export const metadata: Metadata = { title: "Forgot password", robots: { index: false } };
export default function ForgotPage() {
  return (
    <AuthShell title="Reset password" subtitle="Enter your email and we'll send you a reset link." footer={<Link href="/login" className="underline text-ink">Back to sign in</Link>}>
      <ForgotForm />
    </AuthShell>
  );
}
