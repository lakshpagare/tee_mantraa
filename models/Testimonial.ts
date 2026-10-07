import { Schema, model, models, type Model } from "mongoose";

const TestimonialSchema = new Schema(
  {
    name: { type: String, required: true },
    product: String,
    rating: { type: Number, default: 5, min: 1, max: 5 },
    text: { type: String, required: true },
    verified: { type: Boolean, default: true },
    active: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);
TestimonialSchema.index({ active: 1, sortOrder: 1 });

export const Testimonial: Model<any> = models.Testimonial || model("Testimonial", TestimonialSchema);
