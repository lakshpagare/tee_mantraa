import { Schema, model, models, type Model } from "mongoose";

/** Short shareable snapshot of a wishlist: /w/<code> */
const SharedWishlistSchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    ids: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    ownerName: String,
    user: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);
SharedWishlistSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 }); // links expire after 90 days

export const SharedWishlist: Model<any> = models.SharedWishlist || model("SharedWishlist", SharedWishlistSchema);
