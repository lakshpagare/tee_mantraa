"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function VerifyStatus() {
  const sp = useSearchParams();
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const [msg, setMsg] = useState("");
  useEffect(() => {
    const token = sp.get("token"), email = sp.get("email");
    if (!token || !email) { setState("error"); setMsg("This verification link is incomplete."); return; }
    fetch(`/api/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`)
      .then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d.error); setState("ok"); })
      .catch((e) => { setState("error"); setMsg(e.message); });
  }, [sp]);
  return (
    <div role="status" className="text-sm">
      {state === "loading" && <p>Verifying your email…</p>}
      {state === "ok" && <p>Your email is verified. <Link href="/login" className="underline">Sign in</Link></p>}
      {state === "error" && <p className="text-red-600">{msg} <Link href="/register" className="underline">Create an account</Link></p>}
    </div>
  );
}
