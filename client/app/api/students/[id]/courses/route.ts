import { auth } from "@/lib/auth-server";
import dbConnect from "@/lib/db";
import { User, Student, Enrollment } from "@/lib/models";
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse, serverErrorResponse } from "@/lib/api/response";
import { Types } from "mongoose";

async function validateId(id: string) {
  return Types.ObjectId.isValid(id);
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return unauthorizedResponse();

    const { id } = await params;
    if (!(await validateId(id))) return errorResponse("Invalid student ID", 400);

    const sessionUser = session.user as { id: string; role: string };
    const isAdmin = sessionUser.role === "admin";

    await dbConnect();

    let student;
    if (isAdmin) {
      student = await Student.findById(id).lean();
    } else {
      const user = await User.findById(sessionUser.id).lean();
      if (!user) return notFoundResponse("User not found");
      student = await Student.findOne({ userId: user._id }).lean();
      if (!student || student._id.toString() !== id) return forbiddenResponse("Access denied");
    }

    if (!student) return notFoundResponse("Student not found");

    const enrollments = await Enrollment.find({ studentId: student._id })
      .populate({
        path: "courseId",
        populate: {
          path: "teacherId",
          populate: { path: "userId" },
        },
      })
      .lean();

    const courses = enrollments.map((e) => ({
      id: e.courseId._id.toString(),
      code: e.courseId.code,
      title: e.courseId.title,
      semester: e.courseId.semester,
      creditHours: e.courseId.creditHours,
      teacher: e.courseId.teacherId
        ? {
            id: e.courseId.teacherId._id.toString(),
            name: e.courseId.teacherId.userId.name,
            email: e.courseId.teacherId.userId.email,
            department: e.courseId.teacherId.department,
            designation: e.courseId.teacherId.designation,
          }
        : null,
      enrolledAt: e.enrolledAt,
    }));

    return successResponse(courses);
  } catch (error) {
    console.error("GET /api/students/:id/courses error:", error);
    return serverErrorResponse();
  }
}
