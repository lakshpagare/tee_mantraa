import { z } from "zod";
import { connectDB } from "@/lib/db";
import { HomepageSection } from "@/models/HomepageSection";
import { ApiError, handler, ok, parseBody, requireAdmin } from "@/lib/api";
import { getHomepage } from "@/lib/data";
import { SECTION_KEYS, SECTION_SCHEMA } from "@/lib/homepage-defaults";
import { revalidatePath } from "next/cache";

const schema = z.object({
  key: z.string(),
  enabled: z.boolean(),
  data: z.record(z.string(), z.any()),
});

export const GET = handler(async () => {
  await requireAdmin();
  return ok({ sections: await getHomepage() });
});

export const PUT = handler(async (req: Request) => {
  await requireAdmin();
  const { key, enabled, data } = await parseBody(req, schema);
  if (!(SECTION_KEYS as string[]).includes(key)) throw new ApiError(400, "Unknown section");
  // Only persist fields declared in the section schema (prevents junk/oversized payloads).
  const allowed = new Set(SECTION_SCHEMA[key as keyof typeof SECTION_SCHEMA].fields.map((f) => f.name));
  const clean: Record<string, any> = {};
  for (const [k, v] of Object.entries(data)) {
    if (!allowed.has(k)) continue;
    if (typeof v === "string" && v.length > 2000) throw new ApiError(422, "Text is too long");
    clean[k] = v;
  }
  await connectDB();
  await HomepageSection.findOneAndUpdate({ key }, { key, enabled, data: clean }, { upsert: true });
  revalidatePath("/");
  return ok({ ok: true });
});
