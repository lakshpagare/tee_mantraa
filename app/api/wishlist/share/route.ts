import crypto from "crypto";
import { z } from "zod";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { SharedWishlist } from "@/models/SharedWishlist";
import { ApiError, handler, ok, parseBody } from "@/lib/api";
import { appUrl } from "@/lib/utils";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789"; // no look-alikes (l, o, 0, 1)
const shortCode = (n = 6) => Array.from(crypto.randomBytes(n), (b) => ALPHABET[b % ALPHABET.length]).join("");

/** Creates a short link (https://site/w/abc123) to a snapshot of the wishlist. Works for guests too. */
export const POST = handler(async (req: Request) => {
  if (!(await rateLimit(`wshare:${clientIp(req)}`, 12, 60 * 60_000)).ok) throw new ApiError(429, "Too many share links. Try again later.");
  const { ids } = await parseBody(req, z.object({ ids: z.array(z.string().length(24)).min(1, "Your wishlist is empty").max(60) }));
  const session = await auth();
  await connectDB();
  for (let i = 0; i < 5; i++) {
    const code = shortCode();
    try {
      await SharedWishlist.create({ code, ids, ownerName: session?.user?.name?.split(" ")[0], user: session?.user?.id });
      return ok({ code, url: `${appUrl()}/w/${code}` }, 201);
    } catch (e: any) {
      if (e?.code !== 11000) throw e;
    }
  }
  throw new ApiError(500, "Could not create a link. Please try again.");
});
