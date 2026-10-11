"use client";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function StockAlertForm({ productId }: { productId: string }) {
  const { data } = useSession();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await fetch("/api/stock-alert", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId, email: email || data?.user?.email }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setDone(true);
    } catch (err: any) { toast.error(err.message || "Could not save your alert"); } finally { setBusy(false); }
  };
  if (done) return <p role="status" className="border border-line bg-soft p-4 text-sm">Done — we'll email you the moment it's back in stock.</p>;
  return (
    <form onSubmit={submit} className="space-y-3 border border-line p-4">
      <p className="text-sm font-medium">Sold out — get notified when it's back</p>
      <div className="flex gap-2">
        <input type="email" required placeholder="Your email" defaultValue={data?.user?.email || ""} onChange={(e) => setEmail(e.target.value)} aria-label="Email" className="h-11 w-full border border-line px-3 text-sm focus:border-ink focus:outline-none" />
        <Button type="submit" loading={busy}>Notify me</Button>
      </div>
    </form>
  );
}
