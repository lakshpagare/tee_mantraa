"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { adminFetch } from "@/components/admin/api";
import { Card, PageHeader } from "@/components/admin/ui";

const FIELDS: { name: string; label: string; type?: string; hint?: string }[] = [
  { name: "brandName", label: "Brand name" },
  { name: "tagline", label: "Tagline" },
  { name: "announcement", label: "Announcement bar text", hint: "Leave empty to hide the bar" },
  { name: "freeShippingThreshold", label: "Free shipping above (₹)", type: "number" },
  { name: "shippingFee", label: "Standard shipping fee (₹)", type: "number" },
  { name: "expressFee", label: "Express shipping fee (₹)", type: "number" },
  { name: "taxRate", label: "GST rate included in prices (%)", type: "number" },
  { name: "contactEmail", label: "Contact email" },
  { name: "contactPhone", label: "Contact phone" },
  { name: "instagram", label: "Instagram URL" },
  { name: "facebook", label: "Facebook URL" },
  { name: "youtube", label: "YouTube URL" },
];

export function SettingsForm() {
  const [v, setV] = useState<Record<string, any> | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { adminFetch("/api/admin/settings").then((d) => setV(d.settings)).catch((e) => toast.error(e.message)); }, []);
  if (!v) return <p className="text-muted">Loading settings…</p>;
  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    try {
      const body = Object.fromEntries(FIELDS.map((f) => [f.name, f.type === "number" ? Number(v[f.name]) : v[f.name] ?? ""]));
      await adminFetch("/api/admin/settings", "PUT", body);
      toast.success("Settings saved — storefront updated");
    } catch (err: any) { toast.error(err.message); } finally { setBusy(false); }
  };
  return (
    <>
      <PageHeader title="Settings" description="Branding, shipping and contact details used across the storefront." />
      <form onSubmit={save}>
        <Card className="max-w-3xl p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            {FIELDS.map((f) => (
              <label key={f.name} className={f.name === "announcement" || f.name === "tagline" ? "sm:col-span-2" : ""}>
                <span className="mb-1.5 block text-xs font-medium text-neutral-600">{f.label}</span>
                <input type={f.type || "text"} min={0} step="any" value={v[f.name] ?? ""} onChange={(e) => setV({ ...v, [f.name]: e.target.value })} className="h-10 w-full border border-line px-3 text-sm focus:border-ink focus:outline-none" />
                {f.hint && <span className="mt-1 block text-xs text-muted">{f.hint}</span>}
              </label>
            ))}
          </div>
          <div className="mt-6 flex justify-end"><button type="submit" disabled={busy} className="h-10 bg-ink px-6 text-white disabled:opacity-50">{busy ? "Saving…" : "Save settings"}</button></div>
        </Card>
      </form>
    </>
  );
}
