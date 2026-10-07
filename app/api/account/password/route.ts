import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { ApiError, handler, ok, parseBody, requireUser } from "@/lib/api";
import { changePasswordSchema } from "@/lib/validators";

export const POST = handler(async (req: Request) => {
  const u = await requireUser();
  const { current, next } = await parseBody(req, changePasswordSchema);
  await connectDB();
  const user = await User.findById(u.id).select("+passwordHash");
  if (!user?.passwordHash) throw new ApiError(400, "Password sign-in is not enabled for this account");
  if (!(await bcrypt.compare(current, user.passwordHash))) throw new ApiError(400, "Current password is incorrect");
  user.passwordHash = await bcrypt.hash(next, 12);
  await user.save();
  return ok({ ok: true });
});
