import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const studentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    rollNo: { type: String, required: true, unique: true, trim: true },
    department: { type: String, required: true, trim: true },
    semester: { type: Number, required: true, min: 1, max: 12 },
  },
  { timestamps: true },
);

export type StudentDoc = InferSchemaType<typeof studentSchema>;

export const Student: Model<StudentDoc> =
  (models.Student as Model<StudentDoc>) ?? model<StudentDoc>("Student", studentSchema);
