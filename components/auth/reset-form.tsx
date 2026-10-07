"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";

export function ResetForm() {
  const sp = useSearchParams();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      const r = await fetch("/api/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: sp.get("token") || "", email: sp.get("email") || "", password }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setDone(true);
    } catch (e: any) { setErr(e.message || "Could not reset your password"); } finally { setBusy(false); }
  };
  if (done) return <div role="status" className="space-y-4 text-sm"><p>Your password has been updated.</p><Link href="/login" className="underline">Continue to sign in</Link></div>;
  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <Field label="New password" error={err} hint="At least 8 characters with a letter and a number"><Input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></Field>
      <Button type="submit" size="lg" className="w-full" loading={busy}>Update password</Button>
    </form>
  );
}
