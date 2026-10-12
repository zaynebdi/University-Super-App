import { auth } from "@/lib/auth-server";
import dbConnect from "@/lib/db";
import { Attendance, Course, Student, Teacher } from "@/lib/models";
import { getAdminScope } from "@/lib/admin-scope";
import { createdResponse, errorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse, serverErrorResponse } from "@/lib/api/response";
import { z } from "zod";
import { Types } from "mongoose";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const attendanceSchema = z
  .object({
    courseId: z.string().regex(objectIdRegex),
    date: z.string().refine((value) => !Number.isNaN(Date.parse(value)), "Invalid date"),
    records: z
      .array(
        z
          .object({
            studentId: z.string().regex(objectIdRegex),
            status: z.enum(["present", "absent"]),
          })
          .strict()
      )
      .min(1),
  })
  .strict();

function toUtcMidnight(value: string): Date {
  const date = new Date(value);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

interface LeanAttendance {
  _id: Types.ObjectId;
  courseId: Types.ObjectId;
  studentId: Types.ObjectId;
  date: Date;
  status: "present" | "absent";
}

function toAttendanceDTO(record: LeanAttendance) {
  return {
    id: record._id.toString(),
    courseId: record.courseId.toString(),
    studentId: record.studentId.toString(),
    date: record.date,
    status: record.status,
  };
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return unauthorizedResponse();

    const sessionUser = session.user as { id: string; role: string };
    if (sessionUser.role !== "teacher" && sessionUser.role !== "admin") {
      return forbiddenResponse("Teachers and admins only");
    }

    const body = await req.json();
    const parsed = attendanceSchema.safeParse(body);
    if (!parsed.success) return errorResponse("Invalid input", 400);

    const studentIds = parsed.data.records.map((r) => r.studentId);
    if (new Set(studentIds).size !== studentIds.length) {
      return errorResponse("Duplicate student in records", 400);
    }

    await dbConnect();

    const course = (await Course.findById(parsed.data.courseId).lean()) as unknown as {
      _id: Types.ObjectId;
      teacherId: Types.ObjectId | null;
      departmentId?: Types.ObjectId | null;
    } | null;
    if (!course) return notFoundResponse("Course not found");

    if (sessionUser.role === "teacher") {
      const teacher = (await Teacher.findOne({ userId: sessionUser.id }).lean()) as unknown as { _id: Types.ObjectId } | null;
      if (!teacher || !course.teacherId || course.teacherId.toString() !== teacher._id.toString()) {
        return forbiddenResponse("You can only mark attendance for your own courses");
      }
    } else {
      const scope = getAdminScope(session);
      if (
        scope?.assignedDepartment &&
        (!course.departmentId || course.departmentId.toString() !== scope.assignedDepartment)
      ) {
        return forbiddenResponse("You can only mark attendance for your own department");
      }
    }

    const students = (await Student.find({ _id: { $in: studentIds } }).lean()) as unknown as {
      _id: Types.ObjectId;
    }[];
    if (students.length !== studentIds.length) {
      return notFoundResponse("One or more students were not found");
    }

    const day = toUtcMidnight(parsed.data.date);

    const saved: LeanAttendance[] = [];
    for (const record of parsed.data.records) {
      const updated = (await Attendance.findOneAndUpdate(
        { courseId: parsed.data.courseId, studentId: record.studentId, date: day },
        { $set: { status: record.status } },
        { upsert: true, new: true }
      ).lean()) as unknown as LeanAttendance;
      saved.push(updated);
    }

    return createdResponse(saved.map(toAttendanceDTO));
  } catch (error) {
    console.error("POST /api/attendance error:", error);
    return serverErrorResponse();
  }
}
