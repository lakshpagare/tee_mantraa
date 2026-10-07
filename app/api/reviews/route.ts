import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { Review } from "@/models/Review";
import { Product } from "@/models/Product";
import { Order } from "@/models/Order";
import { ApiError, handler, ok, parseBody, requireUser } from "@/lib/api";
import { reviewSchema } from "@/lib/validators";
import { recomputeRating } from "@/lib/reviews";
import { rateLimit } from "@/lib/rate-limit";

export const POST = handler(async (req: Request) => {
  const user = await requireUser();
  if (!rateLimit(`review:${user.id}`, 10, 60 * 60_000).ok) throw new ApiError(429, "Too many reviews. Try again later.");
  const b = await parseBody(req, reviewSchema);
  await connectDB();
  if (!(await Product.exists({ _id: b.productId }))) throw new ApiError(404, "Product not found");
  if (await Review.exists({ product: b.productId, user: user.id })) throw new ApiError(409, "You have already reviewed this product");

  const purchased = !!(await Order.exists({
    user: user.id,
    "items.product": new Types.ObjectId(b.productId),
    status: { $nin: ["Pending", "Cancelled", "Returned"] },
  }));
  const review = await Review.create({
    product: b.productId, user: user.id, name: user.name || "Customer", rating: b.rating, title: b.title,
    comment: b.comment, image: b.image, verified: purchased,
    // Verified purchasers are published immediately; everyone else is moderated first.
    status: purchased ? "APPROVED" : "PENDING",
  });
  if (purchased) await recomputeRating(b.productId);
  return ok({ ok: true, status: review.status, verified: purchased }, 201);
});
