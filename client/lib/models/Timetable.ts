import mongoose, { Document, Schema, Types } from "mongoose";

export interface ITimetable extends Document {
  _id: Types.ObjectId;
  courseId: Types.ObjectId;
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";
  startTime: string;
  endTime: string;
  room: string;
}

const TimetableSchema = new Schema<ITimetable>(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    day: {
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      required: true,
    },
    startTime: { type: String, required: true, match: /^([01]\d|2[0-3]):([0-5]\d)$/ },
    endTime: { type: String, required: true, match: /^([01]\d|2[0-3]):([0-5]\d)$/ },
    room: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

TimetableSchema.index({ courseId: 1 });
TimetableSchema.index({ day: 1, startTime: 1, endTime: 1 });
TimetableSchema.index({ room: 1, day: 1, startTime: 1 });

export const Timetable =
  mongoose.models.Timetable || mongoose.model<ITimetable>("Timetable", TimetableSchema);