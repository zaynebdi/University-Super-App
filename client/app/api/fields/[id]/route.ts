import { auth } from "@/lib/auth-server";
import dbConnect from "@/lib/db";
import { Field, Department, Course } from "@/lib/models";
import { getAdminScope } from "@/lib/admin-scope";
import {
  successResponse,
  errorResponse,
  forbiddenResponse,
  conflictResponse,
  notFoundResponse,
  serverErrorResponse,
} from "@/lib/api/response";
import { z } from "zod";
import { Types } from "mongoose";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const updateFieldSchema = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),
    code: z.string().trim().min(1).max(20).optional(),
    departmentId: z.string().regex(objectIdRegex).optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

interface LeanField {
  _id: Types.ObjectId;
  name: string;
  code: string;
  departmentId: Types.ObjectId | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface LeanCourse {
  _id: Types.ObjectId;
  code: string;
  title: string;
  fieldId: Types.ObjectId;
}

function toFieldDTO(
  field: LeanField,
  courses: { id: string; code: string; title: string }[] = []
) {
  return {
    id: field._id.toString(),
    name: field.name,
    code: field.code,
    departmentId: field.departmentId ? field.departmentId.toString() : null,
    isActive: field.isActive,
    courseCount: courses.length,
    courses,
    createdAt: field.createdAt,
    updatedAt: field.updatedAt,
  };
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: number }).code === 11000
  );
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const scope = getAdminScope(session);
    if (!scope) return forbiddenResponse("Admin only");

    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) return errorResponse("Invalid field ID", 400);

    await dbConnect();

    const field = (await Field.findById(id).lean()) as unknown as LeanField | null;
    if (!field) return notFoundResponse("Field not found");

    if (
      scope.assignedDepartment &&
      (!field.departmentId || field.departmentId.toString() !== scope.assignedDepartment)
    ) {
      return forbiddenResponse("You can only manage fields of your own department");
    }

    const courses = (await Course.find({ fieldId: field._id })
      .select("code title")
      .lean()) as unknown as LeanCourse[];

    return successResponse(
      toFieldDTO(
        field,
        courses.map((c) => ({ id: c._id.toString(), code: c.code, title: c.title }))
      )
    );
  } catch (error) {
    console.error("GET /api/fields/:id error:", error);
    return serverErrorResponse();
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const scope = getAdminScope(session);
    if (!scope) return forbiddenResponse("Admin only");

    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) return errorResponse("Invalid field ID", 400);

    const body = await req.json();
    const parsed = updateFieldSchema.safeParse(body);
    if (!parsed.success) return errorResponse("Invalid input", 400);

    await dbConnect();

    const existing = (await Field.findById(id).lean()) as unknown as LeanField | null;
    if (!existing) return notFoundResponse("Field not found");

    if (
      scope.assignedDepartment &&
      (!existing.departmentId || existing.departmentId.toString() !== scope.assignedDepartment)
    ) {
      return forbiddenResponse("You can only manage fields of your own department");
    }

    const updateData: Record<string, unknown> = { ...parsed.data };

    if (parsed.data.departmentId !== undefined) {
      if (
        scope.assignedDepartment &&
        parsed.data.departmentId !== scope.assignedDepartment
      ) {
        return forbiddenResponse("You can only assign fields to your own department");
      }
      const department = (await Department.findById(parsed.data.departmentId).lean()) as unknown as {
        _id: Types.ObjectId;
        isActive?: boolean;
      } | null;
      if (!department) return notFoundResponse("Department not found");
      if (department.isActive === false) {
        return conflictResponse("Cannot move a field to an inactive department");
      }
      updateData.departmentId = parsed.data.departmentId;
    }

    if (parsed.data.name !== undefined || parsed.data.code !== undefined) {
      const or: Record<string, unknown>[] = [];
      if (parsed.data.name !== undefined) or.push({ name: parsed.data.name });
      if (parsed.data.code !== undefined) or.push({ code: parsed.data.code });
      const duplicate = await Field.findOne({
        _id: { $ne: id },
        $or: or,
      })
        .collation({ locale: "en", strength: 2 })
        .lean();
      if (duplicate) return conflictResponse("Field name or code already exists");
    }

    const updated = (await Field.findByIdAndUpdate(id, updateData, {
      new: true,
    }).lean()) as unknown as LeanField;

    const courses = (await Course.find({ fieldId: updated._id })
      .select("code title")
      .lean()) as unknown as LeanCourse[];

    return successResponse(
      toFieldDTO(
        updated,
        courses.map((c) => ({ id: c._id.toString(), code: c.code, title: c.title }))
      )
    );
  } catch (error) {
    if (isDuplicateKeyError(error)) return conflictResponse("Field name or code already exists");
    console.error("PUT /api/fields/:id error:", error);
    return serverErrorResponse();
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const scope = getAdminScope(session);
    if (!scope) return forbiddenResponse("Admin only");

    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) return errorResponse("Invalid field ID", 400);

    await dbConnect();

    const existing = (await Field.findById(id).lean()) as unknown as LeanField | null;
    if (!existing) return notFoundResponse("Field not found");

    if (
      scope.assignedDepartment &&
      (!existing.departmentId || existing.departmentId.toString() !== scope.assignedDepartment)
    ) {
      return forbiddenResponse("You can only manage fields of your own department");
    }

    const courseCount = await Course.countDocuments({ fieldId: id });
    if (courseCount > 0) {
      return conflictResponse(
        `Cannot delete this field because ${courseCount} course${courseCount === 1 ? "" : "s"} still belong to it. Delete or reassign the courses first.`
      );
    }

    await Field.findByIdAndDelete(id);

    return successResponse({ message: "Field deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/fields/:id error:", error);
    return serverErrorResponse();
  }
}