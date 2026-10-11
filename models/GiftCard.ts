import { Schema, model, models, type Model } from "mongoose";

const GiftCardSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    initialAmount: { type: Number, required: true, min: 1 },
    balance: { type: Number, required: true, min: 0 },
    recipientEmail: String,
    note: String,
    expiryDate: Date,
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const GiftCard: Model<any> = models.GiftCard || model("GiftCard", GiftCardSchema);
