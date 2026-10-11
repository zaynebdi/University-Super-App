import { auth } from "@/lib/auth-server";
import dbConnect from "@/lib/db";
import { Course, Teacher, User, Department, Field } from "@/lib/models";
import { getAdminScope } from "@/lib/admin-scope";
import { successResponse, createdResponse, errorResponse, unauthorizedResponse, forbiddenResponse, conflictResponse, serverErrorResponse } from "@/lib/api/response";
import { z } from "zod";
import { Types } from "mongoose";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const createCourseSchema = z
  .object({
    code: z.string().trim().min(1).max(20),
    title: z.string().trim().min(2).max(200),
    teacherId: z.string().regex(objectIdRegex).nullable().optional(),
    departmentId: z.string().regex(objectIdRegex).nullable().optional(),
    fieldId: z.string().regex(objectIdRegex).nullable().optional(),
    semester: z.number().int().min(1).max(12),
    creditHours: z.number().int().min(1).max(6),
  })
  .strict();

const listQuerySchema = z.object({
  semester: z.coerce.number().int().min(1).max(12).optional(),
  teacherId: z.string().regex(objectIdRegex).optional(),
  departmentId: z.string().regex(objectIdRegex).optional(),
  fieldId: z.string().regex(objectIdRegex).optional(),
});

const coursePopulate = [
  { path: "teacherId", populate: { path: "userId", select: "name email" } },
  { path: "departmentId", select: "name code" },
  { path: "fieldId", select: "name code" },
];

interface LeanUser {
  name?: string;
  email?: string;
}

interface LeanTeacher {
  _id: Types.ObjectId;
  department?: string;
  departmentId?: Types.ObjectId | null;
  designation?: string;
  userId: LeanUser | null;
}

interface LeanDepartment {
  _id: Types.ObjectId;
  name: string;
  code: string;
}

interface LeanField {
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
  fieldId: LeanField | null;
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

  const field = course.fieldId
    ? {
        id: course.fieldId._id.toString(),
        name: course.fieldId.name,
        code: course.fieldId.code,
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
    field,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
  };
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return unauthorizedResponse();

    const scope = getAdminScope(session);
    const { searchParams } = new URL(req.url);
    const parsed = listQuerySchema.safeParse({
      semester: searchParams.get("semester") ?? undefined,
      teacherId: searchParams.get("teacherId") ?? undefined,
      departmentId: searchParams.get("departmentId") ?? undefined,
      fieldId: searchParams.get("fieldId") ?? undefined,
    });
    if (!parsed.success) return errorResponse("Invalid query", 400);

    await dbConnect();

    const filter: Record<string, unknown> = {};
    if (parsed.data.semester !== undefined) filter.semester = parsed.data.semester;
    if (parsed.data.teacherId !== undefined) filter.teacherId = parsed.data.teacherId;
    if (parsed.data.fieldId !== undefined) filter.fieldId = parsed.data.fieldId;

    if (scope?.assignedDepartment) {
      // Department admins only see their own department's courses.
      if (parsed.data.departmentId && parsed.data.departmentId !== scope.assignedDepartment) {
        return forbiddenResponse("You can only view courses of your own department");
      }
      filter.departmentId = scope.assignedDepartment;
    } else if (parsed.data.departmentId !== undefined) {
      filter.departmentId = parsed.data.departmentId;
    }

    const courses = (await Course.find(filter)
      .populate(coursePopulate)
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
    const scope = getAdminScope(session);
    if (!scope) return forbiddenResponse("Admin only");

    const body = await req.json().catch(() => null);
    const parsed = createCourseSchema.safeParse(body);
    if (!parsed.success) return errorResponse("Invalid input", 400);

    await dbConnect();

    const departmentId = parsed.data.departmentId ?? null;
    if (departmentId) {
      if (scope.assignedDepartment && departmentId !== scope.assignedDepartment) {
        return forbiddenResponse("You can only add courses to your own department");
      }
      const department = (await Department.findById(departmentId).lean()) as unknown as { _id: Types.ObjectId } | null;
      if (!department) return errorResponse("Department not found", 404);
    }

    const fieldId = parsed.data.fieldId ?? null;
    if (fieldId) {
      const field = (await Field.findById(fieldId).lean()) as unknown as { _id: Types.ObjectId; departmentId?: Types.ObjectId | null } | null;
      if (!field) return errorResponse("Field not found", 404);
      if (departmentId && field.departmentId && field.departmentId.toString() !== departmentId) {
        return errorResponse("Field does not belong to the selected department", 400);
      }
      if (scope.assignedDepartment && (!field.departmentId || field.departmentId.toString() !== scope.assignedDepartment)) {
        return forbiddenResponse("You can only use fields of your own department");
      }
    }

    const teacherId = parsed.data.teacherId ?? null;
    if (teacherId) {
      const teacher = (await Teacher.findById(teacherId).lean()) as unknown as { userId: Types.ObjectId; departmentId?: Types.ObjectId | null } | null;
      if (!teacher) return errorResponse("Teacher not found", 404);
      if (scope.assignedDepartment && (!teacher.departmentId || teacher.departmentId.toString() !== scope.assignedDepartment)) {
        return forbiddenResponse("You can only assign teachers from your own department");
      }
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
      departmentId,
      fieldId,
      semester: parsed.data.semester,
      creditHours: parsed.data.creditHours,
    });

    const course = (await Course.findById(created._id)
      .populate(coursePopulate)
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