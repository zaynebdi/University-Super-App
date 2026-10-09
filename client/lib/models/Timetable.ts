import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { WEEK_DAYS } from "@/lib/constants";

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

const timetableSchema = new Schema(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    day: { type: String, enum: [...WEEK_DAYS], required: true },
    startTime: { type: String, required: true, trim: true, match: TIME_REGEX },
    endTime: { type: String, required: true, trim: true, match: TIME_REGEX },
    room: { type: String, required: true, trim: true, index: true },
  },
  { timestamps: true },
);

timetableSchema.index({ day: 1, startTime: 1, endTime: 1 });

timetableSchema.pre("validate", function () {
  if (this.startTime && this.endTime && this.endTime <= this.startTime) {
    this.invalidate("endTime", "endTime must be after startTime");
  }
});

export type TimetableDoc = InferSchemaType<typeof timetableSchema>;

export const Timetable: Model<TimetableDoc> =
  (models.Timetable as Model<TimetableDoc>) ??
  model<TimetableDoc>("Timetable", timetableSchema);
