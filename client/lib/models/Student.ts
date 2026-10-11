import mongoose, { Document, Schema, Types } from "mongoose";

export interface IStudent extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  rollNo: string;
  department?: string;
  departmentId?: Types.ObjectId | null;
  fieldId?: Types.ObjectId | null;
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
    department: { type: String, trim: true },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      default: null,
      index: true,
    },
    fieldId: {
      type: Schema.Types.ObjectId,
      ref: "Field",
      default: null,
      index: true,
    },
    semester: { type: Number, required: true, min: 1, max: 12 },
  },
  { timestamps: true }
);

StudentSchema.index({ userId: 1 }, { unique: true });
StudentSchema.index({ rollNo: 1 }, { unique: true });
StudentSchema.index({ departmentId: 1 });
StudentSchema.index({ fieldId: 1 });

export const Student =
  mongoose.models.Student || mongoose.model<IStudent>("Student", StudentSchema);