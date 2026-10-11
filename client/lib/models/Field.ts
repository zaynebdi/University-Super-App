import mongoose, { Document, Schema, Types } from "mongoose";

export interface IField extends Document {
  _id: Types.ObjectId;
  name: string;
  code: string;
  departmentId: Types.ObjectId | null;
  isActive: boolean;
}

const FieldSchema = new Schema<IField>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, uppercase: true },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      default: null,
      index: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

FieldSchema.index(
  { name: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);
FieldSchema.index(
  { code: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);
FieldSchema.index({ departmentId: 1 });

export const Field =
  mongoose.models.Field || mongoose.model<IField>("Field", FieldSchema);