import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const courseSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    title: { type: String, required: true, trim: true },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    semester: { type: Number, required: true, min: 1, max: 12, index: true },
    creditHours: { type: Number, required: true, min: 1, max: 6 },
  },
  { timestamps: true },
);

export type CourseDoc = InferSchemaType<typeof courseSchema>;

export const Course: Model<CourseDoc> =
  (models.Course as Model<CourseDoc>) ?? model<CourseDoc>("Course", courseSchema);
