import { auth } from "@/lib/auth-server";
import dbConnect from "@/lib/db";
import { Announcement } from "@/lib/models";
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse, serverErrorResponse } from "@/lib/api/response";
import { z } from "zod";
import { Types } from "mongoose";

const updateAnnouncementSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    body: z.string().trim().min(1).max(5000).optional(),
  })
  .strict();

interface LeanAnnouncement {
  _id: Types.ObjectId;
  title: string;
  body: string;
  postedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return unauthorizedResponse();

    const sessionUser = session.user as { id: string; name?: string; email?: string; role: string };

    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) return errorResponse("Invalid announcement ID", 400);

    const body = await req.json();
    const parsed = updateAnnouncementSchema.safeParse(body);
    if (!parsed.success) return errorResponse("Invalid input", 400);

    await dbConnect();

    const existing = (await Announcement.findById(id).lean()) as unknown as LeanAnnouncement | null;
    if (!existing) return notFoundResponse("Announcement not found");

    if (existing.postedBy.toString() !== sessionUser.id) {
      return forbiddenResponse("You can only edit your own announcements");
    }

    const updated = (await Announcement.findByIdAndUpdate(id, parsed.data, { new: true }).lean()) as unknown as LeanAnnouncement;
    if (!updated) return notFoundResponse("Announcement not found");

    return successResponse({
      id: updated._id.toString(),
      title: updated.title,
      body: updated.body,
      author: {
        id: sessionUser.id,
        name: sessionUser.name,
        email: sessionUser.email,
        role: sessionUser.role,
      },
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  } catch (error) {
    console.error("PUT /api/announcements/:id error:", error);
    return serverErrorResponse();
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return unauthorizedResponse();

    const sessionUser = session.user as { id: string; role: string };

    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) return errorResponse("Invalid announcement ID", 400);

    await dbConnect();

    const existing = (await Announcement.findById(id).lean()) as unknown as LeanAnnouncement | null;
    if (!existing) return notFoundResponse("Announcement not found");

    const isOwner = existing.postedBy.toString() === sessionUser.id;
    if (!isOwner && sessionUser.role !== "admin") {
      return forbiddenResponse("Access denied");
    }

    await Announcement.findByIdAndDelete(id);

    return successResponse({ message: "Announcement deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/announcements/:id error:", error);
    return serverErrorResponse();
  }
}
