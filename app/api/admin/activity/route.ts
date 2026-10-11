import { connectDB } from "@/lib/db";
import { ActivityLog } from "@/models/ActivityLog";
import { handler, ok, requireAccess } from "@/lib/api";
import { escapeRegex, serialize } from "@/lib/utils";

export const GET = handler(async (req: Request) => {
  await requireAccess("activity");
  const sp = new URL(req.url).searchParams;
  const page = Math.max(1, parseInt(sp.get("page") || "1", 10) || 1);
  const limit = 30;
  const filter: any = {};
  if (sp.get("resource")) filter.resource = sp.get("resource");
  if (sp.get("action")) filter.action = sp.get("action");
  const q = (sp.get("q") || "").trim().slice(0, 60);
  if (q) filter.$or = [{ summary: new RegExp(escapeRegex(q), "i") }, { userName: new RegExp(escapeRegex(q), "i") }, { userEmail: new RegExp(escapeRegex(q), "i") }];
  await connectDB();
  const [items, total, resources] = await Promise.all([
    ActivityLog.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    ActivityLog.countDocuments(filter),
    ActivityLog.distinct("resource"),
  ]);
  return ok({ items: serialize(items), total, page, pages: Math.max(1, Math.ceil(total / limit)), resources });
});
