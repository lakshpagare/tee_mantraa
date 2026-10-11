import { z } from "zod";
import { connectDB } from "@/lib/db";
import { handler, ok, parseBody } from "@/lib/api";
import { evaluateOffers } from "@/lib/offers";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const schema = z.object({ items: z.array(z.object({ productId: z.string().length(24), quantity: z.number().int().min(1).max(10) })).min(1).max(40) });

export const POST = handler(async (req: Request) => {
  if (!(await rateLimit(`offers:${clientIp(req)}`, 90, 60_000)).ok) return ok({ discount: 0, offer: null, hint: null }, 429);
  const { items } = await parseBody(req, schema);
  await connectDB();
  return ok(await evaluateOffers(items));
});
