"use client";
import { Truck } from "lucide-react";
import { useEffect, useState } from "react";

const KEY = "tee-mantraa-pincode";

export function PincodeChecker() {
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const check = async (c: string) => {
    setBusy(true);
    try {
      const d = await (await fetch(`/api/pincode?code=${c}`)).json();
      setMsg({ ok: !!d.valid && d.serviceable !== false, text: d.message });
      if (d.valid) try { localStorage.setItem(KEY, c); } catch {}
    } catch { setMsg({ ok: false, text: "Couldn't check right now. Please try again." }); } finally { setBusy(false); }
  };
  useEffect(() => { try { const c = localStorage.getItem(KEY); if (c) { setCode(c); check(c); } } catch {} }, []);

  return (
    <div className="border-t border-line pt-6">
      <p className="mb-3 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em]"><Truck className="h-4 w-4" strokeWidth={1.5} />Delivery &amp; COD check</p>
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); check(code); }}>
        <input aria-label="PIN code" inputMode="numeric" maxLength={6} placeholder="Enter PIN code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} className="h-11 w-full border border-line px-3 text-sm focus:border-ink focus:outline-none" />
        <button type="submit" disabled={busy || code.length !== 6} className="h-11 border border-ink px-5 text-[11px] font-medium uppercase tracking-[0.2em] hover:bg-ink hover:text-paper disabled:opacity-40">{busy ? "…" : "Check"}</button>
      </form>
      {msg && <p role="status" className={`mt-2 text-xs ${msg.ok ? "text-green-700" : "text-red-600"}`}>{msg.text}</p>}
    </div>
  );
}
