import mongoose, { Document, Schema, Types } from "mongoose";

export interface IStudent extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  rollNo: string;
  department: string;
  semester: number;
}

const StudentSchema = new Schema<IStudent>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    rollNo: { type: String, required: true, unique: true, trim: true },
    department: { type: String, required: true, trim: true },
    semester: { type: Number, required: true, min: 1, max: 12 },
  },
  { timestamps: true }
);

StudentSchema.index({ userId: 1 }, { unique: true });
StudentSchema.index({ rollNo: 1 }, { unique: true });

export const Student =
  mongoose.models.Student || mongoose.model<IStudent>("Student", StudentSchema);