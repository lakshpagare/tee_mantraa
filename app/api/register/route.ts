import bcrypt from "bcryptjs";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { ApiError, handler, ok, parseBody } from "@/lib/api";
import { registerSchema } from "@/lib/validators";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { sendMail } from "@/lib/mail";
import { appUrl } from "@/lib/utils";

export const POST = handler(async (req: Request) => {
  if (!rateLimit(`register:${clientIp(req)}`, 6, 60 * 60_000).ok) throw new ApiError(429, "Too many attempts. Try again later.");
  const { name, email, password } = await parseBody(req, registerSchema);
  await connectDB();
  if (await User.exists({ email })) throw new ApiError(409, "An account with this email already exists");

  const token = crypto.randomBytes(32).toString("hex");
  const verifyToken = crypto.createHash("sha256").update(token).digest("hex");
  // Admins are never created here; use `npm run seed` (see README).
  await User.create({ name, email, passwordHash: await bcrypt.hash(password, 12), verifyToken, role: "USER" });
  const url = `${appUrl()}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
  await sendMail(email, "Verify your email", `<p>Welcome, ${name}! Confirm your email: <a href="${url}">${url}</a></p>`);
  return ok({ ok: true, ...(process.env.NODE_ENV !== "production" ? { devVerifyUrl: url } : {}) }, 201);
});
