import { connectDB } from "@/lib/db";
import { SiteSettings } from "@/models/SiteSettings";
import { handler, ok, parseBody, requireAdmin } from "@/lib/api";
import { settingsSchema } from "@/lib/validators";
import { getSettings } from "@/lib/data";
import { revalidatePath } from "next/cache";

export const GET = handler(async () => {
  await requireAdmin();
  return ok({ settings: await getSettings() });
});

export const PUT = handler(async (req: Request) => {
  await requireAdmin();
  const data = await parseBody(req, settingsSchema);
  await connectDB();
  await SiteSettings.findOneAndUpdate({ key: "site" }, data, { upsert: true });
  revalidatePath("/", "layout");
  return ok({ ok: true });
});
