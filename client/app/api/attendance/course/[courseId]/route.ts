import { auth } from "@/lib/auth-server";
import dbConnect from "@/lib/db";
import { Attendance, Course, Teacher } from "@/lib/models";
import { getAdminScope } from "@/lib/admin-scope";
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse, serverErrorResponse } from "@/lib/api/response";
import { Types } from "mongoose";

interface LeanUser {
  name?: string;
  email?: string;
}

interface LeanStudent {
  _id: Types.ObjectId;
  rollNo: string;
  userId: LeanUser | null;
}

interface LeanAttendance {
  _id: Types.ObjectId;
  courseId: Types.ObjectId;
  studentId: LeanStudent;
  date: Date;
  status: "present" | "absent";
}

function toUtcMidnight(value: string): Date | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return unauthorizedResponse();

    const sessionUser = session.user as { id: string; role: string };
    if (sessionUser.role !== "teacher" && sessionUser.role !== "admin") {
      return forbiddenResponse("Teachers and admins only");
    }

    const { courseId } = await params;
    if (!Types.ObjectId.isValid(courseId)) return errorResponse("Invalid course ID", 400);

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");
    let day: Date | null = null;
    if (dateParam) {
      day = toUtcMidnight(dateParam);
      if (!day) return errorResponse("Invalid date", 400);
    }

    await dbConnect();

    const course = (await Course.findById(courseId).lean()) as unknown as {
      _id: Types.ObjectId;
      teacherId: Types.ObjectId | null;
      departmentId?: Types.ObjectId | null;
    } | null;
    if (!course) return notFoundResponse("Course not found");

    if (sessionUser.role === "teacher") {
      const teacher = (await Teacher.findOne({ userId: sessionUser.id }).lean()) as unknown as { _id: Types.ObjectId } | null;
      if (!teacher || !course.teacherId || course.teacherId.toString() !== teacher._id.toString()) {
        return forbiddenResponse("Access denied");
      }
    } else {
      const scope = getAdminScope(session);
      if (
        scope?.assignedDepartment &&
        (!course.departmentId || course.departmentId.toString() !== scope.assignedDepartment)
      ) {
        return forbiddenResponse("You can only view attendance for your own department");
      }
    }

    const filter: Record<string, unknown> = { courseId };
    if (day) filter.date = day;

    const records = (await Attendance.find(filter)
      .populate({ path: "studentId", populate: { path: "userId", select: "name email" } })
      .lean()) as unknown as LeanAttendance[];

    const result = records.map((record) => ({
      id: record._id.toString(),
      courseId: record.courseId.toString(),
      studentId: record.studentId._id.toString(),
      student: {
        id: record.studentId._id.toString(),
        rollNo: record.studentId.rollNo,
        name: record.studentId.userId?.name,
        email: record.studentId.userId?.email,
      },
      date: record.date,
      status: record.status,
    }));

    return successResponse(result);
  } catch (error) {
    console.error("GET /api/attendance/course/:courseId error:", error);
    return serverErrorResponse();
  }
}
