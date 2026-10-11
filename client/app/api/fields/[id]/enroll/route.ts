import { auth } from "@/lib/auth-server";
import dbConnect from "@/lib/db";
import { Field, Student } from "@/lib/models";
import { getAdminScope } from "@/lib/admin-scope";
import {
  successResponse,
  errorResponse,
  forbiddenResponse,
  notFoundResponse,
  serverErrorResponse,
} from "@/lib/api/response";
import { enrollFieldStudents } from "@/lib/enroll-field";
import { z } from "zod";
import { Types } from "mongoose";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const enrollSchema = z
  .object({
    studentIds: z
      .array(z.string().regex(objectIdRegex))
      .min(1)
      .max(500),
  })
  .strict();

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const scope = getAdminScope(session);
    if (!scope) return forbiddenResponse("Admin only");

    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) return errorResponse("Invalid field ID", 400);

    const body = await req.json().catch(() => null);
    const parsed = enrollSchema.safeParse(body);
    if (!parsed.success) return errorResponse("Invalid input", 400);

    await dbConnect();

    const field = (await Field.findById(id).lean()) as unknown as {
      _id: Types.ObjectId;
      departmentId?: Types.ObjectId | null;
      isActive?: boolean;
    } | null;
    if (!field) return notFoundResponse("Field not found");

    if (
      scope.assignedDepartment &&
      (!field.departmentId || field.departmentId.toString() !== scope.assignedDepartment)
    ) {
      return forbiddenResponse("You can only enroll students in your own department");
    }

    if (scope.assignedDepartment) {
      const found = (await Student.countDocuments({
        _id: { $in: parsed.data.studentIds },
        departmentId: scope.assignedDepartment,
      })) as number;
      if (found !== parsed.data.studentIds.length) {
        return forbiddenResponse("One or more selected students are not in your department");
      }
    }

    const result = await enrollFieldStudents(id, parsed.data.studentIds);
    return successResponse(result);
  } catch (error) {
    if (typeof error === "object" && error !== null) {
      const name = (error as { name?: string }).name;
      if (name === "FieldNotFoundError") return notFoundResponse("Field not found");
      if (name === "InactiveFieldError") return errorResponse("This field is inactive", 400);
      if (name === "StudentNotFoundError") return errorResponse("No matching students found", 400);
    }
    console.error("POST /api/fields/:id/enroll error:", error);
    return serverErrorResponse();
  }
}