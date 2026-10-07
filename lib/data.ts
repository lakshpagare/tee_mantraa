import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";
import { Collection } from "@/models/Collection";
import { Review } from "@/models/Review";
import { Testimonial } from "@/models/Testimonial";
import { HomepageSection } from "@/models/HomepageSection";
import { SiteSettings } from "@/models/SiteSettings";
import { Banner } from "@/models/Banner";
import { HOMEPAGE_DEFAULTS, type SectionKey } from "@/lib/homepage-defaults";
import { escapeRegex, serialize } from "@/lib/utils";
import { DEFAULT_SETTINGS } from "@/lib/settings-default";
import type { CategoryDTO, CollectionDTO, ProductDTO, ReviewDTO, SiteSettingsDTO, TestimonialDTO } from "@/types";
import { Types } from "mongoose";

/**
 * Data access for server components. Every reader degrades gracefully (returns defaults/empty)
 * if the database is unreachable so pages render an empty state instead of crashing.
 */
async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    await connectDB();
    return await fn();
  } catch (e) {
    console.error("[data]", (e as Error).message);
    return fallback;
  }
}


export const getSettings = (): Promise<SiteSettingsDTO> =>
  safe(async () => {
    const s = await SiteSettings.findOne({ key: "site" }).lean<any>();
    return s ? { ...DEFAULT_SETTINGS, ...serialize(s) } : DEFAULT_SETTINGS;
  }, DEFAULT_SETTINGS);

export const getHomepage = () =>
  safe(async () => {
    const rows = await HomepageSection.find().lean<any[]>();
    const out: Record<string, { enabled: boolean; data: Record<string, any> }> = {};
    for (const k of Object.keys(HOMEPAGE_DEFAULTS) as SectionKey[]) {
      const d = HOMEPAGE_DEFAULTS[k];
      const row = rows.find((r) => r.key === k);
      out[k] = row ? { enabled: row.enabled, data: { ...d.data, ...serialize(row.data || {}) } } : d;
    }
    return out as Record<SectionKey, { enabled: boolean; data: Record<string, any> }>;
  }, HOMEPAGE_DEFAULTS);

export const getCategories = (): Promise<CategoryDTO[]> =>
  safe(async () => serialize(await Category.find({ active: true }).sort({ sortOrder: 1 }).lean<any[]>()), []);

export const getCategoryBySlug = (slug: string): Promise<CategoryDTO | null> =>
  safe(async () => {
    const c = await Category.findOne({ slug, active: true }).lean<any>();
    return c ? serialize(c) : null;
  }, null);

export const getCollections = (): Promise<CollectionDTO[]> =>
  safe(async () => serialize(await Collection.find({ active: true }).sort({ sortOrder: 1 }).select("-products").lean<any[]>()), []);

export const getCollectionBySlug = (slug: string) =>
  safe(async () => {
    const c = await Collection.findOne({ slug, active: true }).lean<any>();
    return c ? (serialize(c) as CollectionDTO & { products: string[] }) : null;
  }, null);

export const getActiveBanner = () =>
  safe(async () => {
    const now = new Date();
    const b = await Banner.findOne({
      active: true,
      $and: [
        { $or: [{ startDate: null }, { startDate: { $exists: false } }, { startDate: { $lte: now } }] },
        { $or: [{ endDate: null }, { endDate: { $exists: false } }, { endDate: { $gte: now } }] },
      ],
    })
      .sort({ createdAt: -1 })
      .lean<any>();
    return b ? serialize(b) : null;
  }, null);

const PRODUCT_FIELDS = "-costPrice";
const populateCat = { path: "category", select: "name slug" };

export const getProductsByIds = (ids: string[]): Promise<ProductDTO[]> =>
  safe(async () => {
    const valid = ids.filter((i) => Types.ObjectId.isValid(i));
    if (!valid.length) return [];
    const docs = await Product.find({ _id: { $in: valid }, published: true }).select(PRODUCT_FIELDS).populate(populateCat).lean<any[]>();
    const order = new Map(valid.map((id, i) => [id, i]));
    docs.sort((a, b) => (order.get(String(a._id)) ?? 0) - (order.get(String(b._id)) ?? 0));
    return serialize(docs);
  }, []);

