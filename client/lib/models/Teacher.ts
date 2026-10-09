import mongoose, { Document, Schema, Types } from "mongoose";

export interface ITeacher extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  department: string;
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
    department: { type: String, required: true, trim: true },
    designation: { type: String, trim: true },
  },
  { timestamps: true }
);

TeacherSchema.index({ userId: 1 }, { unique: true });

export const Teacher =
  mongoose.models.Teacher || mongoose.model<ITeacher>("Teacher", TeacherSchema);