import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth-server", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  default: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/lib/models", () => ({
  Timetable: {
    find: vi.fn(),
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
    create: vi.fn(),
  },
  Course: {
    find: vi.fn(),
    findById: vi.fn(),
  },
  Student: { findOne: vi.fn() },
  Teacher: { findOne: vi.fn() },
  Enrollment: { find: vi.fn() },
}));

vi.mock("mongoose", () => {
  const isValid = vi.fn((id: string) => /^[0-9a-fA-F]{24}$/.test(id));
  return {
    default: { Types: { ObjectId: { isValid } } },
    Types: { ObjectId: { isValid } },
  };
});

import { GET as listSlots, POST as createSlot } from "@/app/api/timetable/route";
import { GET as getMyTimetable } from "@/app/api/timetable/me/route";
import { PUT as updateSlot, DELETE as deleteSlot } from "@/app/api/timetable/[id]/route";
import { auth } from "@/lib/auth-server";
import { Timetable, Course, Student, Teacher, Enrollment } from "@/lib/models";

const mockAuth = vi.mocked(auth) as unknown as {
  mockResolvedValue: (value: unknown) => void;
};
const mockTimetable = vi.mocked(Timetable);
const mockCourse = vi.mocked(Course);
const mockStudent = vi.mocked(Student);
const mockTeacher = vi.mocked(Teacher);
const mockEnrollment = vi.mocked(Enrollment);

const COURSE_ID = "111111111111111111111111";
const COURSE_OTHER = "222222222222222222222222";
const SLOT_ID = "333333333333333333333333";
const SLOT_OTHER = "444444444444444444444444";
const TEACHER_ID = "555555555555555555555555";
const STUDENT_ID = "666666666666666666666666";
const USER_SELF = "aaaaaaaaaaaaaaaaaaaaaaaa";
const DEPT_ID = "777777777777777777777777";
const DEPT_OTHER = "888888888888888888888888";

function createMockRequest(url: string, method = "GET", body?: unknown): Request {
  return new Request(url, { method, body: body ? JSON.stringify(body) : undefined });
}

function lean(value: unknown) {
  return { lean: vi.fn().mockResolvedValue(value) } as any;
}

function chainPopulate(value: unknown) {
  return {
    populate: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue(value) }),
  } as any;
}

const validBody = {
  courseId: COURSE_ID,
  day: "Monday",
  startTime: "09:00",
  endTime: "10:00",
  room: "R1",
};

