import { auth } from "@/lib/auth-server";
import dbConnect from "@/lib/db";
import { Course, Result, Student, Teacher } from "@/lib/models";
import { getAdminScope } from "@/lib/admin-scope";
import { createdResponse, errorResponse, unauthorizedResponse, forbiddenResponse, conflictResponse, notFoundResponse, serverErrorResponse } from "@/lib/api/response";
import { GradePoints } from "@/lib/constants";
import { z } from "zod";
import { Types } from "mongoose";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const createResultSchema = z
  .object({
    studentId: z.string().regex(objectIdRegex),
    courseId: z.string().regex(objectIdRegex),
    marks: z.number().min(0).max(100),
    grade: z.string().refine((grade) => grade in GradePoints, "Invalid grade"),
  })
  .strict();

interface LeanResult {
  _id: Types.ObjectId;
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;
  marks: number;
  grade: string;
}

function toResultDTO(result: LeanResult) {
  return {
    id: result._id.toString(),
    studentId: result.studentId.toString(),
    courseId: result.courseId.toString(),
    marks: result.marks,
    grade: result.grade,
  };
}

function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: number }).code === 11000;
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return unauthorizedResponse();

    const sessionUser = session.user as { id: string; role: string };
    if (sessionUser.role !== "teacher" && sessionUser.role !== "admin") {
      return forbiddenResponse("Teachers and admins only");
    }

    const body = await req.json();
    const parsed = createResultSchema.safeParse(body);
    if (!parsed.success) return errorResponse("Invalid input", 400);

    await dbConnect();

    const course = (await Course.findById(parsed.data.courseId).lean()) as unknown as {
      _id: Types.ObjectId;
      teacherId: Types.ObjectId | null;
      departmentId?: Types.ObjectId | null;
    } | null;
    if (!course) return notFoundResponse("Course not found");

    if (sessionUser.role === "teacher") {
      const teacher = (await Teacher.findOne({ userId: sessionUser.id }).lean()) as unknown as {
        _id: Types.ObjectId;
      } | null;
      if (!teacher || !course.teacherId || course.teacherId.toString() !== teacher._id.toString()) {
        return forbiddenResponse("You can only add results for your own courses");
      }
    } else {
      const scope = getAdminScope(session);
      if (
        scope?.assignedDepartment &&
        (!course.departmentId || course.departmentId.toString() !== scope.assignedDepartment)
      ) {
        return forbiddenResponse("You can only add results for your own department");
      }
    }

    const student = await Student.findById(parsed.data.studentId).lean();
    if (!student) return notFoundResponse("Student not found");

    const existing = await Result.findOne({
      studentId: parsed.data.studentId,
      courseId: parsed.data.courseId,
    }).lean();
    if (existing) return conflictResponse("Result already exists for this student and course");

    const created = (await Result.create({
      studentId: parsed.data.studentId,
      courseId: parsed.data.courseId,
      marks: parsed.data.marks,
      grade: parsed.data.grade,
    })) as unknown as LeanResult;

    return createdResponse(toResultDTO(created));
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return conflictResponse("Result already exists for this student and course");
    }
    console.error("POST /api/results error:", error);
    return serverErrorResponse();
  }
}
