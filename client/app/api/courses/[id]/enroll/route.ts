import { auth } from "@/lib/auth-server";
import dbConnect from "@/lib/db";
import { Course, Student, User, Enrollment } from "@/lib/models";
import { createdResponse, errorResponse, forbiddenResponse, conflictResponse, notFoundResponse, serverErrorResponse } from "@/lib/api/response";
import { z } from "zod";
import { Types } from "mongoose";

const enrollSchema = z
  .object({
    studentId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  })
  .strict();

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string })?.role;
    if (role !== "admin") return forbiddenResponse("Admin only");

    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) return errorResponse("Invalid course ID", 400);

    const body = await req.json();
    const parsed = enrollSchema.safeParse(body);
    if (!parsed.success) return errorResponse("Invalid input", 400);

    await dbConnect();

    const course = await Course.findById(id).lean();
    if (!course) return notFoundResponse("Course not found");

    const student = (await Student.findById(parsed.data.studentId).lean()) as unknown as { userId: Types.ObjectId } | null;
    if (!student) return notFoundResponse("Student not found");

    const studentUser = (await User.findById(student.userId).lean()) as unknown as { isActive?: boolean } | null;
    if (!studentUser || !studentUser.isActive) return conflictResponse("Student is inactive");

    const existing = await Enrollment.findOne({ courseId: id, studentId: parsed.data.studentId }).lean();
    if (existing) return conflictResponse("Student already enrolled in this course");

    const enrollment = (await Enrollment.create({
      studentId: parsed.data.studentId,
      courseId: id,
      enrolledAt: new Date(),
    })) as unknown as { _id: Types.ObjectId; enrolledAt: Date };

    return createdResponse({
      id: enrollment._id.toString(),
      studentId: parsed.data.studentId,
      courseId: id,
      enrolledAt: enrollment.enrolledAt,
    });
  } catch (error) {
    if (typeof error === "object" && error !== null && (error as { code?: number }).code === 11000) {
      return conflictResponse("Student is already enrolled in this course");
    }
    console.error("POST /api/courses/:id/enroll error:", error);
    return serverErrorResponse();
  }
}
