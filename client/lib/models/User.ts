import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { USER_ROLES } from "@/lib/constants";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Never returned by default queries; must be explicitly .select("+password").
    password: { type: String, required: true, select: false },
    role: { type: String, enum: [...USER_ROLES], required: true, index: true },
    phone: { type: String, trim: true },
    photo: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type UserDoc = InferSchemaType<typeof userSchema>;

export const User: Model<UserDoc> =
  (models.User as Model<UserDoc>) ?? model<UserDoc>("User", userSchema);
