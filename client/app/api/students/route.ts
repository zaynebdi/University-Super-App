import { auth } from "@/lib/auth-server";
import dbConnect from "@/lib/db";
import { Student } from "@/lib/models";
import { getAdminScope } from "@/lib/admin-scope";
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
  fieldId: z.string().regex(objectIdRegex).optional(),
});

interface LeanUser {
  _id: Types.ObjectId;
  name?: string;
  email?: string;
  phone?: string;
  photo?: string;
  isActive?: boolean;
}

interface LeanField {
  _id: Types.ObjectId;
  name: string;
  code: string;
}

interface LeanStudent {
  _id: Types.ObjectId;
  userId: LeanUser;
  rollNo: string;
  department?: string;
  departmentId?: Types.ObjectId | null;
  fieldId?: Types.ObjectId | null;
  field?: LeanField | null;
  semester: number;
  createdAt: Date;
  updatedAt: Date;
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return unauthorizedResponse();

    const scope = getAdminScope(session);
    if (!scope) return forbiddenResponse("Admin only");

    const { searchParams } = new URL(req.url);
    const parsed = querySchema.safeParse({
      department: searchParams.get("department") ?? undefined,
      departmentId: searchParams.get("departmentId") ?? undefined,
      fieldId: searchParams.get("fieldId") ?? undefined,
    });
    if (!parsed.success) return errorResponse("Invalid query", 400);

    if (parsed.data.department && parsed.data.departmentId) {
      return errorResponse("Use either department or departmentId, not both", 400);
    }

    let departmentId = parsed.data.departmentId;
    if (scope.assignedDepartment) {
      // Department admins only see students of their own department.
      if (departmentId && departmentId !== scope.assignedDepartment) {
        return forbiddenResponse("You can only view students of your own department");
      }
      departmentId = scope.assignedDepartment;
      if (parsed.data.department) {
        // A name-based filter is fine — the scope constrain still applies.
        departmentId = scope.assignedDepartment;
      }
    }

    await dbConnect();

    const filter: Record<string, unknown> = {};
    if (departmentId !== undefined) {
      filter.departmentId = departmentId;
    } else if (parsed.data.department !== undefined) {
      filter.department = parsed.data.department;
    }

    if (parsed.data.fieldId !== undefined) {
      filter.fieldId = parsed.data.fieldId;
    }

    const students = (await Student.find(filter)
      .populate("userId", "-password")
      .populate("fieldId", "name code")
      .lean()) as unknown as LeanStudent[];

    return successResponse(
      students.map((s) => ({
        id: s._id.toString(),
        userId: s.userId._id.toString(),
        rollNo: s.rollNo,
        department: s.department ?? "",
        departmentId: s.departmentId ? s.departmentId.toString() : null,
        fieldId: s.fieldId ? s.fieldId.toString() : null,
        field: s.field
          ? { id: s.field._id.toString(), name: s.field.name, code: s.field.code }
          : null,
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