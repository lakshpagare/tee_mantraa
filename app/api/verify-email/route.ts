import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { ApiError, handler, ok } from "@/lib/api";

export const GET = handler(async (req: Request) => {
  const sp = new URL(req.url).searchParams;
  const token = sp.get("token") || "";
  const email = (sp.get("email") || "").toLowerCase();
  if (!token || !email) throw new ApiError(400, "Invalid verification link");
  await connectDB();
  const hash = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({ email }).select("+verifyToken");
  if (!user || user.verifyToken !== hash) throw new ApiError(400, "This verification link is invalid or has already been used");
  user.emailVerified = new Date();
  user.verifyToken = undefined;
  await user.save();
  return ok({ ok: true });
});
