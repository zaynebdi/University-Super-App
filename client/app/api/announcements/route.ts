import { auth } from "@/lib/auth-server";
import dbConnect from "@/lib/db";
import { Announcement } from "@/lib/models";
import { successResponse, createdResponse, errorResponse, unauthorizedResponse, forbiddenResponse, serverErrorResponse } from "@/lib/api/response";
import { z } from "zod";
import { Types } from "mongoose";

const PAGE_SIZE = 10;

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
});

const createAnnouncementSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    body: z.string().trim().min(1).max(5000),
  })
  .strict();

interface LeanUser {
  _id: Types.ObjectId;
  name?: string;
  email?: string;
  role?: string;
}

interface LeanAnnouncement {
  _id: Types.ObjectId;
  title: string;
  body: string;
  postedBy: LeanUser | Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

function toAnnouncementDTO(announcement: LeanAnnouncement) {
  let author = null;
  if (announcement.postedBy && typeof announcement.postedBy === "object" && "name" in announcement.postedBy) {
    const user = announcement.postedBy;
    author = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  return {
    id: announcement._id.toString(),
    title: announcement.title,
    body: announcement.body,
    author,
    createdAt: announcement.createdAt,
    updatedAt: announcement.updatedAt,
  };
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const parsed = listQuerySchema.safeParse({
      page: searchParams.get("page") || undefined,
    });
    if (!parsed.success) return errorResponse("Invalid query", 400);

    const page = parsed.data.page ?? 1;

    await dbConnect();

    const announcements = (await Announcement.find({})
      .sort({ createdAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .populate({ path: "postedBy", select: "name email role" })
      .lean()) as unknown as LeanAnnouncement[];

    return successResponse(announcements.map(toAnnouncementDTO));
  } catch (error) {
    console.error("GET /api/announcements error:", error);
    return serverErrorResponse();
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return unauthorizedResponse();

    const sessionUser = session.user as { id: string; name?: string; email?: string; role: string };
    if (sessionUser.role !== "teacher" && sessionUser.role !== "admin") {
      return forbiddenResponse("Teachers and admins only");
    }

    const body = await req.json();
    const parsed = createAnnouncementSchema.safeParse(body);
    if (!parsed.success) return errorResponse("Invalid input", 400);

    await dbConnect();

    const created = (await Announcement.create({
      title: parsed.data.title,
      body: parsed.data.body,
      postedBy: sessionUser.id,
    })) as unknown as LeanAnnouncement;

    return createdResponse({
      id: created._id.toString(),
      title: created.title,
      body: created.body,
      author: {
        id: sessionUser.id,
        name: sessionUser.name,
        email: sessionUser.email,
        role: sessionUser.role,
      },
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    });
  } catch (error) {
    console.error("POST /api/announcements error:", error);
    return serverErrorResponse();
  }
}
