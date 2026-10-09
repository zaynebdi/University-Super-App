import mongoose, { Document, Schema, Types } from "mongoose";

export interface ICourse extends Document {
  _id: Types.ObjectId;
  code: string;
  title: string;
  teacherId: Types.ObjectId | null;
  semester: number;
  creditHours: number;
}

const CourseSchema = new Schema<ICourse>(
  {
    code: { type: String, required: true, unique: true, trim: true, index: true },
    title: { type: String, required: true, trim: true },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
      default: null,
      index: true,
    },
    semester: { type: Number, required: true, min: 1, max: 12, index: true },
    creditHours: { type: Number, required: true, min: 1, max: 6 },
  },
  { timestamps: true }
);

CourseSchema.index({ code: 1 }, { unique: true });
CourseSchema.index({ teacherId: 1 });
CourseSchema.index({ semester: 1 });

export const Course =
  mongoose.models.Course || mongoose.model<ICourse>("Course", CourseSchema);