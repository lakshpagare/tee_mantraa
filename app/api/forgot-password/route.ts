import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { ApiError, handler, ok, parseBody } from "@/lib/api";
import { forgotSchema } from "@/lib/validators";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { sendMail } from "@/lib/mail";
import { appUrl } from "@/lib/utils";

export const POST = handler(async (req: Request) => {
  if (!rateLimit(`forgot:${clientIp(req)}`, 5, 60 * 60_000).ok) throw new ApiError(429, "Too many requests. Try again later.");
  const { email } = await parseBody(req, forgotSchema);
  await connectDB();
  const user = await User.findOne({ email });
  let devUrl: string | undefined;
  if (user && user.provider === "credentials") {
    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = crypto.createHash("sha256").update(token).digest("hex");
    user.resetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();
    devUrl = `${appUrl()}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
    await sendMail(email, "Reset your password", `<p>Reset your password (valid for 1 hour): <a href="${devUrl}">${devUrl}</a></p>`);
  }
  // Same response either way so accounts cannot be enumerated.
  return ok({ ok: true, ...(process.env.NODE_ENV !== "production" && devUrl ? { devResetUrl: devUrl } : {}) });
});
