import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { handler, ok, parseBody, requireUser } from "@/lib/api";
import { profileSchema } from "@/lib/validators";
import { serialize } from "@/lib/utils";

export const GET = handler(async () => {
  const u = await requireUser();
  await connectDB();
  const user = await User.findById(u.id).select("name email phone image provider emailVerified createdAt").lean();
  return ok({ user: serialize(user) });
});

export const PUT = handler(async (req: Request) => {
  const u = await requireUser();
  const b = await parseBody(req, profileSchema);
  await connectDB();
  await User.updateOne({ _id: u.id }, { name: b.name, phone: b.phone });
  return ok({ ok: true });
});
