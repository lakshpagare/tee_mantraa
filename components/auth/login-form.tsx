"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { loginFormSchema, type LoginForm } from "@/lib/validators";

export function GoogleButton({ callbackUrl }: { callbackUrl: string }) {
  return (
    <Button type="button" variant="outline" size="lg" className="w-full" onClick={() => signIn("google", { callbackUrl })}>
      <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"/><path fill="#FBBC05" d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg>
      Continue with Google
    </Button>
  );
}

export function LoginFormView() {
  const router = useRouter();
  const sp = useSearchParams();
  const callbackUrl = sp.get("callbackUrl") && sp.get("callbackUrl")!.startsWith("/") ? sp.get("callbackUrl")! : "/account";
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState(sp.get("error") ? "We couldn't sign you in. Please try again." : "");
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({ resolver: zodResolver(loginFormSchema) });

  const onSubmit = handleSubmit(async (v) => {
    setBusy(true);
    setFormError("");
    const res = await signIn("credentials", { ...v, redirect: false });
    setBusy(false);
    if (!res || res.error) return setFormError("Incorrect email or password, or your email isn't verified yet.");
    toast.success("Welcome back");
    router.push(callbackUrl);
    router.refresh();
  });

  return (
    <div className="space-y-6">
      <GoogleButton callbackUrl={callbackUrl} />
      <p className="text-center text-[11px] uppercase tracking-[0.2em] text-muted">or</p>
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <Field label="Email" error={errors.email?.message}><Input type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} /></Field>
        <Field label="Password" error={errors.password?.message}><Input type="password" autoComplete="current-password" aria-invalid={!!errors.password} {...register("password")} /></Field>
        {formError && <p role="alert" className="text-sm text-red-600">{formError}</p>}
        <Button type="submit" size="lg" className="w-full" loading={busy}>Sign in</Button>
        <Link href="/forgot-password" className="link-underline block text-center text-xs text-muted">Forgot your password?</Link>
      </form>
    </div>
  );
}
