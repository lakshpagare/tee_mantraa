import { Order } from "@/models/Order";
import { User } from "@/models/User";
import { POINTS_PER_RUPEES, REFERRAL_REWARD_POINTS } from "@/lib/pricing";

/** Awards loyalty points (once) when an order is delivered, plus the referrer's reward on a first delivery. */
export async function awardDeliveryPoints(order: any) {
  if (order.pointsAwarded) return;
  const earned = Math.floor((order.total || 0) / POINTS_PER_RUPEES);
  order.pointsAwarded = true;
  order.pointsEarned = earned;
  if (earned > 0) await User.updateOne({ _id: order.user }, { $inc: { points: earned } });

  const user: any = await User.findById(order.user).select("referredBy referralRewarded");
  if (user?.referredBy && !user.referralRewarded) {
    const prior = await Order.countDocuments({ user: order.user, status: "Delivered", _id: { $ne: order._id } });
    if (prior === 0) {
      await User.updateOne({ _id: user.referredBy }, { $inc: { points: REFERRAL_REWARD_POINTS } });
      await User.updateOne({ _id: user._id }, { referralRewarded: true });
    }
  }
}
