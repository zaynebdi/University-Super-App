import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const teacherSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    department: { type: String, required: true, trim: true },
    designation: { type: String, trim: true },
    office: { type: String, trim: true },
    officeHours: { type: String, trim: true },
  },
  { timestamps: true },
);

export type TeacherDoc = InferSchemaType<typeof teacherSchema>;

export const Teacher: Model<TeacherDoc> =
  (models.Teacher as Model<TeacherDoc>) ?? model<TeacherDoc>("Teacher", teacherSchema);
