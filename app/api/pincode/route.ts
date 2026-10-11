import { handler, ok } from "@/lib/api";
import { getSettings } from "@/lib/data";

// Rough delivery estimates by the first digit of the PIN (postal zone). Replace with a courier API if you need exact ETAs.
const ZONE: Record<string, [string, string]> = {
  "1": ["3–6", "2–3"], "2": ["3–6", "2–3"], "3": ["3–6", "2–4"], "4": ["2–4", "1–2"], "5": ["3–6", "2–3"],
  "6": ["4–7", "2–4"], "7": ["4–8", "3–5"], "8": ["4–8", "3–5"], "9": ["5–9", "3–6"],
};

export const GET = handler(async (req: Request) => {
  const code = (new URL(req.url).searchParams.get("code") || "").trim();
  if (!/^[1-9][0-9]{5}$/.test(code)) return ok({ valid: false, message: "Enter a valid 6-digit PIN code" });
  const s = await getSettings();
  const blocked = s.unserviceablePincodes.split(/[\s,]+/).filter(Boolean);
  if (blocked.includes(code)) return ok({ valid: true, serviceable: false, message: "Sorry, we don't deliver to this PIN code yet." });
  const [standard, express] = ZONE[code[0]] || ["4–7", "2–4"];
  return ok({ valid: true, serviceable: true, standard, express, cod: true, message: `Delivery in ${standard} business days (express ${express}). Cash on Delivery available.` });
});