describe("Timetable API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/timetable", () => {
    it("returns 403 when not authenticated", async () => {
      mockAuth.mockResolvedValue(null);
      const res = await createSlot(
        createMockRequest("http://localhost/api/timetable", "POST", validBody)
      );
      expect(res.status).toBe(403);
    });

    it("returns 403 for non-admin", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "student" } });
      const res = await createSlot(
        createMockRequest("http://localhost/api/timetable", "POST", validBody)
      );
      expect(res.status).toBe(403);
    });

    it("returns 400 for a missing field", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      const res = await createSlot(
        createMockRequest("http://localhost/api/timetable", "POST", {
          courseId: COURSE_ID,
          day: "Monday",
          startTime: "09:00",
          endTime: "10:00",
        })
      );
      expect(res.status).toBe(400);
    });

    it("returns 400 for an invalid day", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      const res = await createSlot(
        createMockRequest("http://localhost/api/timetable", "POST", {
          courseId: COURSE_ID,
          day: "Sunday",
          startTime: "09:00",
          endTime: "10:00",
          room: "R1",
        })
      );
      expect(res.status).toBe(400);
    });

    it("returns 400 for a malformed time", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      const res = await createSlot(
        createMockRequest("http://localhost/api/timetable", "POST", {
          courseId: COURSE_ID,
          day: "Monday",
          startTime: "9:00",
          endTime: "10:00",
          room: "R1",
        })
      );
      expect(res.status).toBe(400);
    });

    it("returns 400 when startTime is not before endTime", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      const res = await createSlot(
        createMockRequest("http://localhost/api/timetable", "POST", {
          courseId: COURSE_ID,
          day: "Monday",
          startTime: "10:00",
          endTime: "09:00",
          room: "R1",
        })
      );
      expect(res.status).toBe(400);
    });

    it("returns 400 for unknown fields", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      const res = await createSlot(
        createMockRequest("http://localhost/api/timetable", "POST", {
          courseId: COURSE_ID,
          day: "Monday",
          startTime: "09:00",
          endTime: "10:00",
          room: "R1",
          extra: "nope",
        })
      );
      expect(res.status).toBe(400);
    });

    it("returns 404 when the course does not exist", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      mockCourse.findById.mockReturnValue(lean(null));

      const res = await createSlot(
        createMockRequest("http://localhost/api/timetable", "POST", {
          courseId: COURSE_ID,
          day: "Monday",
          startTime: "09:00",
          endTime: "10:00",
          room: "R1",
        })
      );
      expect(res.status).toBe(404);
    });

    it("returns 409 on a room clash", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      mockCourse.findById.mockReturnValue(lean({ _id: COURSE_ID, code: "CS101", title: "Intro", teacherId: null }));
      mockTimetable.find.mockReturnValue(lean([{ _id: SLOT_OTHER, courseId: COURSE_OTHER, room: "R1" }]));

      const res = await createSlot(
        createMockRequest("http://localhost/api/timetable", "POST", {
          courseId: COURSE_ID,
          day: "Monday",
          startTime: "09:00",
          endTime: "10:00",
          room: "R1",
        })
      );
      expect(res.status).toBe(409);
    });

    it("returns 409 on a teacher clash across semesters", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      mockCourse.findById.mockReturnValue(lean({ _id: COURSE_ID, code: "CS101", title: "Intro", teacherId: TEACHER_ID }));
      mockTimetable.find.mockReturnValue(lean([{ _id: SLOT_OTHER, courseId: COURSE_ID, room: "R9" }]));
      mockCourse.find.mockReturnValue(lean([{ _id: COURSE_ID }]));

      const res = await createSlot(
        createMockRequest("http://localhost/api/timetable", "POST", {
          courseId: COURSE_ID,
          day: "Monday",
          startTime: "09:00",
          endTime: "10:00",
          room: "R2",
        })
      );
      expect(res.status).toBe(409);
    });

    it("allows adjacent slots (no overlap)", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      mockCourse.findById.mockReturnValue(lean({ _id: COURSE_ID, code: "CS101", title: "Intro", teacherId: null }));
      mockTimetable.find.mockReturnValue(lean([]));
      mockTimetable.create.mockResolvedValue({
        _id: SLOT_ID,
        day: "Monday",
        startTime: "10:00",
        endTime: "11:00",
        room: "R1",
      } as any);

      const res = await createSlot(
        createMockRequest("http://localhost/api/timetable", "POST", {
          courseId: COURSE_ID,
          day: "Monday",
          startTime: "10:00",
          endTime: "11:00",
          room: "R1",
        })
      );
      expect(res.status).toBe(201);
      expect(mockTimetable.find).toHaveBeenCalledWith({
        day: "Monday",
        startTime: { $lt: "11:00" },
        endTime: { $gt: "10:00" },
      });
    });

    it("creates a slot and returns the DTO", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      mockCourse.findById.mockReturnValue(lean({ _id: COURSE_ID, code: "CS101", title: "Intro", teacherId: null }));
      mockTimetable.find.mockReturnValue(lean([]));
      mockTimetable.create.mockResolvedValue({
        _id: SLOT_ID,
        day: "Monday",
        startTime: "09:00",
        endTime: "10:00",
        room: "R1",
      } as any);

      const res = await createSlot(
        createMockRequest("http://localhost/api/timetable", "POST", {
          courseId: COURSE_ID,
          day: "Monday",
          startTime: "09:00",
          endTime: "10:00",
          room: "R1",
        })
      );
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.data.id).toBe(SLOT_ID);
      expect(json.data.course.code).toBe("CS101");
      expect(json.data).not.toHaveProperty("password");
    });

    it("lets a department admin create a slot for their own department's course", async () => {
      mockAuth.mockResolvedValue({
        user: { id: USER_SELF, role: "admin", assignedDepartment: DEPT_ID },
      });
      mockCourse.findById.mockReturnValue(
        lean({ _id: COURSE_ID, code: "CS101", title: "Intro", teacherId: null, departmentId: DEPT_ID })
      );
      mockTimetable.find.mockReturnValue(lean([]));
      mockTimetable.create.mockResolvedValue({
        _id: SLOT_ID,
        day: "Monday",
        startTime: "09:00",
        endTime: "10:00",
        room: "R1",
      } as any);

      const res = await createSlot(
        createMockRequest("http://localhost/api/timetable", "POST", {
          courseId: COURSE_ID,
          day: "Monday",
          startTime: "09:00",
          endTime: "10:00",
          room: "R1",
        })
      );
      expect(res.status).toBe(201);
    });

    it("returns 403 when a department admin creates a slot for another department's course", async () => {
      mockAuth.mockResolvedValue({
        user: { id: USER_SELF, role: "admin", assignedDepartment: DEPT_ID },
      });
      mockCourse.findById.mockReturnValue(
        lean({ _id: COURSE_ID, code: "CS101", title: "Intro", teacherId: null, departmentId: DEPT_OTHER })
      );

      const res = await createSlot(
        createMockRequest("http://localhost/api/timetable", "POST", {
          courseId: COURSE_ID,
          day: "Monday",
          startTime: "09:00",
          endTime: "10:00",
          room: "R1",
        })
      );
      expect(res.status).toBe(403);
      expect(mockTimetable.create).not.toHaveBeenCalled();
    });

    it("returns 500 on database error", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      mockCourse.findById.mockImplementation(() => {
        throw new Error("db down");
      });

      const res = await createSlot(
        createMockRequest("http://localhost/api/timetable", "POST", {
          courseId: COURSE_ID,
          day: "Monday",
          startTime: "09:00",
          endTime: "10:00",
          room: "R1",
        })
      );
      expect(res.status).toBe(500);
    });
  });

  describe("PUT /api/timetable/:id", () => {
    const put = (body: unknown, id = SLOT_ID) =>
      updateSlot(createMockRequest(`http://localhost/api/timetable/${id}`, "PUT", body), {
        params: Promise.resolve({ id }),
      });

    it("returns 403 when not authenticated", async () => {
      mockAuth.mockResolvedValue(null);
      const res = await put({ room: "R5" });
      expect(res.status).toBe(403);
    });

    it("returns 403 for non-admin", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "teacher" } });
      const res = await put({ room: "R5" });
      expect(res.status).toBe(403);
    });

    it("returns 400 for an invalid ID", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      const res = await put({ room: "R5" }, "not-an-id");
      expect(res.status).toBe(400);
    });

    it("returns 400 for an invalid body", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      const res = await put({ day: "Funday" });
      expect(res.status).toBe(400);
    });

    it("returns 404 when the slot does not exist", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      mockTimetable.findById.mockReturnValue(lean(null));
      const res = await put({ room: "R5" });
      expect(res.status).toBe(404);
    });

    it("returns 404 when the target course does not exist", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      mockTimetable.findById.mockReturnValue(lean({ _id: SLOT_ID, courseId: COURSE_ID, day: "Monday", startTime: "09:00", endTime: "10:00", room: "R1" }));
      mockCourse.findById.mockReturnValue(lean(null));
      const res = await put({ courseId: COURSE_OTHER });
      expect(res.status).toBe(404);
    });

    it("returns 400 when the merged times are invalid", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      mockTimetable.findById.mockReturnValue(lean({ _id: SLOT_ID, courseId: COURSE_ID, day: "Monday", startTime: "09:00", endTime: "10:00", room: "R1" }));
      mockCourse.findById.mockReturnValue(lean({ _id: COURSE_ID, code: "CS101", title: "Intro", teacherId: null }));
      const res = await put({ startTime: "11:00" });
      expect(res.status).toBe(400);
    });

    it("returns 409 on a room clash and excludes itself", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      mockTimetable.findById.mockReturnValue(lean({ _id: SLOT_ID, courseId: COURSE_ID, day: "Monday", startTime: "09:00", endTime: "10:00", room: "R1" }));
      mockCourse.findById.mockReturnValue(lean({ _id: COURSE_ID, code: "CS101", title: "Intro", teacherId: null }));
      mockTimetable.find.mockReturnValue(lean([{ _id: SLOT_OTHER, courseId: COURSE_OTHER, room: "R2" }]));

      const res = await put({ room: "R2" });
      expect(res.status).toBe(409);
      expect(mockTimetable.find).toHaveBeenCalledWith(
        expect.objectContaining({ _id: { $ne: SLOT_ID } })
      );
    });

    it("returns 409 on a teacher clash", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      mockTimetable.findById.mockReturnValue(lean({ _id: SLOT_ID, courseId: COURSE_ID, day: "Monday", startTime: "09:00", endTime: "10:00", room: "R1" }));
      mockCourse.findById.mockReturnValue(lean({ _id: COURSE_ID, code: "CS101", title: "Intro", teacherId: TEACHER_ID }));
      mockTimetable.find.mockReturnValue(lean([{ _id: SLOT_OTHER, courseId: COURSE_ID, room: "R9" }]));
      mockCourse.find.mockReturnValue(lean([{ _id: COURSE_ID }]));

      const res = await put({ day: "Tuesday" });
      expect(res.status).toBe(409);
    });

    it("updates a slot", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      mockTimetable.findById.mockReturnValue(lean({ _id: SLOT_ID, courseId: COURSE_ID, day: "Monday", startTime: "09:00", endTime: "10:00", room: "R1" }));
      mockCourse.findById.mockReturnValue(lean({ _id: COURSE_ID, code: "CS101", title: "Intro", teacherId: null }));
      mockTimetable.find.mockReturnValue(lean([]));
      mockTimetable.findByIdAndUpdate.mockReturnValue(lean({ _id: SLOT_ID, day: "Monday", startTime: "09:00", endTime: "10:00", room: "R5" }));

      const res = await put({ room: "R5" });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.room).toBe("R5");
    });

    it("lets a department admin update a slot of their own department", async () => {
      mockAuth.mockResolvedValue({
        user: { id: USER_SELF, role: "admin", assignedDepartment: DEPT_ID },
      });
      mockTimetable.findById.mockReturnValue(lean({ _id: SLOT_ID, courseId: COURSE_ID, day: "Monday", startTime: "09:00", endTime: "10:00", room: "R1" }));
      mockCourse.findById.mockReturnValue(
        lean({ _id: COURSE_ID, code: "CS101", title: "Intro", teacherId: null, departmentId: DEPT_ID })
      );
      mockTimetable.find.mockReturnValue(lean([]));
      mockTimetable.findByIdAndUpdate.mockReturnValue(lean({ _id: SLOT_ID, day: "Monday", startTime: "09:00", endTime: "10:00", room: "R5" }));

      const res = await put({ room: "R5" });
      expect(res.status).toBe(200);
    });

    it("returns 403 when a department admin updates a slot of another department", async () => {
      mockAuth.mockResolvedValue({
        user: { id: USER_SELF, role: "admin", assignedDepartment: DEPT_ID },
      });
      mockTimetable.findById.mockReturnValue(lean({ _id: SLOT_ID, courseId: COURSE_ID, day: "Monday", startTime: "09:00", endTime: "10:00", room: "R1" }));
      mockCourse.findById.mockReturnValue(
        lean({ _id: COURSE_ID, code: "CS101", title: "Intro", teacherId: null, departmentId: DEPT_OTHER })
      );

      const res = await put({ room: "R5" });
      expect(res.status).toBe(403);
      expect(mockTimetable.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it("returns 500 on database error", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      mockTimetable.findById.mockImplementation(() => {
        throw new Error("db down");
      });
      const res = await put({ room: "R5" });
      expect(res.status).toBe(500);
    });
  });

  describe("DELETE /api/timetable/:id", () => {
    const del = (id = SLOT_ID) =>
      deleteSlot(createMockRequest(`http://localhost/api/timetable/${id}`, "DELETE"), {
        params: Promise.resolve({ id }),
      });

    it("returns 403 when not authenticated", async () => {
      mockAuth.mockResolvedValue(null);
      const res = await del();
      expect(res.status).toBe(403);
    });

    it("returns 403 for non-admin", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "student" } });
      const res = await del();
      expect(res.status).toBe(403);
    });

    it("returns 400 for an invalid ID", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      const res = await del("nope");
      expect(res.status).toBe(400);
    });

    it("returns 404 when the slot does not exist", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      mockTimetable.findById.mockReturnValue(lean(null));
      const res = await del();
      expect(res.status).toBe(404);
    });

    it("deletes a slot", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      mockTimetable.findById.mockReturnValue(lean({ _id: SLOT_ID }));
      mockTimetable.findByIdAndDelete.mockResolvedValue({ _id: SLOT_ID } as any);
      const res = await del();
      expect(res.status).toBe(200);
      expect(mockTimetable.findByIdAndDelete).toHaveBeenCalledWith(SLOT_ID);
    });

    it("lets a department admin delete a slot of their own department", async () => {
      mockAuth.mockResolvedValue({
        user: { id: USER_SELF, role: "admin", assignedDepartment: DEPT_ID },
      });
      mockTimetable.findById.mockReturnValue(lean({ _id: SLOT_ID, courseId: COURSE_ID }));
      mockCourse.findById.mockReturnValue(lean({ _id: COURSE_ID, departmentId: DEPT_ID }));
      mockTimetable.findByIdAndDelete.mockResolvedValue({ _id: SLOT_ID } as any);

      const res = await del();
      expect(res.status).toBe(200);
      expect(mockTimetable.findByIdAndDelete).toHaveBeenCalledWith(SLOT_ID);
    });

    it("returns 403 when a department admin deletes a slot of another department", async () => {
      mockAuth.mockResolvedValue({
        user: { id: USER_SELF, role: "admin", assignedDepartment: DEPT_ID },
      });
      mockTimetable.findById.mockReturnValue(lean({ _id: SLOT_ID, courseId: COURSE_ID }));
      mockCourse.findById.mockReturnValue(lean({ _id: COURSE_ID, departmentId: DEPT_OTHER }));

      const res = await del();
      expect(res.status).toBe(403);
      expect(mockTimetable.findByIdAndDelete).not.toHaveBeenCalled();
    });

    it("returns 500 on database error", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      mockTimetable.findById.mockImplementation(() => {
        throw new Error("db down");
      });
      const res = await del();
      expect(res.status).toBe(500);
    });
  });

  describe("GET /api/timetable/me", () => {
    it("returns 401 when not authenticated", async () => {
      mockAuth.mockResolvedValue(null);
      const res = await getMyTimetable();
      expect(res.status).toBe(401);
    });

    it("returns 403 for an admin", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      const res = await getMyTimetable();
      expect(res.status).toBe(403);
    });

    it("returns 404 when the student profile is missing", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "student" } });
      mockStudent.findOne.mockReturnValue(lean(null));
      const res = await getMyTimetable();
      expect(res.status).toBe(404);
    });

    it("returns 404 when the teacher profile is missing", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "teacher" } });
      mockTeacher.findOne.mockReturnValue(lean(null));
      const res = await getMyTimetable();
      expect(res.status).toBe(404);
    });

    it("returns the student's weekly timetable sorted by day", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "student" } });
      mockStudent.findOne.mockReturnValue(lean({ _id: STUDENT_ID }));
      mockEnrollment.find.mockReturnValue(lean([{ courseId: COURSE_ID }]));
      mockTimetable.find.mockReturnValue(
        chainPopulate([
          { _id: SLOT_OTHER, day: "Wednesday", startTime: "11:00", endTime: "12:00", room: "R2", courseId: { _id: COURSE_OTHER, code: "CS102", title: "Data" } },
          { _id: SLOT_ID, day: "Monday", startTime: "09:00", endTime: "10:00", room: "R1", courseId: { _id: COURSE_ID, code: "CS101", title: "Intro" } },
        ])
      );

      const res = await getMyTimetable();
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data).toHaveLength(2);
      expect(json.data[0].day).toBe("Monday");
      expect(json.data[0].course.code).toBe("CS101");
      expect(json.data[1].day).toBe("Wednesday");
    });

    it("returns an empty list when the student has no enrollments", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "student" } });
      mockStudent.findOne.mockReturnValue(lean({ _id: STUDENT_ID }));
      mockEnrollment.find.mockReturnValue(lean([]));
      mockTimetable.find.mockReturnValue(chainPopulate([]));
      const res = await getMyTimetable();
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data).toEqual([]);
    });

    it("returns the teacher's weekly timetable", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "teacher" } });
      mockTeacher.findOne.mockReturnValue(lean({ _id: TEACHER_ID }));
      mockCourse.find.mockReturnValue(lean([{ _id: COURSE_ID }]));
      mockTimetable.find.mockReturnValue(
        chainPopulate([
          {
            _id: SLOT_ID,
            day: "Monday",
            startTime: "09:00",
            endTime: "10:00",
            room: "R1",
            courseId: { _id: COURSE_ID, code: "CS101", title: "Intro" },
          },
        ])
      );
      const res = await getMyTimetable();
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data[0].courseId).toBe(COURSE_ID);
    });

    it("returns 500 on database error", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "student" } });
      mockStudent.findOne.mockImplementation(() => {
        throw new Error("db down");
      });
      const res = await getMyTimetable();
      expect(res.status).toBe(500);
    });
  });

  describe("GET /api/timetable", () => {
    it("returns 403 when not authenticated", async () => {
      mockAuth.mockResolvedValue(null);
      const res = await listSlots(
        createMockRequest("http://localhost/api/timetable")
      );
      expect(res.status).toBe(403);
    });

    it("returns 403 for a non-admin", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "student" } });
      const res = await listSlots(
        createMockRequest("http://localhost/api/timetable")
      );
      expect(res.status).toBe(403);
    });

    it("returns 400 for an invalid courseId filter", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      const res = await listSlots(
        createMockRequest("http://localhost/api/timetable?courseId=not-an-id")
      );
      expect(res.status).toBe(400);
    });

    it("returns 400 for an invalid day filter", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      const res = await listSlots(
        createMockRequest("http://localhost/api/timetable?day=Funday")
      );
      expect(res.status).toBe(400);
    });

    it("returns all entries sorted by day and start time", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      mockTimetable.find.mockReturnValue(
        chainPopulate([
          {
            _id: SLOT_OTHER,
            day: "Wednesday",
            startTime: "11:00",
            endTime: "12:00",
            room: "R2",
            courseId: { _id: COURSE_OTHER, code: "CS102", title: "Data" },
          },
          {
            _id: SLOT_ID,
            day: "Monday",
            startTime: "09:00",
            endTime: "10:00",
            room: "R1",
            courseId: { _id: COURSE_ID, code: "CS101", title: "Intro" },
          },
        ])
      );

      const res = await listSlots(
        createMockRequest("http://localhost/api/timetable")
      );
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data).toHaveLength(2);
      expect(json.data[0].day).toBe("Monday");
      expect(json.data[0].course.code).toBe("CS101");
      expect(json.data[1].day).toBe("Wednesday");
    });

    it("passes filters through to the query", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      mockTimetable.find.mockReturnValue(chainPopulate([]));
      await listSlots(
        createMockRequest(
          `http://localhost/api/timetable?courseId=${COURSE_ID}&day=Monday`
        )
      );
      expect(mockTimetable.find).toHaveBeenCalledWith({
        courseId: COURSE_ID,
        day: "Monday",
      });
    });

    it("restricts a department admin to their own department's slots", async () => {
      mockAuth.mockResolvedValue({
        user: { id: USER_SELF, role: "admin", assignedDepartment: DEPT_ID },
      });
      mockCourse.find.mockReturnValue(lean([{ _id: COURSE_ID }]));
      mockTimetable.find.mockReturnValue(chainPopulate([]));

      const res = await listSlots(
        createMockRequest("http://localhost/api/timetable")
      );
      expect(res.status).toBe(200);
      expect(mockCourse.find).toHaveBeenCalledWith({ departmentId: DEPT_ID });
      expect(mockTimetable.find).toHaveBeenCalledWith({
        courseId: { $in: [COURSE_ID] },
      });
    });

    it("allows a department admin to filter by their own department's course", async () => {
      mockAuth.mockResolvedValue({
        user: { id: USER_SELF, role: "admin", assignedDepartment: DEPT_ID },
      });
      mockCourse.find.mockReturnValue(lean([{ _id: COURSE_ID }]));
      mockTimetable.find.mockReturnValue(chainPopulate([]));

      const res = await listSlots(
        createMockRequest(`http://localhost/api/timetable?courseId=${COURSE_ID}`)
      );
      expect(res.status).toBe(200);
      expect(mockTimetable.find).toHaveBeenCalledWith({ courseId: COURSE_ID });
    });

    it("returns 403 when a department admin filters another department's course", async () => {
      mockAuth.mockResolvedValue({
        user: { id: USER_SELF, role: "admin", assignedDepartment: DEPT_ID },
      });
      mockCourse.find.mockReturnValue(lean([{ _id: COURSE_ID }]));

      const res = await listSlots(
        createMockRequest(
          `http://localhost/api/timetable?courseId=${COURSE_OTHER}`
        )
      );
      expect(res.status).toBe(403);
      expect(mockTimetable.find).not.toHaveBeenCalled();
    });

    it("returns an empty list when there are no entries", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      mockTimetable.find.mockReturnValue(chainPopulate([]));
      const res = await listSlots(
        createMockRequest("http://localhost/api/timetable")
      );
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data).toEqual([]);
    });

    it("returns 500 on database error", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      mockTimetable.find.mockImplementation(() => {
        throw new Error("db down");
      });
      const res = await listSlots(
        createMockRequest("http://localhost/api/timetable")
      );
      expect(res.status).toBe(500);
    });
  });
});
