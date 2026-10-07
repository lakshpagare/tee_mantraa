import { Schema, model, models, type Model } from "mongoose";
import { ROLES } from "@/lib/constants";

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    passwordHash: { type: String, select: false },
    image: String,
    role: { type: String, enum: ROLES, default: "USER", index: true },
    status: { type: String, enum: ["active", "blocked"], default: "active" },
    provider: { type: String, enum: ["credentials", "google"], default: "credentials" },
    emailVerified: Date,
    verifyToken: { type: String, select: false },
    resetToken: { type: String, select: false },
    resetExpires: { type: Date, select: false },
  },
  { timestamps: true }
);
UserSchema.index({ createdAt: -1 });

export const User: Model<any> = models.User || model("User", UserSchema);
