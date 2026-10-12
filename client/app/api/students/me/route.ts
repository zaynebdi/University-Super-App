import { auth } from "@/lib/auth-server";
import dbConnect from "@/lib/db";
import { Student } from "@/lib/models";
import { successResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse, serverErrorResponse } from "@/lib/api/response";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return unauthorizedResponse();

    const sessionUser = session.user as { id: string; role: string };
    if (sessionUser.role !== "student") {
      return forbiddenResponse("Students only");
    }

    await dbConnect();

    const student = await Student.findOne({ userId: sessionUser.id })
      .populate("userId", "-password")
      .lean();

    if (!student) return notFoundResponse("Student profile not found");

    return successResponse({
      id: student._id.toString(),
      userId: student.userId._id.toString(),
      rollNo: student.rollNo,
      department: student.department,
      semester: student.semester,
      name: student.userId.name,
      email: student.userId.email,
      phone: student.userId.phone,
      photo: student.userId.photo,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
    });
  } catch (error) {
    console.error("GET /api/students/me error:", error);
    return serverErrorResponse();
  }
}
