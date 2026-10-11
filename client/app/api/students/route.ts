import { auth } from "@/lib/auth-server";
import dbConnect from "@/lib/db";
import { Student } from "@/lib/models";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  serverErrorResponse,
} from "@/lib/api/response";
import { z } from "zod";
import { Types } from "mongoose";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const querySchema = z.object({
  department: z.string().trim().min(1).max(100).optional(),
  departmentId: z.string().regex(objectIdRegex).optional(),
});

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return unauthorizedResponse();

    const role = (session?.user as { role?: string })?.role;
    if (role !== "admin") return forbiddenResponse("Admin only");

    const { searchParams } = new URL(req.url);
    const parsed = querySchema.safeParse({
      department: searchParams.get("department") ?? undefined,
      departmentId: searchParams.get("departmentId") ?? undefined,
    });
    if (!parsed.success) return errorResponse("Invalid query", 400);

    if (parsed.data.department && parsed.data.departmentId) {
      return errorResponse("Use either department or departmentId, not both", 400);
    }

    await dbConnect();

    const filter: Record<string, unknown> = {};
    if (parsed.data.departmentId !== undefined) {
      filter.departmentId = parsed.data.departmentId;
    } else if (parsed.data.department !== undefined) {
      filter.department = parsed.data.department;
    }

    const students = (await Student.find(filter)
      .populate("userId", "-password")
      .lean()) as unknown as {
      _id: Types.ObjectId;
      userId: { _id: Types.ObjectId; name?: string; email?: string; phone?: string; photo?: string; isActive?: boolean };
      rollNo: string;
      department?: string;
      departmentId?: Types.ObjectId | null;
      semester: number;
      createdAt: Date;
      updatedAt: Date;
    }[];

    return successResponse(
      students.map((s) => ({
        id: s._id.toString(),
        userId: s.userId._id.toString(),
        rollNo: s.rollNo,
        department: s.department ?? "",
        departmentId: s.departmentId ? s.departmentId.toString() : null,
        semester: s.semester,
        name: s.userId.name,
        email: s.userId.email,
        phone: s.userId.phone,
        photo: s.userId.photo,
        isActive: s.userId.isActive,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      }))
    );
  } catch (error) {
    console.error("GET /api/students error:", error);
    return serverErrorResponse();
  }
}