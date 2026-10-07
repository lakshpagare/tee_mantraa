import bcrypt from "bcryptjs";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { ApiError, handler, ok, parseBody } from "@/lib/api";
import { resetSchema } from "@/lib/validators";

export const POST = handler(async (req: Request) => {
  const { token, email, password } = await parseBody(req, resetSchema);
  await connectDB();
  const hash = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({ email }).select("+resetToken +resetExpires");
  if (!user || user.resetToken !== hash || !user.resetExpires || user.resetExpires < new Date()) {
    throw new ApiError(400, "This reset link is invalid or has expired");
  }
  user.passwordHash = await bcrypt.hash(password, 12);
  user.resetToken = undefined;
  user.resetExpires = undefined;
  await user.save();
  return ok({ ok: true });
});
