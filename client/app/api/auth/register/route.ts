import { auth } from "@/lib/auth-server";
import dbConnect from "@/lib/db";
import { User, Department } from "@/lib/models";
import {
  errorResponse,
  createdResponse,
  forbiddenResponse,
  conflictResponse,
  serverErrorResponse,
} from "@/lib/api/response";
import { createStudentWithRollNumber } from "@/lib/roll-number";
import { Designations } from "@/lib/constants";
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
    semester: z.coerce.number().int().min(1).max(12),
  }),
  baseSchema.extend({
    role: z.literal("teacher"),
    departmentId: z.string().regex(objectIdRegex),
    designation: z.enum(Designations).optional(),
    courseIds: z.array(z.string().regex(objectIdRegex)).max(50).optional(),
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
  const role = (session?.user as { role?: string })?.role;
  if (role !== "admin") return forbiddenResponse("Admin only");

  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) return errorResponse("Invalid input", 400);

  try {
    await dbConnect();

    const department = (await Department.findById(parsed.data.departmentId).lean()) as unknown as LeanDepartment | null;
    if (!department || department.isActive === false) {
      return errorResponse("Select a valid department", 400);
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
    });

    let rollNo: string | undefined;

    if (parsed.data.role === "student") {
      const result = await createStudentWithRollNumber(
        user._id,
        department._id,
        department.code,
        department.name,
        parsed.data.semester
      );
      rollNo = result.rollNo;
    } else {
      const { Teacher, Course } = await import("@/lib/models");
      const teacher = await Teacher.create({
        userId: user._id,
        department: department.name,
        departmentId: department._id,
        designation: parsed.data.designation,
      });

      if (parsed.data.courseIds && parsed.data.courseIds.length > 0) {
        const courses = (await Course.find({ _id: { $in: parsed.data.courseIds } })
          .select("departmentId")
          .lean()) as unknown as { _id: Types.ObjectId; departmentId?: Types.ObjectId | null }[];

        const deptIdStr = department._id.toString();
        const validIds = courses
          .filter((c) => c.departmentId && c.departmentId.toString() === deptIdStr)
          .map((c) => c._id);

        if (validIds.length > 0) {
          await Course.updateMany({ _id: { $in: validIds } }, { teacherId: teacher._id });
        }
      }
    }

    return createdResponse({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      ...(parsed.data.role === "student" ? { rollNo } : {}),
    });
  } catch (error) {
    if (typeof error === "object" && error !== null && (error as { code?: number }).code === 11000) {
      return conflictResponse("Email already registered");
    }
    console.error("POST /api/auth/register error:", error);
    return serverErrorResponse("Failed to create user");
  }
}