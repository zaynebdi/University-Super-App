import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const resultSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    marks: { type: Number, required: true, min: 0, max: 100 },
    grade: { type: String, required: true, uppercase: true, trim: true },
  },
  { timestamps: true },
);

// One result per student per course.
resultSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

export type ResultDoc = InferSchemaType<typeof resultSchema>;

export const Result: Model<ResultDoc> =
  (models.Result as Model<ResultDoc>) ?? model<ResultDoc>("Result", resultSchema);
