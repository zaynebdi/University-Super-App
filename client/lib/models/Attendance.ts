import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { ATTENDANCE_STATUSES } from "@/lib/constants";

const attendanceSchema = new Schema(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, required: true },
    status: { type: String, enum: [...ATTENDANCE_STATUSES], required: true },
  },
  { timestamps: true },
);

// One attendance record per student per course per day.
attendanceSchema.index({ courseId: 1, studentId: 1, date: 1 }, { unique: true });

export type AttendanceDoc = InferSchemaType<typeof attendanceSchema>;

export const Attendance: Model<AttendanceDoc> =
  (models.Attendance as Model<AttendanceDoc>) ??
  model<AttendanceDoc>("Attendance", attendanceSchema);
