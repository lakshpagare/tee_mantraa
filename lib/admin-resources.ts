import type { Model } from "mongoose";
import type { ZodTypeAny } from "zod";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";
import { Collection } from "@/models/Collection";
import { Coupon } from "@/models/Coupon";
import { Banner } from "@/models/Banner";
import { Testimonial } from "@/models/Testimonial";
import { Review } from "@/models/Review";
import { NewsletterSubscriber } from "@/models/NewsletterSubscriber";
import { GiftCard } from "@/models/GiftCard";
import { BlogPost } from "@/models/BlogPost";
import { Offer } from "@/models/Offer";
import {
  bannerSchema, categorySchema, collectionSchema, couponSchema, newsletterAdminSchema,
  productSchema, reviewModerationSchema, testimonialSchema, giftCardSchema, blogSchema, offerSchema,
} from "@/lib/validators";

export interface ResourceConfig {
  model: Model<any>;
  /** Schema used for create (and full update). null => creation not allowed. */
  create: ZodTypeAny | null;
  update: ZodTypeAny;
  search: string[];
  sort: Record<string, 1 | -1>;
  populate?: any;
  autoSlug?: boolean;
  slugFrom?: string;
  /** Permission section checked server-side. */
  section: string;
  /** CDN/cache tag to revalidate after writes. */
  tag?: string;
  beforeCreate?: (data: any) => void;
}

export const RESOURCES: Record<string, ResourceConfig> = {
  products: { section: "products", tag: "search", model: Product, create: productSchema, update: productSchema, search: ["name", "sku", "slug"], sort: { createdAt: -1 }, populate: { path: "category", select: "name slug" }, autoSlug: true },
  categories: { section: "categories", tag: "catalog", model: Category, create: categorySchema, update: categorySchema, search: ["name", "slug"], sort: { sortOrder: 1 }, autoSlug: true },
  collections: { section: "collections", tag: "catalog", model: Collection, create: collectionSchema, update: collectionSchema, search: ["name", "slug"], sort: { sortOrder: 1 }, autoSlug: true },
  coupons: { section: "coupons", model: Coupon, create: couponSchema, update: couponSchema, search: ["code"], sort: { createdAt: -1 } },
  banners: { section: "banners", model: Banner, create: bannerSchema, update: bannerSchema, search: ["title"], sort: { createdAt: -1 } },
  testimonials: { section: "testimonials", tag: "catalog", model: Testimonial, create: testimonialSchema, update: testimonialSchema, search: ["name", "text"], sort: { sortOrder: 1 } },
  reviews: { section: "reviews", model: Review, create: null, update: reviewModerationSchema, search: ["name", "comment"], sort: { createdAt: -1 }, populate: { path: "product", select: "name slug" } },
  newsletter: { section: "newsletter", model: NewsletterSubscriber, create: null, update: newsletterAdminSchema, search: ["email"], sort: { createdAt: -1 } },
  offers: { section: "offers", tag: "offers", model: Offer, create: offerSchema, update: offerSchema, search: ["name", "label"], sort: { createdAt: -1 } },
  giftcards: { section: "giftcards", model: GiftCard, create: giftCardSchema, update: giftCardSchema, search: ["code", "recipientEmail"], sort: { createdAt: -1 }, beforeCreate: (d) => { if (d.balance === undefined) d.balance = d.initialAmount; } },
  journal: { section: "journal", model: BlogPost, create: blogSchema, update: blogSchema, search: ["title", "slug"], sort: { createdAt: -1 }, autoSlug: true, slugFrom: "title", beforeCreate: (d) => { if (d.published) d.publishedAt = new Date(); } },
};
