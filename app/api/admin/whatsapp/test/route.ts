import { z } from "zod";
import { ApiError, handler, ok, parseBody, requireAdmin } from "@/lib/api";
import { normalizePhone, sendWhatsAppText, whatsappConfigured } from "@/lib/whatsapp";

/** Sends a test message so you can verify the WhatsApp Business API setup. (Free-text only works inside Meta's 24h window.) */
export const POST = handler(async (req: Request) => {
  await requireAdmin();
  const { to } = await parseBody(req, z.object({ to: z.string().min(8).max(20) }));
  if (!whatsappConfigured()) throw new ApiError(503, "WhatsApp Business API isn't configured. Set WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID.");
  const phone = normalizePhone(to);
  if (!phone) throw new ApiError(422, "Enter a valid phone number");
  try {
    await sendWhatsAppText(phone, "Test message from your store: WhatsApp Business API is connected ✅");
  } catch (e: any) {
    throw new ApiError(502, `WhatsApp rejected the message. ${String(e?.message || "").slice(0, 200)} — if the recipient hasn't messaged you in the last 24 hours, use an approved template or ask them to message your number first.`);
  }
  return ok({ ok: true });
});
