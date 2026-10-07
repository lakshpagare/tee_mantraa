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
import {
  bannerSchema, categorySchema, collectionSchema, couponSchema, newsletterAdminSchema,
  productSchema, reviewModerationSchema, testimonialSchema,
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
}

export const RESOURCES: Record<string, ResourceConfig> = {
  products: { model: Product, create: productSchema, update: productSchema, search: ["name", "sku", "slug"], sort: { createdAt: -1 }, populate: { path: "category", select: "name slug" }, autoSlug: true },
  categories: { model: Category, create: categorySchema, update: categorySchema, search: ["name", "slug"], sort: { sortOrder: 1 }, autoSlug: true },
  collections: { model: Collection, create: collectionSchema, update: collectionSchema, search: ["name", "slug"], sort: { sortOrder: 1 }, autoSlug: true },
  coupons: { model: Coupon, create: couponSchema, update: couponSchema, search: ["code"], sort: { createdAt: -1 } },
  banners: { model: Banner, create: bannerSchema, update: bannerSchema, search: ["title"], sort: { createdAt: -1 } },
  testimonials: { model: Testimonial, create: testimonialSchema, update: testimonialSchema, search: ["name", "text"], sort: { sortOrder: 1 } },
  reviews: { model: Review, create: null, update: reviewModerationSchema, search: ["name", "comment"], sort: { createdAt: -1 }, populate: { path: "product", select: "name slug" } },
  newsletter: { model: NewsletterSubscriber, create: null, update: newsletterAdminSchema, search: ["email"], sort: { createdAt: -1 } },
};
