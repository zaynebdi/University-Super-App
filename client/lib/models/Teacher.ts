import mongoose, { Document, Schema, Types } from "mongoose";

export interface ITeacher extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  department?: string;
  departmentId?: Types.ObjectId | null;
  designation?: string;
}

const TeacherSchema = new Schema<ITeacher>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    department: { type: String, trim: true },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      default: null,
      index: true,
    },
    designation: { type: String, trim: true },
  },
  { timestamps: true }
);

TeacherSchema.index({ userId: 1 }, { unique: true });
TeacherSchema.index({ departmentId: 1 });

export const Teacher =
  mongoose.models.Teacher || mongoose.model<ITeacher>("Teacher", TeacherSchema);