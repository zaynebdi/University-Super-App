import { auth } from "@/lib/auth-server";
import dbConnect from "@/lib/db";
import { Department, Course } from "@/lib/models";
import { getAdminScope } from "@/lib/admin-scope";
import {
  successResponse,
  createdResponse,
  errorResponse,
  forbiddenResponse,
  conflictResponse,
  serverErrorResponse,
} from "@/lib/api/response";
import { z } from "zod";
import { Types } from "mongoose";

const createDepartmentSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    code: z.string().trim().min(1).max(20),
    isActive: z.boolean().optional(),
  })
  .strict();

const listQuerySchema = z.object({
  activeOnly: z.enum(["true", "false"]).optional(),
});

interface LeanDepartment {
  _id: Types.ObjectId;
  name: string;
  code: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface LeanCourse {
  _id: Types.ObjectId;
  code: string;
  title: string;
  departmentId: Types.ObjectId;
}

function toDepartmentDTO(department: LeanDepartment, courses: { id: string; code: string; title: string }[]) {
  return {
    id: department._id.toString(),
    name: department.name,
    code: department.code,
    isActive: department.isActive,
    courseCount: courses.length,
    courses,
    createdAt: department.createdAt,
    updatedAt: department.updatedAt,
  };
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    const scope = getAdminScope(session);
    if (!scope) return forbiddenResponse("Admin only");

    const { searchParams } = new URL(req.url);
    const parsed = listQuerySchema.safeParse({
      activeOnly: searchParams.get("activeOnly") ?? undefined,
    });
    if (!parsed.success) return errorResponse("Invalid query", 400);

    await dbConnect();

    const filter: Record<string, unknown> =
      parsed.data.activeOnly === "true" ? { isActive: true } : {};
    if (scope.assignedDepartment) {
      // Department admins only see their own department.
      filter._id = scope.assignedDepartment;
    }
    const departments = (await Department.find(filter).lean()) as unknown as LeanDepartment[];

    const ids = departments.map((d) => d._id);
    const courses = ids.length
      ? ((await Course.find({ departmentId: { $in: ids } })
          .select("code title departmentId")
          .lean()) as unknown as LeanCourse[])
      : [];

    const byDept = new Map<string, { id: string; code: string; title: string }[]>();
    for (const c of courses) {
      const key = c.departmentId.toString();
      const list = byDept.get(key) ?? [];
      list.push({ id: c._id.toString(), code: c.code, title: c.title });
      byDept.set(key, list);
    }

    return successResponse(
      departments.map((d) => toDepartmentDTO(d, byDept.get(d._id.toString()) ?? []))
    );
  } catch (error) {
    console.error("GET /api/departments error:", error);
    return serverErrorResponse();
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const scope = getAdminScope(session);
    if (!scope) return forbiddenResponse("Admin only");
    if (scope.assignedDepartment) {
      return forbiddenResponse("Only a super admin can create departments");
    }

    const body = await req.json();
    const parsed = createDepartmentSchema.safeParse(body);
    if (!parsed.success) return errorResponse("Invalid input", 400);

    await dbConnect();

    const existing = await Department.findOne({
      $or: [{ name: parsed.data.name }, { code: parsed.data.code }],
    })
      .collation({ locale: "en", strength: 2 })
      .lean();
    if (existing) return conflictResponse("Department name or code already exists");

    const created = await Department.create({
      name: parsed.data.name,
      code: parsed.data.code,
      isActive: parsed.data.isActive ?? true,
    });

    return createdResponse(
      toDepartmentDTO(created as unknown as LeanDepartment, [])
    );
  } catch (error) {
    if (typeof error === "object" && error !== null && (error as { code?: number }).code === 11000) {
      return conflictResponse("Department name or code already exists");
    }
    console.error("POST /api/departments error:", error);
    return serverErrorResponse();
  }
}