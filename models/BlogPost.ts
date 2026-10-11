import { Schema, model, models, type Model } from "mongoose";

const BlogPostSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    excerpt: { type: String, default: "" },
    content: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    author: { type: String, default: "The Studio" },
    tags: { type: [String], default: [] },
    published: { type: Boolean, default: false },
    publishedAt: Date,
  },
  { timestamps: true }
);
BlogPostSchema.index({ published: 1, publishedAt: -1 });

export const BlogPost: Model<any> = models.BlogPost || model("BlogPost", BlogPostSchema);
