import { Schema, model, models, type Model } from "mongoose";

const CollectionSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    active: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);
CollectionSchema.index({ active: 1, sortOrder: 1 });

export const Collection: Model<any> = models.Collection || model("Collection", CollectionSchema);
