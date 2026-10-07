import { z } from "zod";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { Wishlist } from "@/models/Wishlist";
import { handler, ok, parseBody, requireUser } from "@/lib/api";

const toggleSchema = z.object({ productId: z.string().length(24) });
const syncSchema = z.object({ ids: z.array(z.string().length(24)).max(200) });

export const GET = handler(async () => {
  const user = await requireUser();
  await connectDB();
  const w = await Wishlist.findOne({ user: user.id }).lean<any>();
  return ok({ ids: (w?.products || []).map(String) });
});

/** Toggle one product. */
export const POST = handler(async (req: Request) => {
  const user = await requireUser();
  const { productId } = await parseBody(req, toggleSchema);
  await connectDB();
  const w: any = (await Wishlist.findOne({ user: user.id })) || new Wishlist({ user: user.id, products: [] });
  const has = w.products.some((p: any) => String(p) === productId);
  w.products = has ? w.products.filter((p: any) => String(p) !== productId) : [...w.products, new Types.ObjectId(productId)];
  await w.save();
  return ok({ ids: w.products.map(String), added: !has });
});

/** Merge a guest wishlist into the account wishlist on login. */
export const PUT = handler(async (req: Request) => {
  const user = await requireUser();
  const { ids } = await parseBody(req, syncSchema);
  await connectDB();
  const w: any = (await Wishlist.findOne({ user: user.id })) || new Wishlist({ user: user.id, products: [] });
  const set = new Set<string>([...w.products.map(String), ...ids]);
  w.products = [...set].map((i) => new Types.ObjectId(i));
  await w.save();
  return ok({ ids: [...set] });
});
