import Razorpay from "razorpay";
import crypto from "crypto";
import { ApiError } from "@/lib/api";

export const razorpayConfigured = () => !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

function client() {
  if (!razorpayConfigured()) throw new ApiError(503, "Online payments are not available right now. Please choose Cash on Delivery.");
  return new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID!, key_secret: process.env.RAZORPAY_KEY_SECRET! });
}

export async function createRazorpayOrder(amountRupees: number, receipt: string) {
  try {
    return await client().orders.create({
      amount: Math.round(amountRupees * 100),
      currency: "INR",
      receipt: receipt.slice(0, 40),
    });
  } catch (e) {
    if (e instanceof ApiError) throw e;
    console.error("[razorpay] order create failed", e);
    throw new ApiError(502, "Could not start the payment. Please try again.");
  }
}

/** Verifies the checkout signature using the SERVER-ONLY secret. */
export function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature || "");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
