import { auth } from "@/lib/auth-server";
import dbConnect from "@/lib/db";
import { Course, Enrollment, Result, Teacher } from "@/lib/models";
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
  department?: string | null;
  departmentId?: Types.ObjectId | null;
  semester: number;
  userId: LeanUser | null;
}

interface LeanEnrollment {
  studentId: LeanStudent;
}

interface LeanCourse {
  _id: Types.ObjectId;
  code: string;
  title: string;
  semester: number;
  creditHours: number;
  teacherId: Types.ObjectId | null;
  departmentId?: Types.ObjectId | null;
}

interface LeanResultRow {
  _id: Types.ObjectId;
  studentId: Types.ObjectId;
  marks: number;
  grade: string;
  feedback?: string | null;
}

/**
 * Gradebook for one course: the enrolled roster joined with any recorded
 * result plus the class average over graded students. This is what the
 * faculty grades page needs — it cannot use the per-student results endpoint
 * (teachers are not allowed to enumerate arbitrary students).
 */
export async function GET(
  _req: Request,
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

    await dbConnect();

    const course = (await Course.findById(courseId).lean()) as unknown as LeanCourse | null;
    if (!course) return notFoundResponse("Course not found");

    if (sessionUser.role === "teacher") {
      const teacher = (await Teacher.findOne({ userId: sessionUser.id }).lean()) as unknown as {
        _id: Types.ObjectId;
      } | null;
      if (!teacher || !course.teacherId || course.teacherId.toString() !== teacher._id.toString()) {
        return forbiddenResponse("You can only view results for your own courses");
      }
    } else {
      const scope = getAdminScope(session);
      if (
        scope?.assignedDepartment &&
        (!course.departmentId || course.departmentId.toString() !== scope.assignedDepartment)
      ) {
        return forbiddenResponse("You can only view results of your own department");
      }
    }

    const [enrollments, results] = (await Promise.all([
      Enrollment.find({ courseId })
        .populate({ path: "studentId", populate: { path: "userId", select: "name email" } })
        .lean(),
      Result.find({ courseId }).lean(),
    ])) as unknown as [LeanEnrollment[], LeanResultRow[]];

    const resultByStudent = new Map<string, LeanResultRow>();
    for (const result of results) {
      resultByStudent.set(result.studentId.toString(), result);
    }

    const students = enrollments
      .filter((enrollment) => !!enrollment.studentId)
      .map((enrollment) => {
        const student = enrollment.studentId;
        const result = resultByStudent.get(student._id.toString());
        return {
          id: student._id.toString(),
          rollNo: student.rollNo,
          name: student.userId?.name ?? null,
          email: student.userId?.email ?? null,
          department: student.department ?? null,
          semester: student.semester,
          resultId: result ? result._id.toString() : null,
          marks: result ? result.marks : null,
          grade: result ? result.grade : null,
          feedback: result ? result.feedback ?? "" : "",
        };
      });

    const graded = results.map((result) => result.marks);
    const classAverage =
      graded.length > 0
        ? Math.round((graded.reduce((sum, marks) => sum + marks, 0) / graded.length) * 100) / 100
        : 0;

    return successResponse({
      course: {
        id: course._id.toString(),
        code: course.code,
        title: course.title,
        semester: course.semester,
        creditHours: course.creditHours,
      },
      students,
      classAverage,
    });
  } catch (error) {
    console.error("GET /api/results/course/:courseId error:", error);
    return serverErrorResponse();
  }
}
