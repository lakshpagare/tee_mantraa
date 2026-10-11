import { Schema, model, models, type Model } from "mongoose";

/** Aggregated search terms for "Trending" and zero-result insights. */
const SearchQuerySchema = new Schema(
  {
    term: { type: String, required: true, unique: true },
    count: { type: Number, default: 0 },
    zero: { type: Number, default: 0 },
    lastAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);

export const SearchQuery: Model<any> = models.SearchQuery || model("SearchQuery", SearchQuerySchema);
