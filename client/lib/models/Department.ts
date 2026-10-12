import mongoose, { Document, Schema, Types } from "mongoose";

export interface IDepartment extends Document {
  _id: Types.ObjectId;
  name: string;
  code: string;
  isActive: boolean;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, uppercase: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

DepartmentSchema.index(
  { name: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);
DepartmentSchema.index(
  { code: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);

export const Department =
  mongoose.models.Department ||
  mongoose.model<IDepartment>("Department", DepartmentSchema);