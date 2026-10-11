import mongoose, { Document, Schema, Types } from "mongoose";

/**
 * Atomic per-department sequence used to generate roll numbers like
 * DEPTCODE-2026-001, DEPTCODE-2026-002, ... The document _id is the
 * Department ObjectId and `seq` is incremented with $inc inside a single
 * findOneAndUpdate, so two concurrent student creations can never receive
 * the same sequence number.
 */
export interface IRollNumberCounter extends Document {
  _id: Types.ObjectId;
  seq: number;
}

const RollNumberCounterSchema = new Schema<IRollNumberCounter>(
  {
    _id: { type: Schema.Types.ObjectId, required: true },
    seq: { type: Number, required: true, default: 0 },
  },
  { versionKey: false }
);

export const RollNumberCounter =
  mongoose.models.RollNumberCounter ||
  mongoose.model<IRollNumberCounter>("RollNumberCounter", RollNumberCounterSchema);