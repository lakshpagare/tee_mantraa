"use client";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { adminFetch } from "@/components/admin/api";
import { ImageUploader } from "@/components/admin/image-uploader";
import { RefMulti } from "@/components/admin/ref-multi";
import { Card, PageHeader, Pagination } from "@/components/admin/ui";
import { Modal } from "@/components/ui/modal";
import { Switch } from "@/components/ui/form";
import { TableSkeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type FieldDef = {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "switch" | "select" | "date" | "images" | "image" | "tags" | "colors" | "refselect" | "multiref";
  options?: { value: string; label: string }[];
  refResource?: string;
  hint?: string;
  full?: boolean;
  required?: boolean;
};
export type ColumnDef = { key: string; label: string; render?: (row: any) => ReactNode; className?: string };

interface Props {
  resource: string;
  title: string;
  singular: string;
  description?: string;
  columns: ColumnDef[];
  fields: FieldDef[];
  defaults?: Record<string, any>;
  canCreate?: boolean;
  canDelete?: boolean;
  statusFilter?: { value: string; label: string }[];
  rowActions?: (row: any, reload: () => void) => ReactNode;
  toolbarExtra?: ReactNode | ((items: any[]) => ReactNode);
}

const inputCls = "h-10 w-full border border-line bg-white px-3 text-sm focus:border-ink focus:outline-none";
const toDateInput = (v: any) => (v ? new Date(v).toISOString().slice(0, 10) : "");

function ColorsEditor({ value, onChange }: { value: { name: string; hex: string }[]; onChange: (v: { name: string; hex: string }[]) => void }) {
  return (
    <div className="space-y-2">
      {value.map((c, i) => (
        <div key={i} className="flex items-center gap-2">
          <input type="color" aria-label="Colour" value={c.hex} onChange={(e) => onChange(value.map((x, k) => (k === i ? { ...x, hex: e.target.value } : x)))} className="h-10 w-12 border border-line" />
          <input value={c.name} placeholder="Colour name" onChange={(e) => onChange(value.map((x, k) => (k === i ? { ...x, name: e.target.value } : x)))} className={inputCls} />
          <button type="button" aria-label="Remove colour" onClick={() => onChange(value.filter((_, k) => k !== i))} className="p-2 text-muted hover:text-ink"><Trash2 className="h-4 w-4" /></button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...value, { name: "", hex: "#111111" }])} className="text-xs underline">+ Add colour</button>
    </div>
  );
}

function TagsEditor({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [text, setText] = useState("");
  const add = () => { const t = text.trim(); if (t && !value.includes(t)) onChange([...value, t]); setText(""); };
  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-1.5">{value.map((t) => <span key={t} className="flex items-center gap-1 bg-neutral-100 px-2 py-1 text-xs">{t}<button type="button" aria-label={`Remove ${t}`} onClick={() => onChange(value.filter((v) => v !== t))}>×</button></span>)}</div>
      <input value={text} placeholder={placeholder || "Type and press Enter"} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } }} onBlur={add} className={inputCls} />
    </div>
  );
}

function RefSelect({ resource, value, onChange }: { resource: string; value: string; onChange: (v: string) => void }) {
  const [opts, setOpts] = useState<any[]>([]);
  useEffect(() => { adminFetch(`/api/admin/${resource}?limit=200`).then((d) => setOpts(d.items)).catch(() => {}); }, [resource]);
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
      <option value="">— None —</option>
      {opts.map((o) => <option key={o._id} value={o._id}>{o.name}</option>)}
    </select>
  );
}

