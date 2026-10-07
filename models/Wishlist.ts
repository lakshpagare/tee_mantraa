import { Schema, model, models, type Model } from "mongoose";

const WishlistSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

export const Wishlist: Model<any> = models.Wishlist || model("Wishlist", WishlistSchema);
