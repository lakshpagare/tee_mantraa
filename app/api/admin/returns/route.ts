import { connectDB } from "@/lib/db";
import { ReturnRequest } from "@/models/ReturnRequest";
import { handler, ok, requireAccess } from "@/lib/api";
import { escapeRegex, serialize } from "@/lib/utils";

export const GET = handler(async (req: Request) => {
  await requireAccess("returns");
  const sp = new URL(req.url).searchParams;
  const page = Math.max(1, parseInt(sp.get("page") || "1", 10) || 1);
  const limit = 20;
  const filter: any = {};
  if (sp.get("status")) filter.status = sp.get("status");
  const q = (sp.get("q") || "").trim().slice(0, 60);
  if (q) filter.$or = [{ orderNumber: new RegExp(escapeRegex(q), "i") }, { reason: new RegExp(escapeRegex(q), "i") }];
  await connectDB();
  const [items, total] = await Promise.all([
    ReturnRequest.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate("user", "name email").lean(),
    ReturnRequest.countDocuments(filter),
  ]);
  return ok({ items: serialize(items), total, page, pages: Math.max(1, Math.ceil(total / limit)) });
});
