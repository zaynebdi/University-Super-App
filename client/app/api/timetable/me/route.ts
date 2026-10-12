import { auth } from "@/lib/auth-server";
import dbConnect from "@/lib/db";
import { Student, Teacher, Enrollment, Course, Timetable } from "@/lib/models";
import { successResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse, serverErrorResponse } from "@/lib/api/response";
import { DaysOfWeek } from "@/lib/constants";
import { Types } from "mongoose";

const dayOrder = new Map<string, number>(DaysOfWeek.map((d, i) => [d, i]));

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return unauthorizedResponse();

    const sessionUser = session.user as { id: string; role: string };
    if (sessionUser.role !== "student" && sessionUser.role !== "teacher") {
      return forbiddenResponse("Students and teachers only");
    }

    await dbConnect();

    let courseIds: string[] = [];

    if (sessionUser.role === "student") {
      const student = (await Student.findOne({ userId: sessionUser.id }).lean()) as unknown as {
        _id: Types.ObjectId;
      } | null;
      if (!student) return notFoundResponse("Student profile not found");

      const enrollments = (await Enrollment.find({ studentId: student._id }).lean()) as unknown as {
        courseId: Types.ObjectId;
      }[];
      courseIds = enrollments.map((e) => e.courseId.toString());
    } else {
      const teacher = (await Teacher.findOne({ userId: sessionUser.id }).lean()) as unknown as {
        _id: Types.ObjectId;
      } | null;
      if (!teacher) return notFoundResponse("Teacher profile not found");

      const courses = (await Course.find({ teacherId: teacher._id }).lean()) as unknown as {
        _id: Types.ObjectId;
      }[];
      courseIds = courses.map((c) => c._id.toString());
    }

    const slots = (await Timetable.find({ courseId: { $in: courseIds } })
      .populate({ path: "courseId", select: "code title" })
      .lean()) as unknown as {
      _id: Types.ObjectId;
      day: string;
      startTime: string;
      endTime: string;
      room: string;
      courseId: { _id: Types.ObjectId; code: string; title: string } | null;
    }[];

    const sorted = [...slots].sort((a, b) => {
      const dayA = dayOrder.get(a.day) ?? 0;
      const dayB = dayOrder.get(b.day) ?? 0;
      if (dayA !== dayB) return dayA - dayB;
      return a.startTime.localeCompare(b.startTime);
    });

    const result = sorted.map((s) => ({
      id: s._id.toString(),
      day: s.day,
      startTime: s.startTime,
      endTime: s.endTime,
      room: s.room,
      courseId: s.courseId?._id.toString() ?? null,
      course: s.courseId ? { code: s.courseId.code, title: s.courseId.title } : null,
    }));

    return successResponse(result);
  } catch (error) {
    console.error("GET /api/timetable/me error:", error);
    return serverErrorResponse();
  }
}
