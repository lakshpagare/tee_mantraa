import { Types } from "mongoose";
import { Review } from "@/models/Review";
import { Product } from "@/models/Product";

export async function recomputeRating(productId: string | Types.ObjectId) {
  const pid = new Types.ObjectId(String(productId));
  const [agg] = await Review.aggregate([
    { $match: { product: pid, status: "APPROVED" } },
    { $group: { _id: null, avg: { $avg: "$rating" }, n: { $sum: 1 } } },
  ]);
  await Product.updateOne({ _id: pid }, { rating: agg ? Math.round(agg.avg * 10) / 10 : 0, reviewCount: agg?.n || 0 });
}
