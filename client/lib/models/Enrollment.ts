import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const enrollmentSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    enrolledAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

// One enrollment per student per course.
enrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

export type EnrollmentDoc = InferSchemaType<typeof enrollmentSchema>;

export const Enrollment: Model<EnrollmentDoc> =
  (models.Enrollment as Model<EnrollmentDoc>) ??
  model<EnrollmentDoc>("Enrollment", enrollmentSchema);
