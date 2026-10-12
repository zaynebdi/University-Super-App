import { auth } from "@/lib/auth-server";
import dbConnect from "@/lib/db";
import { Course, Enrollment, Teacher } from "@/lib/models";
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
  department: string;
  semester: number;
  userId: LeanUser | null;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return unauthorizedResponse();

    const sessionUser = session.user as { id: string; role: string };
    const scope = getAdminScope(session);

    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) return errorResponse("Invalid course ID", 400);

    await dbConnect();

    const course = (await Course.findById(id).lean()) as unknown as {
      teacherId: Types.ObjectId | null;
      departmentId?: Types.ObjectId | null;
    } | null;
    if (!course) return notFoundResponse("Course not found");

    if (sessionUser.role === "teacher") {
      const teacher = (await Teacher.findOne({ userId: sessionUser.id }).lean()) as unknown as { _id: Types.ObjectId } | null;
      if (!teacher || !course.teacherId || course.teacherId.toString() !== teacher._id.toString()) {
        return forbiddenResponse("Access denied");
      }
    } else if (sessionUser.role !== "admin") {
      return forbiddenResponse("Access denied");
    } else if (
      scope?.assignedDepartment &&
      (!course.departmentId || course.departmentId.toString() !== scope.assignedDepartment)
    ) {
      return forbiddenResponse("You can only view students of your own department's courses");
    }

    const enrollments = (await Enrollment.find({ courseId: id })
      .populate({
        path: "studentId",
        populate: { path: "userId", select: "name email" },
      })
      .lean()) as unknown as { studentId: LeanStudent }[];

    const students = enrollments.map((e) => ({
      id: e.studentId._id.toString(),
      rollNo: e.studentId.rollNo,
      department: e.studentId.department,
      semester: e.studentId.semester,
      name: e.studentId.userId?.name,
      email: e.studentId.userId?.email,
    }));

    return successResponse(students);
  } catch (error) {
    console.error("GET /api/courses/:id/students error:", error);
    return serverErrorResponse();
  }
}
