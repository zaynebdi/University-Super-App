import { auth } from "@/lib/auth-server";
import dbConnect from "@/lib/db";
import { Result, Student } from "@/lib/models";
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse, serverErrorResponse } from "@/lib/api/response";
import { calculateGPA } from "@/lib/utils/gpa";
import { Types } from "mongoose";

interface LeanResult {
  _id: Types.ObjectId;
  courseId: { _id: Types.ObjectId; code: string; title: string; creditHours: number } | null;
  marks: number;
  grade: string;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return unauthorizedResponse();

    const sessionUser = session.user as { id: string; role: string };

    const { studentId } = await params;
    if (!Types.ObjectId.isValid(studentId)) return errorResponse("Invalid student ID", 400);

    await dbConnect();

    const student = (await Student.findById(studentId).lean()) as unknown as {
      _id: Types.ObjectId;
      userId: Types.ObjectId;
    } | null;
    if (!student) return notFoundResponse("Student not found");

    if (sessionUser.role === "student" && student.userId.toString() !== sessionUser.id) {
      return forbiddenResponse("Access denied");
    } else if (sessionUser.role !== "student" && sessionUser.role !== "admin") {
      return forbiddenResponse("Access denied");
    }

    const records = (await Result.find({ studentId })
      .populate({ path: "courseId", select: "code title creditHours" })
      .lean()) as unknown as LeanResult[];

    const results = resultsToDTO(records);

    const gpa =
      Math.round(
        calculateGPA(
          results.map((r) => ({ grade: r.grade, creditHours: r.course?.creditHours ?? 0 }))
        ) * 100
      ) / 100;

    return successResponse({ results, gpa });
  } catch (error) {
    console.error("GET /api/results/student/:studentId error:", error);
    return serverErrorResponse();
  }
}

function toResultDTO(result: LeanResult) {
  return {
    id: result._id.toString(),
    courseId: result.courseId ? result.courseId._id.toString() : null,
    course: result.courseId
      ? {
          id: result.courseId._id.toString(),
          code: result.courseId.code,
          title: result.courseId.title,
          creditHours: result.courseId.creditHours,
        }
      : null,
    marks: result.marks,
    grade: result.grade,
  };
}

function resultsToDTO(results: LeanResult[]) {
  return results.map(toResultDTO);
}
