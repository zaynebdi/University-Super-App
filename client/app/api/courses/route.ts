import { auth } from "@/lib/auth-server";
import dbConnect from "@/lib/db";
import { Course, Teacher, User } from "@/lib/models";
import { successResponse, createdResponse, errorResponse, unauthorizedResponse, forbiddenResponse, conflictResponse, serverErrorResponse } from "@/lib/api/response";
import { z } from "zod";
import { Types } from "mongoose";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const createCourseSchema = z
  .object({
    code: z.string().trim().min(1).max(20),
    title: z.string().trim().min(2).max(200),
    teacherId: z.string().regex(objectIdRegex).nullable().optional(),
    semester: z.number().int().min(1).max(12),
    creditHours: z.number().int().min(1).max(6),
  })
  .strict();

const listQuerySchema = z.object({
  semester: z.coerce.number().int().min(1).max(12).optional(),
  teacherId: z.string().regex(objectIdRegex).optional(),
});

const teacherPopulate = {
  path: "teacherId",
  populate: { path: "userId", select: "name email" },
};

interface LeanUser {
  name?: string;
  email?: string;
}

interface LeanTeacher {
  _id: Types.ObjectId;
  department?: string;
  designation?: string;
  userId: LeanUser | null;
}

interface LeanCourse {
  _id: Types.ObjectId;
  code: string;
  title: string;
  semester: number;
  creditHours: number;
  teacherId: LeanTeacher | null;
  createdAt: Date;
  updatedAt: Date;
}

function toCourseDTO(course: LeanCourse) {
  const teacher = course.teacherId && course.teacherId.userId
    ? {
        id: course.teacherId._id.toString(),
        name: course.teacherId.userId.name,
        email: course.teacherId.userId.email,
        department: course.teacherId.department,
        designation: course.teacherId.designation ?? null,
      }
    : null;

  return {
    id: course._id.toString(),
    code: course.code,
    title: course.title,
    semester: course.semester,
    creditHours: course.creditHours,
    teacher,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
  };
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const parsed = listQuerySchema.safeParse({
      semester: searchParams.get("semester") || undefined,
      teacherId: searchParams.get("teacherId") || undefined,
    });
    if (!parsed.success) return errorResponse("Invalid query", 400);

    await dbConnect();

    const filter: Record<string, unknown> = {};
    if (parsed.data.semester !== undefined) filter.semester = parsed.data.semester;
    if (parsed.data.teacherId !== undefined) filter.teacherId = parsed.data.teacherId;

    const courses = (await Course.find(filter)
      .populate(teacherPopulate)
      .lean()) as unknown as LeanCourse[];

    return successResponse(courses.map(toCourseDTO));
  } catch (error) {
    console.error("GET /api/courses error:", error);
    return serverErrorResponse();
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string })?.role;
    if (role !== "admin") return forbiddenResponse("Admin only");

    const body = await req.json();
    const parsed = createCourseSchema.safeParse(body);
    if (!parsed.success) return errorResponse("Invalid input", 400);

    await dbConnect();

    const teacherId = parsed.data.teacherId ?? null;
    if (teacherId) {
      const teacher = (await Teacher.findById(teacherId).lean()) as unknown as { userId: Types.ObjectId } | null;
      if (!teacher) return errorResponse("Teacher not found", 404);
      const teacherUser = (await User.findById(teacher.userId).lean()) as unknown as { isActive?: boolean } | null;
      if (!teacherUser || !teacherUser.isActive) return conflictResponse("Teacher is inactive");
    }

    const existing = await Course.findOne({ code: parsed.data.code })
      .collation({ locale: "en", strength: 2 })
      .lean();
    if (existing) return conflictResponse("Course code already exists");

    const created = await Course.create({
      code: parsed.data.code,
      title: parsed.data.title,
      teacherId: parsed.data.teacherId ?? null,
      semester: parsed.data.semester,
      creditHours: parsed.data.creditHours,
    });

    const course = (await Course.findById(created._id)
      .populate(teacherPopulate)
      .lean()) as unknown as LeanCourse;

    return createdResponse(toCourseDTO(course));
  } catch (error) {
    if (isDuplicateKeyError(error)) return conflictResponse("Course code already exists");
    console.error("POST /api/courses error:", error);
    return serverErrorResponse();
  }
}

function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: number }).code === 11000;
}
