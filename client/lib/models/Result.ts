import mongoose, { Document, Schema, Types } from "mongoose";

export interface IResult extends Document {
  _id: Types.ObjectId;
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;
  marks: number;
  grade: string;
}

const ResultSchema = new Schema<IResult>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    marks: { type: Number, required: true, min: 0, max: 100 },
    grade: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

ResultSchema.index({ studentId: 1, courseId: 1 }, { unique: true });
ResultSchema.index({ studentId: 1 });
ResultSchema.index({ courseId: 1 });

export const Result =
  mongoose.models.Result || mongoose.model<IResult>("Result", ResultSchema);