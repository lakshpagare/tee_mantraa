"use client";
import { useEffect, useState } from "react";
import { adminFetch } from "@/components/admin/api";

/** Searchable multi-select of documents from another admin resource (e.g. products). */
export function RefMulti({ resource, value, onChange, max }: { resource: string; value: string[]; onChange: (v: string[]) => void; max?: number }) {
  const [options, setOptions] = useState<{ _id: string; name: string; sku?: string }[]>([]);
  const [q, setQ] = useState("");
  useEffect(() => { adminFetch(`/api/admin/${resource}?limit=200`).then((d) => setOptions(d.items)).catch(() => {}); }, [resource]);
  const shown = options.filter((o) => !q || o.name.toLowerCase().includes(q.toLowerCase()) || o.sku?.toLowerCase().includes(q.toLowerCase()));
  const toggle = (id: string) => onChange(value.includes(id) ? value.filter((v) => v !== id) : max && value.length >= max ? value : [...value, id]);
  return (
    <div className="border border-line">
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" aria-label="Search options" className="h-9 w-full border-b border-line px-3 text-sm" />
      <ul className="max-h-48 overflow-y-auto" data-lenis-prevent>
        {shown.map((o) => (
          <li key={o._id}><label className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm hover:bg-neutral-50"><input type="checkbox" checked={value.includes(o._id)} onChange={() => toggle(o._id)} />{o.name}{o.sku && <span className="text-xs text-muted">· {o.sku}</span>}</label></li>
        ))}
        {!shown.length && <li className="px-3 py-3 text-xs text-muted">No matches</li>}
      </ul>
      <p className="border-t border-line px-3 py-1.5 text-xs text-muted">{value.length} selected{max ? ` (max ${max})` : ""}</p>
    </div>
  );
}
