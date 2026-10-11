import { auth } from "@/lib/auth-server";
import dbConnect from "@/lib/db";
import { Course, Enrollment, Timetable, Attendance, Result, Teacher, User, Department } from "@/lib/models";
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, conflictResponse, notFoundResponse, serverErrorResponse } from "@/lib/api/response";
import { z } from "zod";
import mongoose, { Types } from "mongoose";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const updateCourseSchema = z
  .object({
    code: z.string().trim().min(1).max(20).optional(),
    title: z.string().trim().min(2).max(200).optional(),
    teacherId: z.string().regex(objectIdRegex).nullable().optional(),
    departmentId: z.string().regex(objectIdRegex).nullable().optional(),
    semester: z.number().int().min(1).max(12).optional(),
    creditHours: z.number().int().min(1).max(6).optional(),
  })
  .strict();

const coursePopulate = [
  { path: "teacherId", populate: { path: "userId", select: "name email" } },
  { path: "departmentId", select: "name code" },
];

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

interface LeanDepartment {
  _id: Types.ObjectId;
  name: string;
  code: string;
}

interface LeanCourse {
  _id: Types.ObjectId;
  code: string;
  title: string;
  semester: number;
  creditHours: number;
  teacherId: LeanTeacher | null;
  departmentId: LeanDepartment | null;
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

  const department = course.departmentId
    ? {
        id: course.departmentId._id.toString(),
        name: course.departmentId.name,
        code: course.departmentId.code,
      }
    : null;

  return {
    id: course._id.toString(),
    code: course.code,
    title: course.title,
    semester: course.semester,
    creditHours: course.creditHours,
    teacher,
    department,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
  };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return unauthorizedResponse();

    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) return errorResponse("Invalid course ID", 400);

    await dbConnect();

    const course = (await Course.findById(id)
      .populate(coursePopulate)
      .lean()) as unknown as LeanCourse | null;

    if (!course) return notFoundResponse("Course not found");

    return successResponse(toCourseDTO(course));
  } catch (error) {
    console.error("GET /api/courses/:id error:", error);
    return serverErrorResponse();
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string })?.role;
    if (role !== "admin") return forbiddenResponse("Admin only");

    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) return errorResponse("Invalid course ID", 400);

    const body = await req.json();
    const parsed = updateCourseSchema.safeParse(body);
    if (!parsed.success) return errorResponse("Invalid input", 400);

    await dbConnect();

    const existing = await Course.findById(id).lean();
    if (!existing) return notFoundResponse("Course not found");

    const updateData: Record<string, unknown> = { ...parsed.data };

    if (parsed.data.code !== undefined) {
      const duplicate = await Course.findOne({ code: parsed.data.code, _id: { $ne: id } })
        .collation({ locale: "en", strength: 2 })
        .lean();
      if (duplicate) return conflictResponse("Course code already exists");
    }

    if (parsed.data.teacherId !== undefined && parsed.data.teacherId !== null) {
      const teacher = (await Teacher.findById(parsed.data.teacherId).lean()) as unknown as { userId: Types.ObjectId } | null;
      if (!teacher) return notFoundResponse("Teacher not found");
      const teacherUser = (await User.findById(teacher.userId).lean()) as unknown as { isActive?: boolean } | null;
      if (!teacherUser || !teacherUser.isActive) return conflictResponse("Teacher is inactive");
      updateData.teacherId = parsed.data.teacherId;
    }

    if (parsed.data.departmentId !== undefined && parsed.data.departmentId !== null) {
      const department = (await Department.findById(parsed.data.departmentId).lean()) as unknown as { _id: Types.ObjectId } | null;
      if (!department) return notFoundResponse("Department not found");
      updateData.departmentId = parsed.data.departmentId;
    }

    await Course.findByIdAndUpdate(id, updateData, { new: true });

    const course = (await Course.findById(id)
      .populate(coursePopulate)
      .lean()) as unknown as LeanCourse | null;

    if (!course) return notFoundResponse("Course not found");

    return successResponse(toCourseDTO(course));
  } catch (error) {
    if (typeof error === "object" && error !== null && (error as { code?: number }).code === 11000) {
      return conflictResponse("Course code already exists");
    }
    console.error("PUT /api/courses/:id error:", error);
    return serverErrorResponse();
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string })?.role;
    if (role !== "admin") return forbiddenResponse("Admin only");

    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) return errorResponse("Invalid course ID", 400);

    await dbConnect();

    const course = await Course.findById(id).lean();
    if (!course) return notFoundResponse("Course not found");

    const dbSession = await mongoose.startSession();
    try {
      await dbSession.withTransaction(async () => {
        await Enrollment.deleteMany({ courseId: id }, { session: dbSession });
        await Timetable.deleteMany({ courseId: id }, { session: dbSession });
        await Attendance.deleteMany({ courseId: id }, { session: dbSession });
        await Result.deleteMany({ courseId: id }, { session: dbSession });
        const deleted = await Course.findByIdAndDelete(id, { session: dbSession });
        if (!deleted) throw new Error("Course delete failed within transaction");
      });
    } finally {
      await dbSession.endSession();
    }

    return successResponse({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/courses/:id error:", error);
    return serverErrorResponse();
  }
}