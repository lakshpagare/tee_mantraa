import { z } from "zod";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { ApiError, handler, ok, parseBody, requireAccess } from "@/lib/api";
import { logActivity } from "@/lib/activity";

/** Only SUPER_ADMIN can change roles. Prevents changing your own role (no accidental lock-out). */
export const PATCH = handler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const me = await requireAccess("team");
  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) throw new ApiError(404, "User not found");
  if (id === me.id) throw new ApiError(400, "You cannot change your own role");
  const { role } = await parseBody(req, z.object({ role: z.enum(["USER", "STAFF", "ADMIN", "SUPER_ADMIN"]) }));
  await connectDB();
  const r = await User.updateOne({ _id: id }, { role });
  if (!r.matchedCount) throw new ApiError(404, "User not found");
  logActivity(me, "update", "team", `Changed a user role to ${role}`, id);
  return ok({ ok: true });
});
