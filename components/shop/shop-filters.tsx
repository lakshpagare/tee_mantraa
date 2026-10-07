"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { SIZES, SORT_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { CategoryDTO } from "@/types";

const list = (v: string | null) => (v ? v.split(",").filter(Boolean) : []);

export function useShopParams() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) (v === null || v === "" ? next.delete(k) : next.set(k, v));
    next.delete("page");
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };
  const toggleIn = (key: string, value: string) => {
    const cur = list(sp.get(key));
    update({ [key]: (cur.includes(value) ? cur.filter((c) => c !== value) : [...cur, value]).join(",") || null });
  };
  return { sp, update, toggleIn, pathname, router };
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-b border-line py-6">
      <legend className="mb-4 float-left w-full text-[11px] font-medium uppercase tracking-[0.2em]">{title}</legend>
      <div className="clear-both">{children}</div>
    </fieldset>
  );
}

function FilterBody({ categories, colors, lockedCategory }: { categories: CategoryDTO[]; colors: { name: string; hex: string }[]; lockedCategory?: boolean }) {
  const { sp, update, toggleIn } = useShopParams();
  const [min, setMin] = useState(sp.get("min") || "");
  const [max, setMax] = useState(sp.get("max") || "");
  const sel = (k: string) => list(sp.get(k));
  const check = "h-4 w-4 accent-black";

  return (
    <div>
      {!lockedCategory && (
        <Group title="Category">
          <ul className="space-y-2.5">
            {categories.filter((c) => c.slug !== "new-arrivals").map((c) => (
              <li key={c._id}><label className="flex cursor-pointer items-center gap-3 text-sm"><input type="checkbox" className={check} checked={sel("category").includes(c.slug)} onChange={() => toggleIn("category", c.slug)} />{c.name}</label></li>
            ))}
          </ul>
        </Group>
      )}
      <Group title="Gender">
        <div className="flex gap-2">
          {[["", "All"], ["men", "Men"], ["women", "Women"]].map(([v, l]) => (
            <button key={l} type="button" onClick={() => update({ gender: v || null })} aria-pressed={(sp.get("gender") || "") === v}
              className={cn("h-9 flex-1 border text-xs", (sp.get("gender") || "") === v ? "border-ink bg-ink text-white" : "border-line hover:border-ink")}>{l}</button>
          ))}
        </div>
      </Group>
      <Group title="Size">
        <div className="flex flex-wrap gap-2">
          {[...SIZES, "28", "30", "32", "34", "36"].map((s) => (
            <button key={s} type="button" aria-pressed={sel("size").includes(s)} onClick={() => toggleIn("size", s)}
              className={cn("h-9 min-w-10 border px-2 text-xs", sel("size").includes(s) ? "border-ink bg-ink text-white" : "border-line hover:border-ink")}>{s}</button>
          ))}
        </div>
      </Group>
      {colors.length > 0 && (
        <Group title="Colour">
          <div className="flex flex-wrap gap-3">
            {colors.map((c) => (
              <button key={c.name} type="button" title={c.name} aria-label={c.name} aria-pressed={sel("color").includes(c.name)} onClick={() => toggleIn("color", c.name)}
                className={cn("h-7 w-7 rounded-full border border-line", sel("color").includes(c.name) && "ring-1 ring-ink ring-offset-2")} style={{ backgroundColor: c.hex }} />
            ))}
          </div>
        </Group>
      )}
      <Group title="Price (₹)">
        <form className="flex items-center gap-2" onSubmit={(e) => { e.preventDefault(); update({ min: min || null, max: max || null }); }}>
          <input aria-label="Minimum price" inputMode="numeric" placeholder="Min" value={min} onChange={(e) => setMin(e.target.value.replace(/\D/g, ""))} className="h-10 w-full border border-line px-3 text-sm" />
          <span>–</span>
          <input aria-label="Maximum price" inputMode="numeric" placeholder="Max" value={max} onChange={(e) => setMax(e.target.value.replace(/\D/g, ""))} className="h-10 w-full border border-line px-3 text-sm" />
          <Button size="sm" type="submit">Go</Button>
        </form>
      </Group>
      <Group title="Rating">
        <ul className="space-y-2.5">
          {["4", "3"].map((r) => (
            <li key={r}><label className="flex cursor-pointer items-center gap-3 text-sm"><input type="radio" name="rating" className={check} checked={sp.get("rating") === r} onChange={() => update({ rating: r })} />{r}★ &amp; up</label></li>
          ))}
          {sp.get("rating") && <li><button className="link-underline text-xs text-muted" onClick={() => update({ rating: null })}>Clear</button></li>}
        </ul>
      </Group>
      <Group title="Availability">
        <label className="flex cursor-pointer items-center gap-3 text-sm"><input type="checkbox" className={check} checked={sp.get("availability") === "in-stock"} onChange={(e) => update({ availability: e.target.checked ? "in-stock" : null })} />In stock only</label>
      </Group>
    </div>
  );
}

