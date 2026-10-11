import { auth } from "@/lib/auth-server";
import dbConnect from "@/lib/db";
import { User, Department, Field } from "@/lib/models";
import {
  errorResponse,
  createdResponse,
  forbiddenResponse,
  conflictResponse,
  serverErrorResponse,
} from "@/lib/api/response";
import { getAdminScope } from "@/lib/admin-scope";
import { createStudentWithRollNumber } from "@/lib/roll-number";
import { Designations, AdminDesignations } from "@/lib/constants";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { Types } from "mongoose";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const baseSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.email(),
  password: z.string().min(8),
});

const registerSchema = z.discriminatedUnion("role", [
  baseSchema.extend({
    role: z.literal("student"),
    departmentId: z.string().regex(objectIdRegex),
    fieldId: z.string().regex(objectIdRegex).optional(),
    semester: z.coerce.number().int().min(1).max(12),
  }),
  baseSchema.extend({
    role: z.literal("teacher"),
    departmentId: z.string().regex(objectIdRegex),
    designation: z.enum(Designations).optional(),
    courseIds: z.array(z.string().regex(objectIdRegex)).max(50).optional(),
  }),
  baseSchema.extend({
    role: z.literal("admin"),
    // Absent/null means "All departments (super admin)"; a value means the
    // admin is scoped to that department (department admin).
    departmentId: z.string().regex(objectIdRegex).nullable().optional(),
    designation: z.enum(AdminDesignations).optional(),
  }),
]);

interface LeanDepartment {
  _id: Types.ObjectId;
  name: string;
  code: string;
  isActive?: boolean;
}

export async function POST(req: Request) {
  const session = await auth();
  const scope = getAdminScope(session);
  if (!scope) return forbiddenResponse("Admin only");

  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) return errorResponse("Invalid input", 400);

  try {
    // Only a super admin can create other admins.
    if (parsed.data.role === "admin" && scope.assignedDepartment) {
      return forbiddenResponse("Only a super admin can create admins");
    }

    // Department admins may only create students/teachers of their own department.
    if (scope.assignedDepartment && parsed.data.role !== "admin") {
      if (parsed.data.departmentId !== scope.assignedDepartment) {
        return forbiddenResponse("You can only add users to your own department");
      }
    }

    await dbConnect();

    const department = parsed.data.role === "admin"
      ? parsed.data.departmentId
        ? ((await Department.findById(parsed.data.departmentId).lean()) as unknown as LeanDepartment | null)
        : null
      : ((await Department.findById(parsed.data.departmentId).lean()) as unknown as LeanDepartment | null);

    if (parsed.data.role !== "admin" && (!department || department.isActive === false)) {
      return errorResponse("Select a valid department", 400);
    }
    if (parsed.data.role === "admin" && parsed.data.departmentId && (!department || department.isActive === false)) {
      return errorResponse("Select a valid department", 400);
    }

    let fieldId: Types.ObjectId | null | undefined;
    if (parsed.data.role === "student" && parsed.data.fieldId) {
      const field = (await Field.findById(parsed.data.fieldId).lean()) as unknown as {
        _id: Types.ObjectId;
        departmentId?: Types.ObjectId | null;
        isActive?: boolean;
      } | null;
      if (!field || field.isActive === false) {
        return errorResponse("Select a valid field", 400);
      }
      if (field.departmentId && field.departmentId.toString() !== parsed.data.departmentId) {
        return errorResponse("Field does not belong to the selected department", 400);
      }
      fieldId = field._id;
    }

    const existing = await User.findOne({ email: parsed.data.email });
    if (existing) return conflictResponse("Email already registered");

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const user = await User.create({
      name: parsed.data.name,
      email: parsed.data.email,
      password: passwordHash,
      role: parsed.data.role,
      isActive: true,
      ...(parsed.data.role === "admin"
        ? { assignedDepartment: parsed.data.departmentId ?? null }
        : {}),
    });

    let rollNo: string | undefined;
    let assignedDepartmentId: string | null | undefined;

    if (parsed.data.role === "student") {
      const result = await createStudentWithRollNumber(
        user._id,
        department!._id,
        department!.code,
        department!.name,
        parsed.data.semester,
        undefined,
        fieldId ?? null
      );
      rollNo = result.rollNo;
    } else if (parsed.data.role === "teacher") {
      const { Teacher, Course } = await import("@/lib/models");
      const teacher = await Teacher.create({
        userId: user._id,
        department: department!.name,
        departmentId: department!._id,
        designation: parsed.data.designation,
      });

      if (parsed.data.courseIds && parsed.data.courseIds.length > 0) {
        const courses = (await Course.find({ _id: { $in: parsed.data.courseIds } })
          .select("departmentId")
          .lean()) as unknown as { _id: Types.ObjectId; departmentId?: Types.ObjectId | null }[];

        const deptIdStr = department!._id.toString();
        const validIds = courses
          .filter((c) => c.departmentId && c.departmentId.toString() === deptIdStr)
          .map((c) => c._id);
        if (validIds.length > 0) {
          await Course.updateMany(
            { _id: { $in: validIds } },
            { $set: { teacherId: teacher._id } }
          );
        }
      }
    } else {
      assignedDepartmentId = parsed.data.departmentId ?? null;
    }

    return createdResponse({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      ...(rollNo ? { rollNo } : {}),
      ...(parsed.data.role === "admin" ? { assignedDepartmentId } : {}),
    });
  } catch (error) {
    if (typeof error === "object" && error !== null && (error as { code?: number }).code === 11000) {
      return conflictResponse("Email already registered");
    }
    console.error("POST /api/auth/register error:", error);
    return serverErrorResponse();
  }
}