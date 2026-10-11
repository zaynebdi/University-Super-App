import { auth } from "@/lib/auth-server";
import dbConnect from "@/lib/db";
import { Department, Course } from "@/lib/models";
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

const updateDepartmentSchema = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),
    code: z.string().trim().min(1).max(20).optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

interface LeanCourse {
  _id: Types.ObjectId;
  code: string;
  title: string;
  departmentId: Types.ObjectId;
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string })?.role;
    if (role !== "admin") return forbiddenResponse("Admin only");

    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) return errorResponse("Invalid department ID", 400);

    const body = await req.json();
    const parsed = updateDepartmentSchema.safeParse(body);
    if (!parsed.success) return errorResponse("Invalid input", 400);

    await dbConnect();

    const existing = await Department.findById(id).lean();
    if (!existing) return notFoundResponse("Department not found");

    if (parsed.data.name !== undefined || parsed.data.code !== undefined) {
      const or: Record<string, unknown>[] = [];
      if (parsed.data.name !== undefined) or.push({ name: parsed.data.name });
      if (parsed.data.code !== undefined) or.push({ code: parsed.data.code });
      const duplicate = await Department.findOne({
        $or: or,
        _id: { $ne: id },
      })
        .collation({ locale: "en", strength: 2 })
        .lean();
      if (duplicate) return conflictResponse("Department name or code already exists");
    }

    const updateData: Record<string, unknown> = { ...parsed.data };
    await Department.findByIdAndUpdate(id, updateData, { new: true }).lean();

    const department = await Department.findById(id).lean();
    if (!department) return notFoundResponse("Department not found");

    const courses = ((await Course.find({ departmentId: id })
      .select("code title")
      .lean()) as unknown as LeanCourse[]).map((c) => ({
      id: c._id.toString(),
      code: c.code,
      title: c.title,
    }));

    return successResponse({
      id: department._id.toString(),
      name: department.name,
      code: department.code,
      isActive: department.isActive,
      courseCount: courses.length,
      courses,
      createdAt: department.createdAt,
      updatedAt: department.updatedAt,
    });
  } catch (error) {
    if (typeof error === "object" && error !== null && (error as { code?: number }).code === 11000) {
      return conflictResponse("Department name or code already exists");
    }
    console.error("PUT /api/departments/:id error:", error);
    return serverErrorResponse();
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string })?.role;
    if (role !== "admin") return forbiddenResponse("Admin only");

    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) return errorResponse("Invalid department ID", 400);

    await dbConnect();

    const department = await Department.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).lean();
    if (!department) return notFoundResponse("Department not found");

    return successResponse({ message: "Department deactivated successfully" });
  } catch (error) {
    console.error("DELETE /api/departments/:id error:", error);
    return serverErrorResponse();
  }
}