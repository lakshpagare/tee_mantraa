import { unstable_cache } from "next/cache";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";

/**
 * In-app search: typo tolerance, synonyms, prefix matching and weighted ranking, with no external service.
 * Works well up to a few thousand products. For very large catalogues swap in Algolia/Meilisearch/Atlas Search
 * behind searchProducts() — callers only use that function.
 */
const SYNONYMS: string[][] = [
  ["tee", "tees", "tshirt", "tshirts", "t-shirt", "t-shirts", "shirt-tee"],
  ["pants", "pant", "trouser", "trousers", "chino", "chinos", "bottoms"],
  ["jeans", "jean", "denim"],
  ["hoodie", "hoodies", "sweatshirt", "pullover", "hooded"],
  ["jacket", "jackets", "coat", "bomber", "outerwear", "trucker"],
  ["shirt", "shirts"],
  ["cap", "caps", "hat", "hats"],
  ["beanie", "beanies", "woolen"],
  ["bag", "bags", "tote", "totes"],
  ["belt", "belts"],
  ["women", "woman", "womens", "ladies", "female", "girls"],
  ["men", "man", "mens", "male", "boys", "gents"],
];

export const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
const tokens = (s: string) => norm(s).split(" ").filter(Boolean);

function lev(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      rowMin = Math.min(rowMin, cur[j]);
    }
    if (rowMin > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}
const maxEdits = (t: string) => (t.length >= 8 ? 2 : t.length >= 4 ? 1 : 0);

const alternatives = (t: string): string[] => {
  const base = t.endsWith("s") && t.length > 3 ? t.slice(0, -1) : t;
  const set = new Set([t, base]);
  for (const g of SYNONYMS) if (g.includes(t) || g.includes(base)) g.forEach((x) => set.add(norm(x).replace(/ /g, "")));
  return [...set];
};

interface Doc {
  id: string; name: string; slug: string; price: number; compareAtPrice?: number; image?: string; category?: string; categorySlug?: string;
  sold: number; bestSeller: boolean; f: { w: number; t: string[] }[];
}
interface Index { docs: Doc[]; vocab: string[]; categories: { name: string; slug: string }[] }

async function buildIndex(): Promise<Index> {
  await connectDB();
  const prods: any[] = await Product.find({ published: true }).select("name slug price compareAtPrice images tags subcategory shortDescription bestSeller sold gender colors category").populate("category", "name slug").lean();
  const vocab = new Set<string>();
  const cats = new Map<string, { name: string; slug: string }>();
  const docs: Doc[] = prods.map((p) => {
    const cat = p.category?.name || "";
    if (p.category?.slug) cats.set(p.category.slug, { name: cat, slug: p.category.slug });
    const f = [
      { w: 5, t: tokens(p.name) },
      { w: 3, t: tokens(cat) },
      { w: 2, t: tokens([...(p.tags || []), p.subcategory || ""].join(" ")) },
      { w: 2, t: tokens((p.colors || []).map((c: any) => c.name).join(" ")) },
      { w: 1, t: tokens(`${p.gender} ${p.shortDescription || ""}`) },
    ];
    f.slice(0, 4).forEach((x) => x.t.forEach((w) => w.length > 2 && vocab.add(w)));
    return { id: String(p._id), name: p.name, slug: p.slug, price: p.price, compareAtPrice: p.compareAtPrice, image: p.images?.[0], category: cat, categorySlug: p.category?.slug, sold: p.sold || 0, bestSeller: !!p.bestSeller, f };
  });
  return { docs, vocab: [...vocab], categories: [...cats.values()] };
}
const getIndex = unstable_cache(buildIndex, ["search-index-v1"], { tags: ["search", "catalog"], revalidate: 300 });

function scoreDoc(d: Doc, qTokens: string[][]): number {
  let total = 0;
  for (const alts of qTokens) {
    let best = 0;
    for (const field of d.f) {
      for (const ft of field.t) {
        for (const a of alts) {
          let s = 0;
          if (ft === a) s = 1;
          else if (a.length >= 2 && ft.startsWith(a)) s = 0.8;
          else if (a.length >= 4 && ft.length >= 4 && lev(a, ft, maxEdits(a)) <= maxEdits(a)) s = 0.5;
          if (s * field.w > best) best = s * field.w;
        }
      }
    }
    if (best === 0) return 0; // every query word must match something
    total += best;
  }
  return total * (1 + Math.min(d.sold, 400) / 800 + (d.bestSeller ? 0.15 : 0));
}

function correct(q: string, vocab: string[]): string | null {
  const parts = tokens(q);
  let changed = false;
  const out = parts.map((t) => {
    if (vocab.includes(t) || t.length < 4) return t;
    let best: string | null = null, bd = 3;
    for (const v of vocab) { const d = lev(t, v, 2); if (d < bd) { bd = d; best = v; if (d === 1) break; } }
    if (best) { changed = true; return best; }
    return t;
  });
  return changed ? out.join(" ") : null;
}

export interface SearchOutcome { ids: string[]; docs: Doc[]; didYouMean: string | null; categories: { name: string; slug: string }[]; suggestions: string[] }

export async function searchProducts(q: string, limit = 50): Promise<SearchOutcome> {
  const empty: SearchOutcome = { ids: [], docs: [], didYouMean: null, categories: [], suggestions: [] };
  const query = q.trim().slice(0, 60);
  if (norm(query).length < 2) return empty;
  let idx: Index;
  try { idx = await getIndex(); } catch { return empty; }
  const run = (text: string) => {
    const qt = tokens(text).map(alternatives);
    return idx.docs.map((d) => ({ d, s: scoreDoc(d, qt) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s).slice(0, limit).map((x) => x.d);
  };
  let docs = run(query);
  let didYouMean: string | null = null;
  const fixed = correct(query, idx.vocab);
  if (fixed && (docs.length === 0 || docs.length < 3)) {
    const alt = run(fixed);
    if (alt.length > docs.length) { didYouMean = fixed; docs = alt; }
  }
  const nq = norm(query);
  const categories = idx.categories.filter((c) => { const n = norm(c.name); return n.includes(nq) || nq.includes(n) || (nq.length >= 4 && lev(nq, n, 2) <= 2); }).slice(0, 4);
  const suggestions = [...new Set(idx.docs.filter((d) => norm(d.name).split(" ").some((w) => w.startsWith(nq.split(" ").pop() || "~~~")) || norm(d.name).includes(nq)).sort((a, b) => b.sold - a.sold).map((d) => d.name))].slice(0, 5);
  return { ids: docs.map((d) => d.id), docs, didYouMean, categories, suggestions };
}
