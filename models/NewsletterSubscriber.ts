import { Schema, model, models, type Model } from "mongoose";

const NewsletterSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const NewsletterSubscriber: Model<any> =
  models.NewsletterSubscriber || model("NewsletterSubscriber", NewsletterSchema);
