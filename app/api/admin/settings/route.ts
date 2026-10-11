import { connectDB } from "@/lib/db";
import { SiteSettings } from "@/models/SiteSettings";
import { handler, ok, parseBody, requireAdmin } from "@/lib/api";
import { settingsSchema } from "@/lib/validators";
import { getSettings } from "@/lib/data";
import { revalidatePath, revalidateTag } from "next/cache";
import { logActivity } from "@/lib/activity";

export const GET = handler(async () => {
  await requireAdmin();
  return ok({ settings: await getSettings() });
});

export const PUT = handler(async (req: Request) => {
  const actor = await requireAdmin();
  const data = await parseBody(req, settingsSchema);
  await connectDB();
  await SiteSettings.findOneAndUpdate({ key: "site" }, data, { upsert: true });
  logActivity(actor, "settings", "settings", "Updated store settings");
  revalidateTag("settings");
  revalidatePath("/", "layout");
  return ok({ ok: true });
});
