"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Img } from "@/components/ui/img";
import { useDebounce } from "@/hooks/use-debounce";
import { useLockScroll } from "@/hooks/use-lock-scroll";
import { useUI } from "@/store/ui";
import { TRENDING_SEARCHES } from "@/lib/constants";
import { formatINR } from "@/lib/utils";

const KEY = "verano-recent-searches";

export function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useUI();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const dq = useDebounce(q.trim(), 250);
  const [res, setRes] = useState<{ products: any[]; categories: any[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  useLockScroll(searchOpen);

  useEffect(() => {
    if (!searchOpen) return;
    try { setRecent(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch { setRecent([]); }
    setTimeout(() => inputRef.current?.focus(), 150);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSearchOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [searchOpen, setSearchOpen]);

  useEffect(() => {
    if (dq.length < 2) { setRes(null); return; }
    const ctrl = new AbortController();
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(dq)}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d) => { setRes(d); setLoading(false); })
      .catch((e) => { if (e.name !== "AbortError") setLoading(false); });
    return () => ctrl.abort();
  }, [dq]);

  const go = (term: string) => {
    const t = term.trim();
    if (!t) return;
    try { localStorage.setItem(KEY, JSON.stringify([t, ...recent.filter((r) => r !== t)].slice(0, 5))); } catch {}
    setSearchOpen(false);
    setQ("");
    router.push(`/shop?q=${encodeURIComponent(t)}`);
  };
  const close = () => setSearchOpen(false);

  return (
    <AnimatePresence>
      {searchOpen && (
        <div className="fixed inset-0 z-[75]">
          <motion.div className="absolute inset-0 bg-black/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close} />
          <motion.div
            role="dialog" aria-modal="true" aria-label="Search" data-lenis-prevent
            className="relative max-h-[92vh] overflow-y-auto bg-white"
            initial={{ y: "-100%" }} animate={{ y: 0 }} exit={{ y: "-100%" }} transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="container-wide py-6 md:py-10">
              <form onSubmit={(e) => { e.preventDefault(); go(q); }} className="flex items-center gap-4 border-b border-ink pb-4" role="search">
                <Search className="h-5 w-5 shrink-0" strokeWidth={1.5} />
                <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products, categories…" aria-label="Search"
                  className="w-full bg-transparent font-display text-3xl outline-none placeholder:text-muted/50 md:text-5xl" autoComplete="off" />
                <button type="button" onClick={close} aria-label="Close search" className="p-2"><X className="h-5 w-5" /></button>
              </form>

              <div className="mt-8 grid gap-10 pb-6 md:grid-cols-[260px_1fr]">
                <div className="space-y-8">
                  {recent.length > 0 && (
                    <div>
                      <p className="eyebrow mb-3">Recent</p>
                      <ul className="space-y-2">{recent.map((r) => <li key={r}><button onClick={() => go(r)} className="link-underline text-sm">{r}</button></li>)}</ul>
                    </div>
                  )}
                  <div>
                    <p className="eyebrow mb-3">Trending</p>
                    <ul className="space-y-2">{TRENDING_SEARCHES.map((r) => <li key={r}><button onClick={() => go(r)} className="link-underline text-sm">{r}</button></li>)}</ul>
                  </div>
                </div>

                <div aria-live="polite">
                  {loading && <p className="text-sm text-muted">Searching…</p>}
                  {!loading && res && res.products.length === 0 && res.categories.length === 0 && (
                    <div><p className="font-display text-3xl">No results for “{dq}”</p><p className="mt-2 text-sm text-muted">Check the spelling or try a broader term like “shirt” or “jeans”.</p></div>
                  )}
                  {res && res.categories.length > 0 && (
                    <div className="mb-8">
                      <p className="eyebrow mb-3">Categories</p>
                      <div className="flex flex-wrap gap-2">
                        {res.categories.map((c) => <Link key={c._id} href={`/shop?category=${c.slug}`} onClick={close} className="border border-line px-4 py-2 text-xs uppercase tracking-[0.16em] hover:border-ink">{c.name}</Link>)}
                      </div>
                    </div>
                  )}
                  {res && res.products.length > 0 && (
                    <div>
                      <p className="eyebrow mb-3">Products</p>
                      <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                        {res.products.map((p) => (
                          <li key={p._id}>
                            <Link href={`/product/${p.slug}`} onClick={close} className="group block">
                              <Img src={p.images?.[0]} alt={p.name} ratio="4/5" sizes="180px" imgClassName="transition-transform duration-700 group-hover:scale-105" />
                              <p className="mt-2 line-clamp-1 text-xs">{p.name}</p>
                              <p className="text-xs text-muted">{formatINR(p.price)}</p>
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <button onClick={() => go(q)} className="link-underline mt-6 text-[11px] uppercase tracking-[0.2em]">View all results</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
