import { auth } from "@/lib/auth-server";
import dbConnect from "@/lib/db";
import { User, Teacher } from "@/lib/models";
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
    if (!(await validateId(id))) return errorResponse("Invalid teacher ID", 400);

    const sessionUser = session.user as { id: string; role: string };
    const isAdmin = sessionUser.role === "admin";

    await dbConnect();

    let teacher;
    if (isAdmin) {
      teacher = await Teacher.findById(id).populate("userId", "-password").lean();
    } else {
      const user = await User.findById(sessionUser.id).lean();
      if (!user) return notFoundResponse("User not found");
      teacher = await Teacher.findOne({ userId: user._id }).populate("userId", "-password").lean();
      if (!teacher || teacher._id.toString() !== id) return forbiddenResponse("Access denied");
    }

    if (!teacher) return notFoundResponse("Teacher not found");

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
    console.error("GET /api/teachers/:id error:", error);
    return serverErrorResponse();
  }
}