export function ShopToolbar({ total, categories, colors, lockedCategory }: { total: number; categories: CategoryDTO[]; colors: { name: string; hex: string }[]; lockedCategory?: boolean }) {
  const { sp, update, pathname, router } = useShopParams();
  const [open, setOpen] = useState(false);
  const chips: { label: string; clear: () => void }[] = [];
  const add = (key: string, fmt: (v: string) => string) => list(sp.get(key)).forEach((v) => chips.push({ label: fmt(v), clear: () => update({ [key]: list(sp.get(key)).filter((x) => x !== v).join(",") || null }) }));
  if (!lockedCategory) add("category", (v) => v.replace(/-/g, " "));
  add("size", (v) => `Size ${v}`); add("color", (v) => v);
  if (sp.get("q")) chips.push({ label: `“${sp.get("q")}”`, clear: () => update({ q: null }) });
  if (sp.get("gender")) chips.push({ label: sp.get("gender")!, clear: () => update({ gender: null }) });
  if (sp.get("min") || sp.get("max")) chips.push({ label: `₹${sp.get("min") || 0} – ${sp.get("max") || "∞"}`, clear: () => update({ min: null, max: null }) });
  if (sp.get("rating")) chips.push({ label: `${sp.get("rating")}★ & up`, clear: () => update({ rating: null }) });
  if (sp.get("availability")) chips.push({ label: "In stock", clear: () => update({ availability: null }) });
  if (sp.get("sale")) chips.push({ label: "Sale", clear: () => update({ sale: null }) });
  if (sp.get("new")) chips.push({ label: "New arrivals", clear: () => update({ new: null }) });

  return (
    <>
      <div className="sticky top-16 z-30 -mx-5 flex items-center justify-between border-y border-line bg-white/95 px-5 py-3 backdrop-blur md:top-[68px] md:-mx-10 md:px-10 lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
        <button onClick={() => setOpen(true)} className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] lg:hidden"><SlidersHorizontal className="h-4 w-4" />Filters</button>
        <p className="hidden text-sm text-muted lg:block" aria-live="polite">{total} {total === 1 ? "product" : "products"}</p>
        <div className="flex items-center gap-3">
          <label htmlFor="sort" className="hidden text-[11px] uppercase tracking-[0.2em] text-muted sm:block">Sort by</label>
          <select id="sort" value={sp.get("sort") || "featured"} onChange={(e) => update({ sort: e.target.value === "featured" ? null : e.target.value })} className="h-10 border border-line bg-white px-3 text-sm">
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {chips.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {chips.map((c, i) => (
            <button key={i} onClick={c.clear} className="flex items-center gap-1.5 border border-line px-3 py-1.5 text-xs capitalize hover:border-ink">{c.label}<X className="h-3 w-3" /></button>
          ))}
          <button onClick={() => router.push(pathname, { scroll: false })} className="link-underline ml-2 text-xs text-muted">Clear all</button>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Filters" side className="max-w-sm">
        <div className="p-6 pt-14"><FilterBody categories={categories} colors={colors} lockedCategory={lockedCategory} /><Button className="mt-6 w-full" onClick={() => setOpen(false)}>Show {total} results</Button></div>
      </Modal>
    </>
  );
}

export function ShopSidebar(props: { categories: CategoryDTO[]; colors: { name: string; hex: string }[]; lockedCategory?: boolean }) {
  return <aside className="hidden w-64 shrink-0 lg:block" aria-label="Filters"><p className="eyebrow mb-2 !text-ink">Filters</p><FilterBody {...props} /></aside>;
}
