import { Schema, model, models, type Model } from "mongoose";

const CartSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        size: String,
        color: String,
        quantity: { type: Number, default: 1, min: 1 },
      },
    ],
  },
  { timestamps: true }
);

export const Cart: Model<any> = models.Cart || model("Cart", CartSchema);
