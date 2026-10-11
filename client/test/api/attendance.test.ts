import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth-server", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  default: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/lib/models", () => ({
  Attendance: {
    find: vi.fn(),
    findOneAndUpdate: vi.fn(),
  },
  Course: {
    findById: vi.fn(),
  },
  Student: {
    find: vi.fn(),
    findById: vi.fn(),
  },
  Teacher: {
    findOne: vi.fn(),
  },
}));

vi.mock("mongoose", () => {
  const isValid = vi.fn((id: string) => /^[0-9a-fA-F]{24}$/.test(id));
  return {
    default: { Types: { ObjectId: { isValid } } },
    Types: { ObjectId: { isValid } },
  };
});

import { POST as markAttendance } from "@/app/api/attendance/route";
import { GET as listCourseAttendance } from "@/app/api/attendance/course/[courseId]/route";
import { GET as listStudentAttendance } from "@/app/api/attendance/student/[studentId]/route";
import { auth } from "@/lib/auth-server";
import { Attendance, Course, Student, Teacher } from "@/lib/models";

const mockAuth = vi.mocked(auth) as unknown as {
  mockResolvedValue: (value: unknown) => void;
};
const mockAttendance = vi.mocked(Attendance);
const mockCourse = vi.mocked(Course);
const mockStudent = vi.mocked(Student);
const mockTeacher = vi.mocked(Teacher);

const COURSE_ID = "111111111111111111111111";
const COURSE_OTHER = "222222222222222222222222";
const STUDENT_ID = "333333333333333333333333";
const TEACHER_ID = "555555555555555555555555";
const RECORD_ID = "666666666666666666666666";
const USER_SELF = "aaaaaaaaaaaaaaaaaaaaaaaa";
const OTHER_USER = "bbbbbbbbbbbbbbbbbbbbbbbb";

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
  date: "2026-02-01",
  records: [{ studentId: STUDENT_ID, status: "present" }],
};

