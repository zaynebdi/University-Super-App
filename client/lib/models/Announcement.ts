import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const announcementSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    postedBy: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true },
);

// Announcements are listed newest-first.
announcementSchema.index({ createdAt: -1 });

export type AnnouncementDoc = InferSchemaType<typeof announcementSchema>;

export const Announcement: Model<AnnouncementDoc> =
  (models.Announcement as Model<AnnouncementDoc>) ??
  model<AnnouncementDoc>("Announcement", announcementSchema);
