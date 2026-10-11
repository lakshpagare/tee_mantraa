import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { StockAlert } from "@/models/StockAlert";
import { ApiError, handler, ok, parseBody } from "@/lib/api";
import { emailField } from "@/lib/validators";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const POST = handler(async (req: Request) => {
  if (!(await rateLimit(`stockalert:${clientIp(req)}`, 8, 60 * 60_000)).ok) throw new ApiError(429, "Too many requests. Try again later.");
  const { productId, email } = await parseBody(req, z.object({ productId: z.string().length(24), email: emailField }));
  await connectDB();
  if (!(await Product.exists({ _id: productId }))) throw new ApiError(404, "Product not found");
  await StockAlert.updateOne({ product: productId, email }, { product: productId, email }, { upsert: true });
  return ok({ ok: true });
});
