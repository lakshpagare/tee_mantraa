import { Schema, model, models, type Model } from "mongoose";

const CouponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: String,
    type: { type: String, enum: ["PERCENT", "FIXED"], required: true },
    value: { type: Number, required: true, min: 0 },
    minOrder: { type: Number, default: 0 },
    maxDiscount: Number,
    usageLimit: Number,
    perUserLimit: { type: Number, default: 1 },
    usedCount: { type: Number, default: 0 },
    startDate: Date,
    expiryDate: Date,
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Coupon: Model<any> = models.Coupon || model("Coupon", CouponSchema);
