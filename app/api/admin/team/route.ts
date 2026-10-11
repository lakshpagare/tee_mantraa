import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { handler, ok, requireAccess } from "@/lib/api";
import { escapeRegex, serialize } from "@/lib/utils";

/** Lists staff/admins; with ?q= also finds any user by name/email so a role can be assigned. */
export const GET = handler(async (req: Request) => {
  await requireAccess("team");
  const q = (new URL(req.url).searchParams.get("q") || "").trim().slice(0, 60);
  await connectDB();
  const filter: any = q ? { $or: [{ name: new RegExp(escapeRegex(q), "i") }, { email: new RegExp(escapeRegex(q), "i") }] } : { role: { $in: ["STAFF", "ADMIN", "SUPER_ADMIN"] } };
  const items = await User.find(filter).sort({ role: 1, createdAt: -1 }).limit(50).select("name email role status createdAt").lean();
  return ok({ items: serialize(items) });
});
