import { auth } from "@/lib/auth-server";
import dbConnect from "@/lib/db";
import { User, Student } from "@/lib/models";
import { getAdminScope } from "@/lib/admin-scope";
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
    const scope = getAdminScope(session);
    const isAdmin = sessionUser.role === "admin";

    await dbConnect();

    let student;
    if (isAdmin) {
      student = (await Student.findById(id)
        .populate("userId", "-password")
        .lean()) as unknown as { _id: Types.ObjectId; departmentId?: Types.ObjectId | null; userId: Types.ObjectId } | null;
      if (
        scope?.assignedDepartment &&
        student &&
        (!student.departmentId || student.departmentId.toString() !== scope.assignedDepartment)
      ) {
        return forbiddenResponse("You can only view students of your own department");
      }
    } else {
      const user = await User.findById(sessionUser.id).lean();
      if (!user) return notFoundResponse("User not found");
      student = await Student.findOne({ userId: user._id }).populate("userId", "-password").lean();
      if (!student || student._id.toString() !== id) return forbiddenResponse("Access denied");
    }

    if (!student) return notFoundResponse("Student not found");

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
    console.error("GET /api/students/:id error:", error);
    return serverErrorResponse();
  }
}
