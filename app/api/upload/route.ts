import { ApiError, handler, ok, requireUser } from "@/lib/api";
import { handleUpload } from "@/lib/upload";
import { rateLimit } from "@/lib/rate-limit";

/** Authenticated image upload for review photos. Admin uploads use /api/admin/upload. */
export const POST = handler(async (req: Request) => {
  const user = await requireUser();
  if (!rateLimit(`upload:${user.id}`, 10, 60_000).ok) throw new ApiError(429, "Too many uploads");
  const file = (await req.formData()).get("file");
  if (!(file instanceof File)) throw new ApiError(400, "No file uploaded");
  return ok({ url: await handleUpload(file, "verano/reviews") });
});
