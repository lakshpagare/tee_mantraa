"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";

export function ForgotForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  const [devUrl, setDevUrl] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      const r = await fetch("/api/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setDone(true);
      if (d.devResetUrl) setDevUrl(d.devResetUrl);
    } catch (e: any) { setErr(e.message || "Something went wrong"); } finally { setBusy(false); }
  };
  if (done) return <div role="status" className="space-y-3 text-sm"><p>If an account exists for <strong>{email}</strong>, a reset link is on its way. It's valid for one hour.</p>{devUrl && <p className="break-all text-xs text-muted">Dev only: <a className="underline" href={devUrl}>{devUrl}</a></p>}</div>;
  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <Field label="Email" error={err}><Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></Field>
      <Button type="submit" size="lg" className="w-full" loading={busy}>Send reset link</Button>
    </form>
  );
}
