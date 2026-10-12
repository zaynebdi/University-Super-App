import { auth } from "@/lib/auth-server";
import dbConnect from "@/lib/db";
import { Course, Timetable } from "@/lib/models";
import { getAdminScope } from "@/lib/admin-scope";
import { successResponse, errorResponse, forbiddenResponse, conflictResponse, notFoundResponse, serverErrorResponse } from "@/lib/api/response";
import { DaysOfWeek } from "@/lib/constants";
import { z } from "zod";
import { Types } from "mongoose";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const updateTimetableSchema = z
  .object({
    courseId: z.string().regex(objectIdRegex).optional(),
    day: z.enum(DaysOfWeek).optional(),
    startTime: z.string().regex(timeRegex).optional(),
    endTime: z.string().regex(timeRegex).optional(),
    room: z.string().trim().min(1).max(50).optional(),
  })
  .strict();

interface LeanCourse {
  _id: Types.ObjectId;
  code: string;
  title: string;
  teacherId: Types.ObjectId | null;
  departmentId?: Types.ObjectId | null;
}

interface LeanSlot {
  _id: Types.ObjectId;
  courseId: Types.ObjectId;
  day: string;
  startTime: string;
  endTime: string;
  room: string;
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

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const scope = getAdminScope(session);
    if (!scope) return forbiddenResponse("Admin only");

    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) return errorResponse("Invalid timetable ID", 400);

    const body = await req.json();
    const parsed = updateTimetableSchema.safeParse(body);
    if (!parsed.success) return errorResponse("Invalid input", 400);

    await dbConnect();

    const existing = (await Timetable.findById(id).lean()) as unknown as LeanSlot | null;
    if (!existing) return notFoundResponse("Timetable entry not found");

    const effectiveCourseId = parsed.data.courseId ?? existing.courseId.toString();
    const course = (await Course.findById(effectiveCourseId).lean()) as unknown as LeanCourse | null;
    if (!course) return notFoundResponse("Course not found");

    if (
      scope.assignedDepartment &&
      (!course.departmentId || course.departmentId.toString() !== scope.assignedDepartment)
    ) {
      return forbiddenResponse("You can only manage your own department's timetable");
    }

    const effective = {
      day: parsed.data.day ?? existing.day,
      startTime: parsed.data.startTime ?? existing.startTime,
      endTime: parsed.data.endTime ?? existing.endTime,
      room: parsed.data.room ?? existing.room,
    };

    if (effective.startTime >= effective.endTime) {
      return errorResponse("startTime must be before endTime", 400);
    }

    const clash = await findClashes({
      day: effective.day,
      startTime: effective.startTime,
      endTime: effective.endTime,
      room: effective.room,
      teacherId: course.teacherId,
      excludeId: id,
    });
    if (clash.room) return conflictResponse("Room is already booked at this time");
    if (clash.teacher) return conflictResponse("Teacher has a clashing class at this time");

    const updated = (await Timetable.findByIdAndUpdate(id, parsed.data, { new: true }).lean()) as unknown as LeanSlot;

    return successResponse(toTimetableDTO(updated, course));
  } catch (error) {
    console.error("PUT /api/timetable/:id error:", error);
    return serverErrorResponse();
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const scope = getAdminScope(session);
    if (!scope) return forbiddenResponse("Admin only");

    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) return errorResponse("Invalid timetable ID", 400);

    await dbConnect();

    const existing = (await Timetable.findById(id).lean()) as unknown as LeanSlot | null;
    if (!existing) return notFoundResponse("Timetable entry not found");

    if (scope.assignedDepartment) {
      const course = (await Course.findById(existing.courseId).lean()) as unknown as {
        departmentId?: Types.ObjectId | null;
      } | null;
      if (
        !course ||
        !course.departmentId ||
        course.departmentId.toString() !== scope.assignedDepartment
      ) {
        return forbiddenResponse("You can only manage your own department's timetable");
      }
    }

    await Timetable.findByIdAndDelete(id);

    return successResponse({ message: "Timetable entry deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/timetable/:id error:", error);
    return serverErrorResponse();
  }
}
