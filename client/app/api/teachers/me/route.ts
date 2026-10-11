import { auth } from "@/lib/auth-server";
import dbConnect from "@/lib/db";
import { Teacher } from "@/lib/models";
import { successResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse, serverErrorResponse } from "@/lib/api/response";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return unauthorizedResponse();

    const sessionUser = session.user as { id: string; role: string };
    if (sessionUser.role !== "teacher") {
      return forbiddenResponse("Teachers only");
    }

    await dbConnect();

    const teacher = await Teacher.findOne({ userId: sessionUser.id })
      .populate("userId", "-password")
      .lean();

    if (!teacher) return notFoundResponse("Teacher profile not found");

    return successResponse({
      id: teacher._id.toString(),
      userId: teacher.userId._id.toString(),
      department: teacher.department,
      designation: teacher.designation,
      name: teacher.userId.name,
      email: teacher.userId.email,
      phone: teacher.userId.phone,
      photo: teacher.userId.photo,
      isActive: teacher.userId.isActive,
      createdAt: teacher.createdAt,
      updatedAt: teacher.updatedAt,
    });
  } catch (error) {
    console.error("GET /api/teachers/me error:", error);
    return serverErrorResponse();
  }
}
