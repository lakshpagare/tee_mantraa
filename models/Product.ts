import { Schema, model, models, type Model } from "mongoose";

const ColorSchema = new Schema({ name: { type: String, required: true }, hex: { type: String, default: "#111111" } }, { _id: false });

const ProductSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: "" },
    shortDescription: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    costPrice: { type: Number, min: 0 },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", index: true },
    subcategory: String,
    brand: { type: String, default: "VÉRANO" },
    images: { type: [String], default: [] },
    colors: { type: [ColorSchema], default: [] },
    sizes: { type: [String], default: [] },
    stock: { type: Number, default: 0, min: 0 },
    reserved: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 5, min: 0 },
    material: String,
    fit: String,
    gender: { type: String, enum: ["men", "women", "unisex"], default: "unisex", index: true },
    tags: { type: [String], default: [] },
    featured: { type: Boolean, default: false },
    bestSeller: { type: Boolean, default: false },
    newArrival: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    sold: { type: Number, default: 0 },
  },
  { timestamps: true }
);
ProductSchema.index({ name: "text", tags: "text", shortDescription: "text" });
ProductSchema.index({ published: 1, createdAt: -1 });
ProductSchema.index({ published: 1, price: 1 });
ProductSchema.index({ published: 1, bestSeller: 1, sold: -1 });

export const Product: Model<any> = models.Product || model("Product", ProductSchema);
