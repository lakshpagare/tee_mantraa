import { connectDB } from "@/lib/db";
import { Address } from "@/models/Address";
import { handler, ok, parseBody, requireUser } from "@/lib/api";
import { addressSchema } from "@/lib/validators";
import { serialize } from "@/lib/utils";

export const GET = handler(async () => {
  const u = await requireUser();
  await connectDB();
  return ok({ addresses: serialize(await Address.find({ user: u.id }).sort({ isDefault: -1, createdAt: -1 }).lean()) });
});

export const POST = handler(async (req: Request) => {
  const u = await requireUser();
  const b = await parseBody(req, addressSchema);
  await connectDB();
  const count = await Address.countDocuments({ user: u.id });
  if (count >= 10) return ok({ error: "You can save up to 10 addresses" }, 400);
  const isDefault = b.isDefault || count === 0;
  if (isDefault) await Address.updateMany({ user: u.id }, { isDefault: false });
  const a = await Address.create({ ...b, user: u.id, isDefault });
  return ok({ address: serialize(a.toObject()) }, 201);
});
