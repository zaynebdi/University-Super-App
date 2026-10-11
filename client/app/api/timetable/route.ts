import { auth } from "@/lib/auth-server";
import dbConnect from "@/lib/db";
import { Course, Timetable } from "@/lib/models";
import { successResponse, createdResponse, errorResponse, forbiddenResponse, conflictResponse, notFoundResponse, serverErrorResponse } from "@/lib/api/response";
import { DaysOfWeek } from "@/lib/constants";
import { z } from "zod";
import { Types } from "mongoose";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
const dayOrder = new Map<string, number>(DaysOfWeek.map((d, i) => [d, i]));

const createTimetableSchema = z
  .object({
    courseId: z.string().regex(objectIdRegex),
    day: z.enum(DaysOfWeek),
    startTime: z.string().regex(timeRegex),
    endTime: z.string().regex(timeRegex),
    room: z.string().trim().min(1).max(50),
  })
  .strict();

interface LeanCourse {
  _id: Types.ObjectId;
  code: string;
  title: string;
  teacherId: Types.ObjectId | null;
}

async function findClashes(params: {
  day: string;
  startTime: string;
  endTime: string;
  room: string;
  teacherId: Types.ObjectId | null;
  excludeId?: string;
}): Promise<{ room: boolean; teacher: boolean }> {
  const filter: Record<string, unknown> = {
    day: params.day,
    startTime: { $lt: params.endTime },
    endTime: { $gt: params.startTime },
  };
  if (params.excludeId) filter._id = { $ne: params.excludeId };

  const slots = (await Timetable.find(filter).lean()) as unknown as {
    _id: Types.ObjectId;
    courseId: Types.ObjectId;
    room: string;
  }[];

  if (slots.some((s) => s.room === params.room)) {
    return { room: true, teacher: false };
  }

  if (params.teacherId) {
    const teacherCourses = (await Course.find({ teacherId: params.teacherId }).lean()) as unknown as {
      _id: Types.ObjectId;
    }[];
    const teacherCourseIds = new Set(teacherCourses.map((c) => c._id.toString()));
    if (slots.some((s) => teacherCourseIds.has(s.courseId.toString()))) {
      return { room: false, teacher: true };
    }
  }

  return { room: false, teacher: false };
}

function toTimetableDTO(
  slot: { _id: Types.ObjectId; day: string; startTime: string; endTime: string; room: string },
  course: { _id: Types.ObjectId; code: string; title: string }
) {
  return {
    id: slot._id.toString(),
    day: slot.day,
    startTime: slot.startTime,
    endTime: slot.endTime,
    room: slot.room,
    courseId: course._id.toString(),
    course: { code: course.code, title: course.title },
  };
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string })?.role;
    if (role !== "admin") return forbiddenResponse("Admin only");

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    const day = searchParams.get("day");

    const filter: Record<string, unknown> = {};
    if (courseId) {
      if (!objectIdRegex.test(courseId)) {
        return errorResponse("Invalid courseId", 400);
      }
      filter.courseId = courseId;
    }
    if (day) {
      if (!DaysOfWeek.includes(day as (typeof DaysOfWeek)[number])) {
        return errorResponse("Invalid day", 400);
      }
      filter.day = day;
    }

    await dbConnect();

    const slots = (await Timetable.find(filter)
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

    return successResponse(
      sorted.map((s) => ({
        id: s._id.toString(),
        day: s.day,
        startTime: s.startTime,
        endTime: s.endTime,
        room: s.room,
        courseId: s.courseId?._id.toString() ?? null,
        course: s.courseId
          ? { code: s.courseId.code, title: s.courseId.title }
          : null,
      }))
    );
  } catch (error) {
    console.error("GET /api/timetable error:", error);
    return serverErrorResponse();
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string })?.role;
    if (role !== "admin") return forbiddenResponse("Admin only");

    const body = await req.json();
    const parsed = createTimetableSchema.safeParse(body);
    if (!parsed.success) return errorResponse("Invalid input", 400);

    if (parsed.data.startTime >= parsed.data.endTime) {
      return errorResponse("startTime must be before endTime", 400);
    }

    await dbConnect();

    const course = (await Course.findById(parsed.data.courseId).lean()) as unknown as LeanCourse | null;
    if (!course) return notFoundResponse("Course not found");

    const clash = await findClashes({
      day: parsed.data.day,
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime,
      room: parsed.data.room,
      teacherId: course.teacherId,
    });
    if (clash.room) return conflictResponse("Room is already booked at this time");
    if (clash.teacher) return conflictResponse("Teacher has a clashing class at this time");

    const created = (await Timetable.create({
      courseId: parsed.data.courseId,
      day: parsed.data.day,
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime,
      room: parsed.data.room,
    })) as unknown as { _id: Types.ObjectId; day: string; startTime: string; endTime: string; room: string };

    return createdResponse(toTimetableDTO(created, course));
  } catch (error) {
    console.error("POST /api/timetable error:", error);
    return serverErrorResponse();
  }
}
