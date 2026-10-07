import { Schema, model, models, type Model } from "mongoose";

const HomepageSectionSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    enabled: { type: Boolean, default: true },
    data: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const HomepageSection: Model<any> = models.HomepageSection || model("HomepageSection", HomepageSectionSchema);
