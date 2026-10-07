"use server";

import { headers } from "next/headers";
import { connectDB } from "@/lib/db";
import { NewsletterSubscriber } from "@/models/NewsletterSubscriber";
import { newsletterSchema } from "@/lib/validators";
import { rateLimit } from "@/lib/rate-limit";

export async function subscribeNewsletter(email: string): Promise<{ ok: boolean; message: string }> {
  const parsed = newsletterSchema.safeParse({ email });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message || "Enter a valid email address" };
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`newsletter:${ip}`, 5, 60 * 60_000).ok) return { ok: false, message: "Too many attempts. Please try again later." };
  try {
    await connectDB();
    const existing = await NewsletterSubscriber.findOne({ email: parsed.data.email });
    if (existing) {
      if (!existing.active) await NewsletterSubscriber.updateOne({ _id: existing._id }, { active: true });
      return { ok: true, message: "You're already on the list. Thank you!" };
    }
    await NewsletterSubscriber.create({ email: parsed.data.email });
    return { ok: true, message: "Thank you for subscribing. Welcome to the inner circle." };
  } catch (e) {
    console.error("[newsletter]", e);
    return { ok: false, message: "We couldn't subscribe you right now. Please try again." };
  }
}
