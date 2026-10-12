import mongoose, { Document, Schema, Types } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: "student" | "teacher" | "admin";
  /**
   * Department scope for department admins. `null`/missing means the admin is
   * a super admin (all departments). Existing admins without this field stay
   * super admins.
   */
  assignedDepartment?: Types.ObjectId | null;
  phone?: string;
  photo?: string;
  isActive: boolean;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["student", "teacher", "admin"],
      required: true,
      index: true,
    },
    assignedDepartment: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      default: null,
      index: true,
    },
    phone: { type: String, trim: true },
    photo: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

UserSchema.methods.comparePassword = async function (
  candidate: string
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export const User =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);