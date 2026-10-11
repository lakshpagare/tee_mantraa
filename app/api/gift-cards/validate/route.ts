import { z } from "zod";
import { connectDB } from "@/lib/db";
import { GiftCard } from "@/models/GiftCard";
import { handler, ok, parseBody, requireUser } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";

export const POST = handler(async (req: Request) => {
  const user = await requireUser();
  if (!(await rateLimit(`giftcard:${user.id}`, 15, 60_000)).ok) return ok({ ok: false, error: "Too many attempts. Please wait a moment." }, 429);
  const { code } = await parseBody(req, z.object({ code: z.string().trim().min(3).max(30) }));
  await connectDB();
  const g: any = await GiftCard.findOne({ code: code.toUpperCase() }).lean();
  if (!g || !g.active || g.balance <= 0 || (g.expiryDate && new Date(g.expiryDate) < new Date())) return ok({ ok: false, error: "This gift card is not valid or has no balance" });
  return ok({ ok: true, code: g.code, balance: g.balance });
});
