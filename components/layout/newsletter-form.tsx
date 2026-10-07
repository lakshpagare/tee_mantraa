"use client";
import { ArrowRight, Check } from "lucide-react";
import { useState, useTransition } from "react";
import { subscribeNewsletter } from "@/actions/newsletter";
import { cn } from "@/lib/utils";

export function NewsletterForm({ dark = false, button = "SUBSCRIBE" }: { dark?: boolean; button?: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<{ ok: boolean; message: string } | null>(null);
  const [pending, start] = useTransition();
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await subscribeNewsletter(email);
          setState(r);
          if (r.ok) setEmail("");
        });
      }}
      className="w-full"
    >
      <div className={cn("flex items-center border-b", dark ? "border-white/60" : "border-ink")}>
        <label htmlFor="nl-email" className="sr-only">Email address</label>
        <input id="nl-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email address" autoComplete="email"
          aria-invalid={state ? !state.ok : undefined} aria-describedby="nl-msg"
          className="h-14 w-full bg-transparent text-sm outline-none placeholder:text-current placeholder:opacity-50" />
        <button type="submit" disabled={pending} className="group flex h-14 items-center gap-2 pl-4 text-[11px] font-medium uppercase tracking-[0.22em] disabled:opacity-50">
          {pending ? "…" : state?.ok ? <Check className="h-4 w-4" /> : <>{button}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></>}
        </button>
      </div>
      <p id="nl-msg" role="status" className={cn("mt-3 min-h-5 text-xs", state && !state.ok && "text-red-500")}>{state?.message}</p>
    </form>
  );
}
