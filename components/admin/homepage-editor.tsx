"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { adminFetch } from "@/components/admin/api";
import { ImageUploader } from "@/components/admin/image-uploader";
import { RefMulti } from "@/components/admin/ref-multi";
import { Card, PageHeader } from "@/components/admin/ui";
import { Switch } from "@/components/ui/form";
import { SECTION_KEYS, SECTION_SCHEMA, type SectionKey } from "@/lib/homepage-defaults";
import { cn } from "@/lib/utils";

const input = "h-10 w-full border border-line px-3 text-sm focus:border-ink focus:outline-none";

export function HomepageEditor() {
  const [sections, setSections] = useState<Record<string, { enabled: boolean; data: Record<string, any> }> | null>(null);
  const [active, setActive] = useState<SectionKey>("hero");
  const [busy, setBusy] = useState(false);
  useEffect(() => { adminFetch("/api/admin/homepage").then((d) => setSections(d.sections)).catch((e) => toast.error(e.message)); }, []);
  if (!sections) return <p className="text-muted">Loading homepage content…</p>;

  const schema = SECTION_SCHEMA[active];
  const sec = sections[active];
  const set = (name: string, value: any) => setSections({ ...sections, [active]: { ...sec, data: { ...sec.data, [name]: value } } });

  const save = async () => {
    setBusy(true);
    try { await adminFetch("/api/admin/homepage", "PUT", { key: active, enabled: sec.enabled, data: sec.data }); toast.success(`${schema.label} saved — live on the homepage`); }
    catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };

  return (
    <>
      <PageHeader title="Homepage" description="Edit every section of the storefront homepage. Changes go live immediately — no code required." actions={<Link href="/" target="_blank" className="flex h-10 items-center border border-line bg-white px-4 text-sm hover:bg-neutral-50">Preview homepage ↗</Link>} />
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Homepage sections"><ul className="flex gap-1 overflow-x-auto lg:flex-col">
          {SECTION_KEYS.map((k) => (
            <li key={k}><button onClick={() => setActive(k)} aria-current={active === k} className={cn("flex w-full items-center justify-between whitespace-nowrap px-3 py-2.5 text-left text-sm", active === k ? "bg-ink text-white" : "bg-white hover:bg-neutral-100")}>
              {SECTION_SCHEMA[k].label}{!sections[k].enabled && <span className="ml-2 text-[10px] uppercase opacity-70">Hidden</span>}
            </button></li>
          ))}
        </ul></nav>

        <Card className="p-6">
          <div className="mb-6 flex items-center justify-between border-b border-line pb-4"><h2 className="text-lg font-semibold">{schema.label}</h2><label className="flex items-center gap-3 text-sm">Visible<Switch checked={sec.enabled} onChange={(v) => setSections({ ...sections, [active]: { ...sec, enabled: v } })} label={`Show ${schema.label}`} /></label></div>
          {schema.note && <p className="mb-5 bg-neutral-50 p-3 text-xs text-muted">{schema.note}</p>}
          <div className="grid gap-5">
            {schema.fields.map((f) => {
              const v = sec.data[f.name];
              return (
                <div key={f.name}>
                  <span className="mb-1.5 block text-xs font-medium text-neutral-600">{f.label}</span>
                  {f.type === "text" && <input className={input} value={v ?? ""} onChange={(e) => set(f.name, e.target.value)} />}
                  {f.type === "textarea" && <textarea rows={3} className="w-full border border-line p-3 text-sm" value={v ?? ""} onChange={(e) => set(f.name, e.target.value)} />}
                  {f.type === "image" && <ImageUploader single value={v ? [v] : []} onChange={(x) => set(f.name, x[0] || "")} />}
                  {f.type === "images" && <ImageUploader value={v || []} onChange={(x) => set(f.name, x)} max={f.max || 8} />}
                  {f.type === "products" && <RefMulti resource="products" value={v || []} onChange={(x) => set(f.name, x)} max={f.max} />}
                  {f.type === "list" && (
                    <div className="space-y-2">
                      {(v || []).map((item: string, i: number) => (
                        <div key={i} className="flex gap-2"><input className={input} value={item} onChange={(e) => set(f.name, (v as string[]).map((x, k) => (k === i ? e.target.value : x)))} /><button type="button" aria-label="Remove" className="px-3 text-muted hover:text-ink" onClick={() => set(f.name, (v as string[]).filter((_, k) => k !== i))}>✕</button></div>
                      ))}
                      <button type="button" className="text-xs underline" onClick={() => set(f.name, [...(v || []), ""])}>+ Add line</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-8 flex justify-end"><button onClick={save} disabled={busy} className="h-10 bg-ink px-6 text-white disabled:opacity-50">{busy ? "Saving…" : "Save section"}</button></div>
        </Card>
      </div>
    </>
  );
}
