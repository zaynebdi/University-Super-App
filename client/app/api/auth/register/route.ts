import { auth } from "@/lib/auth-server";
import dbConnect from "@/lib/db";
import { User } from "@/lib/models";
import {
  errorResponse,
  createdResponse,
  forbiddenResponse,
  conflictResponse,
  serverErrorResponse,
} from "@/lib/api/response";
import bcrypt from "bcryptjs";
import { z } from "zod";

const baseSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.email(),
  password: z.string().min(8),
});

const registerSchema = z.discriminatedUnion("role", [
  baseSchema.extend({
    role: z.literal("student"),
    rollNo: z.string().min(1).max(50),
    department: z.string().min(1).max(100),
    semester: z.coerce.number().int().min(1).max(12),
  }),
  baseSchema.extend({
    role: z.literal("teacher"),
    department: z.string().min(1).max(100),
    designation: z.string().max(100).optional(),
  }),
]);

export async function POST(req: Request) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "admin") return forbiddenResponse("Admin only");

  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) return errorResponse("Invalid input", 400);

  try {
    await dbConnect();

    const existing = await User.findOne({ email: parsed.data.email });
    if (existing) return conflictResponse("Email already registered");

    if (parsed.data.role === "student") {
      const { Student } = await import("@/lib/models");
      const rollTaken = await Student.findOne({ rollNo: parsed.data.rollNo });
      if (rollTaken) return conflictResponse("Roll number already in use");
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const user = await User.create({
      name: parsed.data.name,
      email: parsed.data.email,
      password: passwordHash,
      role: parsed.data.role,
      isActive: true,
    });

    if (parsed.data.role === "student") {
      const { Student } = await import("@/lib/models");
      await Student.create({
        userId: user._id,
        rollNo: parsed.data.rollNo,
        department: parsed.data.department,
        semester: parsed.data.semester,
      });
    } else {
      const { Teacher } = await import("@/lib/models");
      await Teacher.create({
        userId: user._id,
        department: parsed.data.department,
        designation: parsed.data.designation,
      });
    }

    return createdResponse({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch {
    return serverErrorResponse("Failed to create user");
  }
}