export const getNewArrivals = (limit = 8, ids: string[] = []): Promise<ProductDTO[]> =>
  safe(async () => {
    if (ids.length) return getProductsByIds(ids);
    const docs = await Product.find({ published: true, newArrival: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select(PRODUCT_FIELDS)
      .populate(populateCat)
      .lean<any[]>();
    return serialize(docs);
  }, []);

export const getBestSellers = (limit = 8, ids: string[] = []): Promise<ProductDTO[]> =>
  safe(async () => {
    if (ids.length) return getProductsByIds(ids);
    const docs = await Product.find({ published: true, bestSeller: true })
      .sort({ sold: -1 })
      .limit(limit)
      .select(PRODUCT_FIELDS)
      .populate(populateCat)
      .lean<any[]>();
    return serialize(docs);
  }, []);

export const getProductBySlug = (slug: string): Promise<ProductDTO | null> =>
  safe(async () => {
    const p = await Product.findOne({ slug, published: true }).select(PRODUCT_FIELDS).populate(populateCat).lean<any>();
    return p ? serialize(p) : null;
  }, null);

export const getRelatedProducts = (product: ProductDTO, limit = 4): Promise<ProductDTO[]> =>
  safe(async () => {
    const catId = typeof product.category === "object" && product.category ? product.category._id : product.category;
    const docs = await Product.find({ published: true, _id: { $ne: product._id }, ...(catId ? { category: catId } : {}) })
      .sort({ bestSeller: -1, sold: -1 })
      .limit(limit)
      .select(PRODUCT_FIELDS)
      .populate(populateCat)
      .lean<any[]>();
    return serialize(docs);
  }, []);

export const getReviews = (productId: string, limit = 20): Promise<{ reviews: ReviewDTO[]; breakdown: number[] }> =>
  safe(
    async () => {
      const pid = new Types.ObjectId(productId);
      const [reviews, agg] = await Promise.all([
        Review.find({ product: pid, status: "APPROVED" }).sort({ featured: -1, createdAt: -1 }).limit(limit).lean<any[]>(),
        Review.aggregate([{ $match: { product: pid, status: "APPROVED" } }, { $group: { _id: "$rating", n: { $sum: 1 } } }]),
      ]);
      const breakdown = [0, 0, 0, 0, 0];
      agg.forEach((a: any) => (breakdown[a._id - 1] = a.n));
      return { reviews: serialize(reviews), breakdown };
    },
    { reviews: [], breakdown: [0, 0, 0, 0, 0] }
  );

export const getTestimonials = (): Promise<TestimonialDTO[]> =>
  safe(async () => serialize(await Testimonial.find({ active: true }).sort({ sortOrder: 1 }).lean<any[]>()), []);

export const getAllProductSlugs = () =>
  safe(async () => serialize(await Product.find({ published: true }).select("slug updatedAt").lean<any[]>()), []);

// ---------- Shop query ----------
export interface ShopParams {
  q?: string; category?: string; gender?: string; size?: string; color?: string; collection?: string;
  min?: string; max?: string; rating?: string; availability?: string; sale?: string; new?: string;
  sort?: string; page?: string;
}

const SORTS: Record<string, any> = {
  featured: { featured: -1, bestSeller: -1, createdAt: -1 },
  newest: { createdAt: -1 },
  "price-low": { price: 1 },
  "price-high": { price: -1 },
  "best-selling": { sold: -1 },
  "top-rated": { rating: -1, reviewCount: -1 },
};
export const PAGE_SIZE = 12;

const list = (v?: string) => (v ? v.split(",").map((s) => s.trim()).filter(Boolean) : []);

export const getShopProducts = (sp: ShopParams) =>
  safe(
    async () => {
      const filter: any = { published: true };
      const and: any[] = [];
      if (sp.q) {
        const rx = new RegExp(escapeRegex(sp.q.slice(0, 60)), "i");
        and.push({ $or: [{ name: rx }, { tags: rx }, { shortDescription: rx }, { subcategory: rx }] });
      }
      if (sp.category) {
        const cats = await Category.find({ slug: { $in: list(sp.category) } }).select("_id").lean<any[]>();
        filter.category = { $in: cats.map((c) => c._id) };
      }
      if (sp.collection) {
        const col = await Collection.findOne({ slug: sp.collection }).select("products").lean<any>();
        filter._id = { $in: col?.products || [] };
      }
      if (sp.gender === "men" || sp.gender === "women") filter.gender = { $in: [sp.gender, "unisex"] };
      if (sp.size) filter.sizes = { $in: list(sp.size) };
      if (sp.color) filter["colors.name"] = { $in: list(sp.color) };
      const min = Number(sp.min), max = Number(sp.max);
      if (sp.min && !Number.isNaN(min)) filter.price = { ...(filter.price || {}), $gte: min };
      if (sp.max && !Number.isNaN(max)) filter.price = { ...(filter.price || {}), $lte: max };
      if (sp.rating && Number(sp.rating) > 0) filter.rating = { $gte: Number(sp.rating) };
      if (sp.availability === "in-stock") and.push({ $expr: { $gt: ["$stock", "$reserved"] } });
      if (sp.sale === "1") and.push({ $expr: { $gt: [{ $ifNull: ["$compareAtPrice", 0] }, "$price"] } });
      if (sp.new === "1") filter.newArrival = true;
      if (and.length) filter.$and = and;

      const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);
      const sort = SORTS[sp.sort || "featured"] || SORTS.featured;
      const [docs, total, colors] = await Promise.all([
        Product.find(filter).sort(sort).skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).select(PRODUCT_FIELDS).populate(populateCat).lean<any[]>(),
        Product.countDocuments(filter),
        Product.aggregate([{ $match: { published: true } }, { $unwind: "$colors" }, { $group: { _id: "$colors.name", hex: { $first: "$colors.hex" } } }, { $sort: { _id: 1 } }]),
      ]);
      return {
        products: serialize(docs) as ProductDTO[],
        total,
        page,
        pages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
        colors: colors.map((c: any) => ({ name: c._id as string, hex: c.hex as string })),
      };
    },
    { products: [] as ProductDTO[], total: 0, page: 1, pages: 1, colors: [] as { name: string; hex: string }[] }
  );
