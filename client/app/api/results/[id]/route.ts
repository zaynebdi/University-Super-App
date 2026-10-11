import { auth } from "@/lib/auth-server";
import dbConnect from "@/lib/db";
import { Course, Result, Teacher } from "@/lib/models";
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse, serverErrorResponse } from "@/lib/api/response";
import { GradePoints } from "@/lib/constants";
import { z } from "zod";
import { Types } from "mongoose";

const updateResultSchema = z
  .object({
    marks: z.number().min(0).max(100).optional(),
    grade: z.string().refine((grade) => grade in GradePoints, "Invalid grade").optional(),
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

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return unauthorizedResponse();

    const sessionUser = session.user as { id: string; role: string };
    if (sessionUser.role !== "teacher" && sessionUser.role !== "admin") {
      return forbiddenResponse("Teachers and admins only");
    }

    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) return errorResponse("Invalid result ID", 400);

    const body = await req.json();
    const parsed = updateResultSchema.safeParse(body);
    if (!parsed.success) return errorResponse("Invalid input", 400);

    await dbConnect();

    const existing = (await Result.findById(id).lean()) as unknown as LeanResult | null;
    if (!existing) return notFoundResponse("Result not found");

    if (sessionUser.role === "teacher") {
      const course = (await Course.findById(existing.courseId).lean()) as unknown as {
        teacherId: Types.ObjectId | null;
      } | null;
      const teacher = (await Teacher.findOne({ userId: sessionUser.id }).lean()) as unknown as {
        _id: Types.ObjectId;
      } | null;
      if (!course || !teacher || !course.teacherId || course.teacherId.toString() !== teacher._id.toString()) {
        return forbiddenResponse("You can only edit results for your own courses");
      }
    }

    const updated = (await Result.findByIdAndUpdate(id, parsed.data, { new: true }).lean()) as unknown as LeanResult;
    if (!updated) return notFoundResponse("Result not found");

    return successResponse(toResultDTO(updated));
  } catch (error) {
    console.error("PUT /api/results/:id error:", error);
    return serverErrorResponse();
  }
}