describe("Attendance API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/attendance", () => {
    it("returns 401 when not authenticated", async () => {
      mockAuth.mockResolvedValue(null);
      const res = await markAttendance(createMockRequest("http://localhost/api/attendance", "POST", validBody));
      expect(res.status).toBe(401);
    });

    it("returns 403 for a student", async () => {
      mockAuth.mockResolvedValue({ user: { id: OTHER_USER, role: "student" } });
      const res = await markAttendance(createMockRequest("http://localhost/api/attendance", "POST", validBody));
      expect(res.status).toBe(403);
    });

    it("returns 400 for an invalid body", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "teacher" } });
      const res = await markAttendance(
        createMockRequest("http://localhost/api/attendance", "POST", { courseId: COURSE_ID })
      );
      expect(res.status).toBe(400);
    });

    it("returns 400 for an invalid date", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "teacher" } });
      const res = await markAttendance(
        createMockRequest("http://localhost/api/attendance", "POST", { ...validBody, date: "not-a-date" })
      );
      expect(res.status).toBe(400);
    });

    it("returns 400 for duplicate students in records", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "teacher" } });
      const res = await markAttendance(
        createMockRequest("http://localhost/api/attendance", "POST", {
          ...validBody,
          records: [
            { studentId: STUDENT_ID, status: "present" },
            { studentId: STUDENT_ID, status: "absent" },
          ],
        })
      );
      expect(res.status).toBe(400);
    });

    it("returns 404 when the course does not exist", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "teacher" } });
      mockCourse.findById.mockReturnValue(lean(null));
      const res = await markAttendance(createMockRequest("http://localhost/api/attendance", "POST", validBody));
      expect(res.status).toBe(404);
    });

    it("returns 403 when a teacher does not own the course", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "teacher" } });
      mockCourse.findById.mockReturnValue(lean({ _id: COURSE_ID, teacherId: COURSE_OTHER }));
      mockTeacher.findOne.mockReturnValue(lean({ _id: TEACHER_ID }));
      const res = await markAttendance(createMockRequest("http://localhost/api/attendance", "POST", validBody));
      expect(res.status).toBe(403);
    });

    it("returns 404 when a student does not exist", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "teacher" } });
      mockCourse.findById.mockReturnValue(lean({ _id: COURSE_ID, teacherId: TEACHER_ID }));
      mockTeacher.findOne.mockReturnValue(lean({ _id: TEACHER_ID }));
      mockStudent.find.mockReturnValue(lean([]));
      const res = await markAttendance(createMockRequest("http://localhost/api/attendance", "POST", validBody));
      expect(res.status).toBe(404);
    });

    it("marks attendance as the owning teacher (upsert)", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "teacher" } });
      mockCourse.findById.mockReturnValue(lean({ _id: COURSE_ID, teacherId: TEACHER_ID }));
      mockTeacher.findOne.mockReturnValue(lean({ _id: TEACHER_ID }));
      mockStudent.find.mockReturnValue(lean([{ _id: STUDENT_ID }]));
      mockAttendance.findOneAndUpdate.mockReturnValue(
        lean({ _id: RECORD_ID, courseId: COURSE_ID, studentId: STUDENT_ID, date: new Date("2026-02-01"), status: "present" })
      );

      const res = await markAttendance(createMockRequest("http://localhost/api/attendance", "POST", validBody));
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.data).toHaveLength(1);
      expect(json.data[0].studentId).toBe(STUDENT_ID);
      expect(json.data[0].status).toBe("present");
      expect(mockAttendance.findOneAndUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ courseId: COURSE_ID, studentId: STUDENT_ID }),
        { $set: { status: "present" } },
        { upsert: true, new: true }
      );
    });

    it("marks attendance as an admin for any course", async () => {
      mockAuth.mockResolvedValue({ user: { id: OTHER_USER, role: "admin" } });
      mockCourse.findById.mockReturnValue(lean({ _id: COURSE_ID, teacherId: TEACHER_ID }));
      mockStudent.find.mockReturnValue(lean([{ _id: STUDENT_ID }]));
      mockAttendance.findOneAndUpdate.mockReturnValue(
        lean({ _id: RECORD_ID, courseId: COURSE_ID, studentId: STUDENT_ID, date: new Date("2026-02-01"), status: "present" })
      );

      const res = await markAttendance(createMockRequest("http://localhost/api/attendance", "POST", validBody));
      expect(res.status).toBe(201);
    });

    it("returns 500 on database error", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "teacher" } });
      mockCourse.findById.mockImplementation(() => {
        throw new Error("db down");
      });
      const res = await markAttendance(createMockRequest("http://localhost/api/attendance", "POST", validBody));
      expect(res.status).toBe(500);
    });
  });

  describe("GET /api/attendance/course/:courseId", () => {
    const get = (courseId = COURSE_ID, query = "") =>
      listCourseAttendance(createMockRequest(`http://localhost/api/attendance/course/${courseId}${query}`), {
        params: Promise.resolve({ courseId }),
      });

    it("returns 401 when not authenticated", async () => {
      mockAuth.mockResolvedValue(null);
      const res = await get();
      expect(res.status).toBe(401);
    });

    it("returns 403 for a student", async () => {
      mockAuth.mockResolvedValue({ user: { id: OTHER_USER, role: "student" } });
      const res = await get();
      expect(res.status).toBe(403);
    });

    it("returns 400 for an invalid course ID", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "teacher" } });
      const res = await get("nope");
      expect(res.status).toBe(400);
    });

    it("returns 400 for an invalid date query", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "teacher" } });
      const res = await get(COURSE_ID, "?date=not-a-date");
      expect(res.status).toBe(400);
    });

    it("returns 404 when the course does not exist", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      mockCourse.findById.mockReturnValue(lean(null));
      const res = await get();
      expect(res.status).toBe(404);
    });

    it("returns 403 when a teacher does not own the course", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "teacher" } });
      mockCourse.findById.mockReturnValue(lean({ _id: COURSE_ID, teacherId: COURSE_OTHER }));
      mockTeacher.findOne.mockReturnValue(lean({ _id: TEACHER_ID }));
      const res = await get();
      expect(res.status).toBe(403);
    });

    it("lists attendance records for an admin", async () => {
      mockAuth.mockResolvedValue({ user: { id: OTHER_USER, role: "admin" } });
      mockCourse.findById.mockReturnValue(lean({ _id: COURSE_ID, teacherId: TEACHER_ID }));
      mockAttendance.find.mockReturnValue(
        chainPopulate([
          {
            _id: RECORD_ID,
            courseId: COURSE_ID,
            studentId: { _id: STUDENT_ID, rollNo: "S-1", userId: { name: "Sam", email: "sam@x.com" } },
            date: new Date("2026-02-01"),
            status: "absent",
          },
        ])
      );

      const res = await get(COURSE_ID, "?date=2026-02-01");
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data).toHaveLength(1);
      expect(json.data[0].student.rollNo).toBe("S-1");
      expect(json.data[0].status).toBe("absent");
    });

    it("returns 500 on database error", async () => {
      mockAuth.mockResolvedValue({ user: { id: OTHER_USER, role: "admin" } });
      mockCourse.findById.mockImplementation(() => {
        throw new Error("db down");
      });
      const res = await get();
      expect(res.status).toBe(500);
    });
  });

  describe("GET /api/attendance/student/:studentId", () => {
    const get = (studentId = STUDENT_ID, query = "") =>
      listStudentAttendance(createMockRequest(`http://localhost/api/attendance/student/${studentId}${query}`), {
        params: Promise.resolve({ studentId }),
      });

    it("returns 401 when not authenticated", async () => {
      mockAuth.mockResolvedValue(null);
      const res = await get();
      expect(res.status).toBe(401);
    });

    it("returns 400 for an invalid student ID", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "student" } });
      const res = await get("nope");
      expect(res.status).toBe(400);
    });

    it("returns 400 for an invalid course query", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "student" } });
      const res = await get(STUDENT_ID, "?courseId=nope");
      expect(res.status).toBe(400);
    });

    it("returns 404 when the student does not exist", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      mockStudent.findById.mockReturnValue(lean(null));
      const res = await get();
      expect(res.status).toBe(404);
    });

    it("returns 403 when a student requests another student", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "student" } });
      mockStudent.findById.mockReturnValue(lean({ _id: STUDENT_ID, userId: OTHER_USER }));
      const res = await get();
      expect(res.status).toBe(403);
    });

    it("returns 403 for a teacher", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "teacher" } });
      mockStudent.findById.mockReturnValue(lean({ _id: STUDENT_ID, userId: OTHER_USER }));
      const res = await get();
      expect(res.status).toBe(403);
    });

    it("computes per-course percentage and threshold for an admin", async () => {
      mockAuth.mockResolvedValue({ user: { id: OTHER_USER, role: "admin" } });
      mockStudent.findById.mockReturnValue(lean({ _id: STUDENT_ID, userId: USER_SELF }));
      mockAttendance.find.mockReturnValue(
        chainPopulate([
          { _id: "r1", courseId: { _id: COURSE_ID, code: "CS101", title: "Intro" }, status: "present" },
          { _id: "r2", courseId: { _id: COURSE_ID, code: "CS101", title: "Intro" }, status: "present" },
          { _id: "r3", courseId: { _id: COURSE_ID, code: "CS101", title: "Intro" }, status: "absent" },
          { _id: "r4", courseId: { _id: COURSE_OTHER, code: "CS102", title: "Data" }, status: "present" },
        ])
      );

      const res = await get();
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data).toHaveLength(2);
      expect(json.data[0].course.code).toBe("CS101");
      expect(json.data[0].present).toBe(2);
      expect(json.data[0].total).toBe(3);
      expect(json.data[0].percentage).toBe(66.67);
      expect(json.data[0].belowThreshold).toBe(true);
      expect(json.data[1].course.code).toBe("CS102");
      expect(json.data[1].percentage).toBe(100);
      expect(json.data[1].belowThreshold).toBe(false);
    });

    it("returns own attendance for a student", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "student" } });
      mockStudent.findById.mockReturnValue(lean({ _id: STUDENT_ID, userId: USER_SELF }));
      mockAttendance.find.mockReturnValue(chainPopulate([]));
      const res = await get();
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data).toEqual([]);
    });

    it("returns 500 on database error", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "student" } });
      mockStudent.findById.mockImplementation(() => {
        throw new Error("db down");
      });
      const res = await get();
      expect(res.status).toBe(500);
    });
  });
});
