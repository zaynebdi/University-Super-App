import { auth } from "@/lib/auth-server";
import dbConnect from "@/lib/db";
import { Attendance, Student } from "@/lib/models";
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse, serverErrorResponse } from "@/lib/api/response";
import { MIN_ATTENDANCE_PERCENTAGE } from "@/lib/constants";
import { Types } from "mongoose";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return unauthorizedResponse();

    const sessionUser = session.user as { id: string; role: string };

    const { studentId } = await params;
    if (!Types.ObjectId.isValid(studentId)) return errorResponse("Invalid student ID", 400);

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    if (courseId && !/^[0-9a-fA-F]{24}$/.test(courseId)) {
      return errorResponse("Invalid course ID", 400);
    }

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

    const filter: Record<string, unknown> = { studentId };
    if (courseId) filter.courseId = courseId;

    const records = (await Attendance.find(filter)
      .populate({ path: "courseId", select: "code title" })
      .lean()) as unknown as {
      _id: Types.ObjectId;
      courseId: { _id: Types.ObjectId; code: string; title: string } | null;
      status: "present" | "absent";
    }[];

    const summary = new Map<string, { courseId: string; course: { id: string; code: string; title: string }; present: number; total: number }>();

    for (const record of records) {
      if (!record.courseId) continue;
      const key = record.courseId._id.toString();
      let entry = summary.get(key);
      if (!entry) {
        entry = {
          courseId: key,
          course: { id: key, code: record.courseId.code, title: record.courseId.title },
          present: 0,
          total: 0,
        };
        summary.set(key, entry);
      }
      entry.total += 1;
      if (record.status === "present") entry.present += 1;
    }

    const result = Array.from(summary.values())
      .map((entry) => {
        const percentage = entry.total > 0 ? Math.round((entry.present / entry.total) * 10000) / 100 : 0;
        return {
          ...entry,
          percentage,
          belowThreshold: percentage < MIN_ATTENDANCE_PERCENTAGE,
        };
      })
      .sort((a, b) => a.course.code.localeCompare(b.course.code));

    return successResponse(result);
  } catch (error) {
    console.error("GET /api/attendance/student/:studentId error:", error);
    return serverErrorResponse();
  }
}
