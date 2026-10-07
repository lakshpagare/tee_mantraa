import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { Address } from "@/models/Address";
import { ApiError, handler, ok, parseBody, requireUser } from "@/lib/api";
import { addressSchema } from "@/lib/validators";

export const PUT = handler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const u = await requireUser();
  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) throw new ApiError(404, "Address not found");
  const b = await parseBody(req, addressSchema);
  await connectDB();
  if (b.isDefault) await Address.updateMany({ user: u.id }, { isDefault: false });
  const r = await Address.updateOne({ _id: id, user: u.id }, b);
  if (!r.matchedCount) throw new ApiError(404, "Address not found");
  return ok({ ok: true });
});

export const DELETE = handler(async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const u = await requireUser();
  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) throw new ApiError(404, "Address not found");
  await connectDB();
  await Address.deleteOne({ _id: id, user: u.id });
  return ok({ ok: true });
});