export function ResourceManager({ resource, title, singular, description, columns, fields, defaults = {}, canCreate = true, canDelete = true, statusFilter, rowActions, toolbarExtra }: Props) {
  const [items, setItems] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1 });
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<any | null>(null); // null closed, {} new, {_id} edit
  const [values, setValues] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState<any | null>(null);

  const load = useCallback(async (page = 1, query = q, st = status) => {
    setLoading(true); setError("");
    try {
      const d = await adminFetch(`/api/admin/${resource}?page=${page}&limit=20&q=${encodeURIComponent(query)}${st ? `&status=${st}` : ""}`);
      setItems(d.items); setMeta({ total: d.total, page: d.page, pages: d.pages });
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource]);

  useEffect(() => { const t = setTimeout(() => load(1, q, status), 300); return () => clearTimeout(t); }, [q, status, load]);

  const openForm = (row?: any) => {
    const base: Record<string, any> = { ...defaults };
    if (row) {
      for (const f of fields) {
        let v = row[f.name];
        if (f.type === "refselect") v = typeof v === "object" && v ? v._id : v || "";
        if (f.type === "multiref") v = (v || []).map((x: any) => (typeof x === "object" ? x._id : x));
        if (f.type === "date") v = toDateInput(v);
        if (v !== undefined) base[f.name] = v;
      }
      base._id = row._id;
    }
    setValues(base); setEditing(row || {});
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Record<string, any> = {};
      for (const f of fields) {
        let v = values[f.name];
        if (f.type === "number") v = v === "" || v === undefined ? undefined : Number(v);
        payload[f.name] = v;
      }
      if (values._id) await adminFetch(`/api/admin/${resource}/${values._id}`, "PUT", payload);
      else await adminFetch(`/api/admin/${resource}`, "POST", payload);
      toast.success(`${singular} saved`);
      setEditing(null);
      load(meta.page);
    } catch (err: any) { toast.error(err.message); } finally { setSaving(false); }
  };

  const del = async () => {
    if (!confirmDel) return;
    try { await adminFetch(`/api/admin/${resource}/${confirmDel._id}`, "DELETE"); toast.success(`${singular} deleted`); setConfirmDel(null); load(meta.page); }
    catch (err: any) { toast.error(err.message); }
  };

  const set = (name: string, v: any) => setValues((s) => ({ ...s, [name]: v }));
  const label = (f: FieldDef) => <span className="mb-1.5 block text-xs font-medium text-neutral-600">{f.label}{f.required && " *"}</span>;
  const canEdit = fields.length > 0;

  return (
    <>
      <PageHeader title={title} description={description ?? `${meta.total} total`} actions={<>
        {typeof toolbarExtra === "function" ? toolbarExtra(items) : toolbarExtra}
        {canCreate && <button onClick={() => openForm()} className="flex h-10 items-center gap-2 bg-ink px-4 text-sm text-white hover:bg-neutral-800"><Plus className="h-4 w-4" />New {singular.toLowerCase()}</button>}
      </>} />
      <Card>
        <div className="flex flex-wrap gap-3 border-b border-line p-4">
          <div className="relative min-w-[220px] flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-muted" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${title.toLowerCase()}…`} aria-label="Search" className={cn(inputCls, "pl-9")} /></div>
          {statusFilter && <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter" className={cn(inputCls, "w-44")}><option value="">All</option>{statusFilter.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select>}
        </div>
        {loading ? <TableSkeleton cols={columns.length} /> : error ? (
          <div className="p-10 text-center text-sm"><p className="text-red-600">{error}</p><button onClick={() => load(meta.page)} className="mt-3 underline">Retry</button></div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted">Nothing here yet.{canCreate && <> <button className="underline text-ink" onClick={() => openForm()}>Create the first {singular.toLowerCase()}</button>.</>}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead><tr className="border-b border-line text-xs uppercase tracking-wider text-muted">{columns.map((c) => <th key={c.key} className={cn("px-5 py-3 font-medium", c.className)}>{c.label}</th>)}<th className="px-5 py-3 text-right font-medium">Actions</th></tr></thead>
              <tbody className="divide-y divide-line">
                {items.map((row) => (
                  <tr key={row._id} className="hover:bg-neutral-50/70">
                    {columns.map((c) => <td key={c.key} className={cn("px-5 py-3 align-middle", c.className)}>{c.render ? c.render(row) : String(row[c.key] ?? "—")}</td>)}
                    <td className="whitespace-nowrap px-5 py-3 text-right">
                      <span className="inline-flex items-center gap-1">
                        {rowActions?.(row, () => load(meta.page))}
                        {canEdit && <button aria-label="Edit" onClick={() => openForm(row)} className="p-2 hover:bg-neutral-100"><Pencil className="h-4 w-4" /></button>}
                        {canDelete && <button aria-label="Delete" onClick={() => setConfirmDel(row)} className="p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={meta.page} pages={meta.pages} onChange={(p) => load(p)} />
      </Card>

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={`${values._id ? "Edit" : "New"} ${singular}`} side className="max-w-2xl">
        <form onSubmit={save} className="flex h-full flex-col font-sans text-sm">
          <div className="border-b border-line px-6 py-5 pr-14"><h2 className="text-lg font-semibold">{values._id ? "Edit" : "New"} {singular.toLowerCase()}</h2></div>
          <div className="grid flex-1 gap-5 overflow-y-auto p-6 sm:grid-cols-2" data-lenis-prevent>
            {fields.map((f) => {
              const full = f.full || ["textarea", "images", "image", "tags", "colors", "multiref"].includes(f.type);
              const v = values[f.name];
              return (
                <div key={f.name} className={full ? "sm:col-span-2" : ""}>
                  {f.type === "switch" ? (
                    <div className="flex items-center justify-between border border-line px-3 py-2.5"><span className="text-xs font-medium text-neutral-600">{f.label}</span><Switch checked={!!v} onChange={(x) => set(f.name, x)} label={f.label} /></div>
                  ) : (
                    <label className="block">
                      {label(f)}
                      {f.type === "text" && <input className={inputCls} value={v ?? ""} onChange={(e) => set(f.name, e.target.value)} required={f.required} />}
                      {f.type === "number" && <input type="number" step="any" min={0} className={inputCls} value={v ?? ""} onChange={(e) => set(f.name, e.target.value)} required={f.required} />}
                      {f.type === "date" && <input type="date" className={inputCls} value={v ?? ""} onChange={(e) => set(f.name, e.target.value)} />}
                      {f.type === "textarea" && <textarea rows={4} className="w-full border border-line p-3 text-sm focus:border-ink focus:outline-none" value={v ?? ""} onChange={(e) => set(f.name, e.target.value)} />}
                      {f.type === "select" && <select className={inputCls} value={v ?? ""} onChange={(e) => set(f.name, e.target.value)}>{f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>}
                      {f.type === "refselect" && <RefSelect resource={f.refResource!} value={v || ""} onChange={(x) => set(f.name, x)} />}
                    </label>
                  )}
                  {f.type === "images" && <div>{label(f)}<ImageUploader value={v || []} onChange={(x) => set(f.name, x)} max={12} /></div>}
                  {f.type === "image" && <div>{label(f)}<ImageUploader single value={v ? [v] : []} onChange={(x) => set(f.name, x[0] || "")} /></div>}
                  {f.type === "tags" && <div>{label(f)}<TagsEditor value={v || []} onChange={(x) => set(f.name, x)} /></div>}
                  {f.type === "colors" && <div>{label(f)}<ColorsEditor value={v || []} onChange={(x) => set(f.name, x)} /></div>}
                  {f.type === "multiref" && <div>{label(f)}<RefMulti resource={f.refResource!} value={v || []} onChange={(x) => set(f.name, x)} /></div>}
                  {f.hint && <p className="mt-1 text-xs text-muted">{f.hint}</p>}
                </div>
              );
            })}
          </div>
          <div className="flex justify-end gap-3 border-t border-line p-4">
            <button type="button" onClick={() => setEditing(null)} className="h-10 border border-line px-5 hover:bg-neutral-50">Cancel</button>
            <button type="submit" disabled={saving} className="h-10 bg-ink px-6 text-white hover:bg-neutral-800 disabled:opacity-50">{saving ? "Saving…" : "Save"}</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!confirmDel} onClose={() => setConfirmDel(null)} title="Confirm delete" className="max-w-md">
        <div className="p-6 font-sans text-sm"><h2 className="text-lg font-semibold">Delete this {singular.toLowerCase()}?</h2><p className="mt-2 text-muted">This cannot be undone.</p>
          <div className="mt-6 flex justify-end gap-3"><button onClick={() => setConfirmDel(null)} className="h-10 border border-line px-5">Cancel</button><button onClick={del} className="h-10 bg-red-700 px-5 text-white">Delete</button></div>
        </div>
      </Modal>
    </>
  );
}
