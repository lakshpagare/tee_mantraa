import { ApiError, handler, ok, requireAdmin } from "@/lib/api";
import { handleUpload } from "@/lib/upload";

export const POST = handler(async (req: Request) => {
  await requireAdmin();
  const file = (await req.formData()).get("file");
  if (!(file instanceof File)) throw new ApiError(400, "No file uploaded");
  return ok({ url: await handleUpload(file, "verano/catalog") });
});
