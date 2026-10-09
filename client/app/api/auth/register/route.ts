import bcrypt from "bcryptjs";
import { z } from "zod";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import { Student, Teacher, User } from "@/lib/models";
import { badRequest, conflict, created, forbidden, serverError, unauthorized } from "@/lib/api/response";

const registerSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.email(),
  password: z.string().min(8).max(128),
  role: z.enum(["student", "teacher"]),
  phone: z.string().min(3).max(30).optional(),
  department: z.string().min(1).max(120).optional(),
  rollNo: z.string().min(1).max(40).optional(),
  semester: z.coerce.number().int().min(1).max(12).optional(),
  designation: z.string().max(120).optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return unauthorized();
  if (session.user.role !== "admin") return forbidden("Only administrators can create accounts");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Request body must be valid JSON");
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) return badRequest("Validation failed", parsed.error.flatten());
  const data = parsed.data;

  if (data.role === "student" && (!data.rollNo || !data.department || data.semester === undefined)) {
    return badRequest("rollNo, department and semester are required for students");
  }
  if (data.role === "teacher" && !data.department) {
    return badRequest("department is required for teachers");
  }

  try {
    await connectToDatabase();
    const email = data.email.toLowerCase();

    const existing = await User.findOne({ email });
    if (existing) return conflict("An account with this email already exists");

    const password = await bcrypt.hash(data.password, 12);
    const user = await User.create({
      name: data.name,
      email,
      password,
      role: data.role,
      phone: data.phone,
    });

    if (data.role === "student") {
      await Student.create({
        userId: user._id,
        rollNo: data.rollNo,
        department: data.department,
        semester: data.semester,
      });
    } else {
      await Teacher.create({
        userId: user._id,
        department: data.department,
        designation: data.designation,
      });
    }

    return created({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ValidationError") {
      return badRequest(error.message);
    }
    return serverError();
  }
}
