import mongoose, { Document, Schema, Types } from "mongoose";

export interface IAttendance extends Document {
  _id: Types.ObjectId;
  courseId: Types.ObjectId;
  studentId: Types.ObjectId;
  date: Date;
  status: "present" | "absent";
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["present", "absent"],
      required: true,
    },
  },
  { timestamps: true }
);

AttendanceSchema.index({ courseId: 1, studentId: 1, date: 1 }, { unique: true });
AttendanceSchema.index({ courseId: 1 });
AttendanceSchema.index({ studentId: 1 });

export const Attendance =
  mongoose.models.Attendance || mongoose.model<IAttendance>("Attendance", AttendanceSchema);