import { handler, ok } from "@/lib/api";
import { getProductsByIds, getShopProducts, type ShopParams } from "@/lib/data";

export const GET = handler(async (req: Request) => {
  const sp = new URL(req.url).searchParams;
  const ids = sp.get("ids");
  if (ids) return ok({ products: await getProductsByIds(ids.split(",").slice(0, 60)) });
  const params: ShopParams = Object.fromEntries(sp.entries());
  return ok(await getShopProducts(params));
});
