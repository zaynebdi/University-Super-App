import { auth } from "@/lib/auth-server";
import dbConnect from "@/lib/db";
import { Teacher } from "@/lib/models";
import { successResponse, forbiddenResponse, serverErrorResponse } from "@/lib/api/response";

export async function GET() {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string })?.role;
    if (role !== "admin") return forbiddenResponse("Admin only");

    await dbConnect();

    const teachers = await Teacher.find()
      .populate("userId", "-password")
      .lean();

    return successResponse(teachers.map((t) => ({
      id: t._id.toString(),
      userId: t.userId._id.toString(),
      department: t.department,
      designation: t.designation,
      name: t.userId.name,
      email: t.userId.email,
      phone: t.userId.phone,
      photo: t.userId.photo,
      isActive: t.userId.isActive,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    })));
  } catch (error) {
    console.error("GET /api/teachers error:", error);
    return serverErrorResponse();
  }
}
