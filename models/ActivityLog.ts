import { Schema, model, models, type Model } from "mongoose";

const ActivityLogSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", index: true },
    userName: String,
    userEmail: String,
    role: String,
    action: { type: String, enum: ["create", "update", "delete", "status", "settings", "other"], default: "other", index: true },
    resource: { type: String, index: true },
    targetId: String,
    summary: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
ActivityLogSchema.index({ createdAt: -1 });

export const ActivityLog: Model<any> = models.ActivityLog || model("ActivityLog", ActivityLogSchema);
