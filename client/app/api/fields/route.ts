import { auth } from "@/lib/auth-server";
import dbConnect from "@/lib/db";
import { Field, Department, Course } from "@/lib/models";
import { getAdminScope } from "@/lib/admin-scope";
import {
  successResponse,
  createdResponse,
  errorResponse,
  forbiddenResponse,
  conflictResponse,
  notFoundResponse,
  serverErrorResponse,
} from "@/lib/api/response";
import { z } from "zod";
import { Types } from "mongoose";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const createFieldSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    code: z.string().trim().min(1).max(20),
    departmentId: z.string().regex(objectIdRegex),
    isActive: z.boolean().optional(),
  })
  .strict();

const listQuerySchema = z.object({
  departmentId: z.string().regex(objectIdRegex).optional(),
});

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
  departmentId?: Types.ObjectId | null;
}

function toFieldDTO(
  field: { _id: Types.ObjectId; name: string; code: string; departmentId: Types.ObjectId | null; isActive: boolean; createdAt: Date; updatedAt: Date },
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

export async function GET(req: Request) {
  try {
    const session = await auth();
    const scope = getAdminScope(session);
    if (!scope) return forbiddenResponse("Admin only");

    const { searchParams } = new URL(req.url);
    const parsed = listQuerySchema.safeParse({
      departmentId: searchParams.get("departmentId") ?? undefined,
    });
    if (!parsed.success) return errorResponse("Invalid query", 400);

    let requestedDepartment = parsed.data.departmentId;
    if (scope.assignedDepartment) {
      // Department admins only see their own department's fields.
      if (requestedDepartment && requestedDepartment !== scope.assignedDepartment) {
        return forbiddenResponse("You can only manage fields of your own department");
      }
      requestedDepartment = scope.assignedDepartment;
    }

    await dbConnect();

    const filter: Record<string, unknown> = {};
    if (requestedDepartment !== undefined) filter.departmentId = requestedDepartment;

    const fields = (await Field.find(filter).sort({ name: 1 }).lean()) as unknown as LeanField[];
    const courseFilter: Record<string, unknown> = {};
    if (fields.length > 0) courseFilter.fieldId = { $in: fields.map((f) => f._id) };
    const courses = (await Course.find(courseFilter)
      .select("code title fieldId departmentId")
      .lean()) as unknown as LeanCourse[];

    const coursesByField = new Map<string, { id: string; code: string; title: string }[]>();
    for (const course of courses) {
      const fieldId = course.fieldId.toString();
      if (!coursesByField.has(fieldId)) coursesByField.set(fieldId, []);
      coursesByField.get(fieldId)!.push({
        id: course._id.toString(),
        code: course.code,
        title: course.title,
      });
    }

    return successResponse(
      fields.map((field) =>
        toFieldDTO(field, coursesByField.get(field._id.toString()) ?? [])
      )
    );
  } catch (error) {
    console.error("GET /api/fields error:", error);
    return serverErrorResponse();
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const scope = getAdminScope(session);
    if (!scope) return forbiddenResponse("Admin only");

    const body = await req.json().catch(() => null);
    const parsed = createFieldSchema.safeParse(body);
    if (!parsed.success) return errorResponse("Invalid input", 400);

    if (
      scope.assignedDepartment &&
      parsed.data.departmentId !== scope.assignedDepartment
    ) {
      return forbiddenResponse("You can only add fields to your own department");
    }

    await dbConnect();

    const department = (await Department.findById(parsed.data.departmentId).lean()) as unknown as {
      _id: Types.ObjectId;
      isActive?: boolean;
    } | null;
    if (!department) return notFoundResponse("Department not found");
    if (department.isActive === false) {
      return conflictResponse("Cannot add a field to an inactive department");
    }

    const dup = await Field.findOne({
      $or: [{ name: parsed.data.name }, { code: parsed.data.code }],
    })
      .collation({ locale: "en", strength: 2 })
      .lean();
    if (dup) return conflictResponse("Field name or code already exists");

    const created = (await Field.create({
      name: parsed.data.name,
      code: parsed.data.code,
      departmentId: parsed.data.departmentId,
      isActive: parsed.data.isActive ?? true,
    })) as unknown as LeanField;

    return createdResponse(toFieldDTO(created));
  } catch (error) {
    if (isDuplicateKeyError(error)) return conflictResponse("Field name or code already exists");
    console.error("POST /api/fields error:", error);
    return serverErrorResponse();
  }
}