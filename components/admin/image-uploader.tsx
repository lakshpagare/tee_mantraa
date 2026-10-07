"use client";
import { GripVertical, ImagePlus, Link2, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

/** Multi-image uploader with preview, URL add, and drag-and-drop ordering. First image is the cover. */
export function ImageUploader({ value, onChange, max = 8, single = false }: { value: string[]; onChange: (v: string[]) => void; max?: number; single?: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [url, setUrl] = useState("");
  const limit = single ? 1 : max;

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    const next = [...value];
    for (const file of Array.from(files)) {
      if (next.length >= limit && !single) { toast.error(`Maximum ${limit} images`); break; }
      try {
        const fd = new FormData();
        fd.append("file", file);
        const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        if (single) { next.splice(0, 1, d.url); } else next.push(d.url);
      } catch (e: any) { toast.error(`${file.name}: ${e.message || "upload failed"}`); }
    }
    onChange(next);
    setBusy(false);
    if (input.current) input.current.value = "";
  };

  const move = (from: number, to: number) => {
    if (from === to) return;
    const next = [...value];
    const [m] = next.splice(from, 1);
    next.splice(to, 0, m);
    onChange(next);
  };

  return (
    <div>
      <ul className="flex flex-wrap gap-3">
        {value.map((src, i) => (
          <li key={src + i} draggable={!single} onDragStart={() => setDragIdx(i)} onDragOver={(e) => e.preventDefault()} onDrop={() => { if (dragIdx !== null) move(dragIdx, i); setDragIdx(null); }}
            className="group relative h-28 w-24 cursor-grab border border-line bg-neutral-100 active:cursor-grabbing">
            <img src={src} alt={`Upload ${i + 1}`} className="h-full w-full object-cover" />
            {i === 0 && !single && <span className="absolute left-0 top-0 bg-ink px-1.5 py-0.5 text-[10px] text-white">Cover</span>}
            {!single && <GripVertical className="absolute bottom-1 left-1 h-4 w-4 text-white mix-blend-difference" aria-hidden />}
            <button type="button" aria-label="Remove image" onClick={() => onChange(value.filter((_, k) => k !== i))} className="absolute right-1 top-1 rounded-full bg-white p-0.5 opacity-0 shadow group-hover:opacity-100 focus:opacity-100"><X className="h-3.5 w-3.5" /></button>
          </li>
        ))}
        {(single ? value.length === 0 : value.length < limit) && (
          <li>
            <button type="button" onClick={() => input.current?.click()} disabled={busy} className="flex h-28 w-24 flex-col items-center justify-center gap-1 border border-dashed border-neutral-400 text-xs text-muted hover:border-ink hover:text-ink disabled:opacity-50">
              <ImagePlus className="h-5 w-5" />{busy ? "Uploading…" : "Upload"}
            </button>
          </li>
        )}
      </ul>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple={!single} className="sr-only" onChange={(e) => upload(e.target.files)} aria-label="Upload images" />
      <div className="mt-3 flex max-w-md gap-2">
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="…or paste an image URL / /images/… path" className="h-9 flex-1 border border-line px-3 text-sm" />
        <button type="button" className="flex items-center gap-1 border border-line px-3 text-xs hover:bg-neutral-50" onClick={() => {
          const u = url.trim();
          if (!u || !(u.startsWith("/") || /^https?:\/\//.test(u))) return toast.error("Enter a valid URL or a path starting with /");
          onChange(single ? [u] : [...value, u].slice(0, limit)); setUrl("");
        }}><Link2 className="h-3.5 w-3.5" />Add</button>
      </div>
      {!single && value.length > 1 && <p className="mt-2 text-xs text-muted">Drag images to reorder. The first image is the cover.</p>}
    </div>
  );
}
