import { auth } from "@/lib/auth-server";
import dbConnect from "@/lib/db";
import { User } from "@/lib/models";
import { errorResponse, successResponse, forbiddenResponse, conflictResponse } from "@/lib/api/response";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.email(),
  password: z.string().min(8),
  role: z.enum(["student", "teacher"]),
});

export async function POST(req: Request) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "admin") return forbiddenResponse("Admin only");

  const body = await req.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) return errorResponse("Invalid input", 400);

  await dbConnect();

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

  if (parsed.data.role === "student") {
    const { Student } = await import("@/lib/models");
    await Student.create({ userId: user._id, rollNo: "", department: "", semester: 1 });
  } else if (parsed.data.role === "teacher") {
    const { Teacher } = await import("@/lib/models");
    await Teacher.create({ userId: user._id, department: "", designation: "" });
  }

  return successResponse({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  });
}