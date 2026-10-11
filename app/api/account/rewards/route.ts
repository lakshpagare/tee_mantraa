import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { handler, ok, requireUser } from "@/lib/api";
import { appUrl } from "@/lib/utils";

export const GET = handler(async () => {
  const u = await requireUser();
  await connectDB();
  let user: any = await User.findById(u.id).select("points referralCode");
  if (user && !user.referralCode) {
    // Lazily issue a code (covers Google sign-ups and accounts created before referrals existed).
    for (let i = 0; i < 5 && !user.referralCode; i++) {
      const code = crypto.randomBytes(4).toString("hex").slice(0, 6).toUpperCase();
      try { user = await User.findOneAndUpdate({ _id: u.id, referralCode: { $exists: false } }, { referralCode: code }, { new: true }) || user; } catch { /* duplicate: retry */ }
    }
  }
  const referred = await User.countDocuments({ referredBy: u.id });
  return ok({ points: user?.points || 0, referralCode: user?.referralCode || null, referred, shareUrl: user?.referralCode ? `${appUrl()}/register?ref=${user.referralCode}` : null });
});
