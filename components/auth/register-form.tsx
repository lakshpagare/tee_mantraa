"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { GoogleButton } from "@/components/auth/login-form";
import { registerFormSchema, type RegisterForm } from "@/lib/validators";

export function RegisterFormView() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [devUrl, setDevUrl] = useState("");
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({ resolver: zodResolver(registerFormSchema) });

  const onSubmit = handleSubmit(async (v) => {
    setBusy(true);
    setFormError("");
    try {
      const r = await fetch("/api/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: v.name, email: v.email, password: v.password }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      if (d.devVerifyUrl) setDevUrl(d.devVerifyUrl);
      const res = await signIn("credentials", { email: v.email, password: v.password, redirect: false });
      if (res?.error) {
        toast.success("Account created. Please verify your email, then sign in.");
        router.push("/login");
        return;
      }
      toast.success("Welcome to the family");
      router.push("/account");
      router.refresh();
    } catch (e: any) {
      setFormError(e.message || "Could not create your account");
    } finally {
      setBusy(false);
    }
  });

  return (
    <div className="space-y-6">
      <GoogleButton callbackUrl="/account" />
      <p className="text-center text-[11px] uppercase tracking-[0.2em] text-muted">or</p>
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <Field label="Full name" error={errors.name?.message}><Input autoComplete="name" aria-invalid={!!errors.name} {...register("name")} /></Field>
        <Field label="Email" error={errors.email?.message}><Input type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} /></Field>
        <Field label="Password" error={errors.password?.message} hint="At least 8 characters with a letter and a number"><Input type="password" autoComplete="new-password" aria-invalid={!!errors.password} {...register("password")} /></Field>
        <Field label="Confirm password" error={errors.confirm?.message}><Input type="password" autoComplete="new-password" aria-invalid={!!errors.confirm} {...register("confirm")} /></Field>
        {formError && <p role="alert" className="text-sm text-red-600">{formError}</p>}
        {devUrl && <p className="break-all text-xs text-muted">Dev only — verification link: <a className="underline" href={devUrl}>{devUrl}</a></p>}
        <Button type="submit" size="lg" className="w-full" loading={busy}>Create account</Button>
      </form>
    </div>
  );
}
