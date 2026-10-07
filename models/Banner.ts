import { Schema, model, models, type Model } from "mongoose";

const BannerSchema = new Schema(
  {
    title: { type: String, required: true },
    subtitle: String,
    image: { type: String, default: "" },
    ctaText: String,
    ctaLink: String,
    startDate: Date,
    endDate: Date,
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);
BannerSchema.index({ active: 1, startDate: 1, endDate: 1 });

export const Banner: Model<any> = models.Banner || model("Banner", BannerSchema);
