import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth-server", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  default: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/lib/models", () => ({
  Course: { findById: vi.fn() },
  Enrollment: { find: vi.fn() },
  Result: { find: vi.fn() },
  Teacher: { findOne: vi.fn() },
}));

vi.mock("mongoose", () => {
  const isValid = vi.fn((id: string) => /^[0-9a-fA-F]{24}$/.test(id));
  return {
    default: { Types: { ObjectId: { isValid } } },
    Types: { ObjectId: { isValid } },
  };
});

import { GET as getCourseResults } from "@/app/api/results/course/[courseId]/route";
import { auth } from "@/lib/auth-server";
import { Course, Enrollment, Result, Teacher } from "@/lib/models";

const mockAuth = vi.mocked(auth) as unknown as {
  mockResolvedValue: (value: unknown) => void;
};
const mockCourse = vi.mocked(Course);
const mockEnrollment = vi.mocked(Enrollment);
const mockResult = vi.mocked(Result);
const mockTeacher = vi.mocked(Teacher);

const COURSE_ID = "111111111111111111111111";
const TEACHER_ID = "555555555555555555555555";
const STUDENT_A = "333333333333333333333333";
const STUDENT_B = "444444444444444444444444";
const USER_SELF = "aaaaaaaaaaaaaaaaaaaaaaaa";
const OTHER_USER = "bbbbbbbbbbbbbbbbbbbbbbbb";
const DEPT_ID = "777777777777777777777777";
const DEPT_OTHER = "888888888888888888888888";

function createMockRequest(url: string): Request {
  return new Request(url);
}

function lean(value: unknown) {
  return { lean: vi.fn().mockResolvedValue(value) } as any;
}

function chainPopulate(value: unknown) {
  return {
    populate: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue(value) }),
  } as any;
}

describe("GET /api/results/course/:courseId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const get = (courseId = COURSE_ID) =>
    getCourseResults(createMockRequest(`http://localhost/api/results/course/${courseId}`), {
      params: Promise.resolve({ courseId }),
    });

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await get();
    expect(res.status).toBe(401);
  });

  it("returns 403 for a student", async () => {
    mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "student" } });
    const res = await get();
    expect(res.status).toBe(403);
  });

  it("returns 400 for an invalid course ID", async () => {
    mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "teacher" } });
    const res = await get("nope");
    expect(res.status).toBe(400);
  });

  it("returns 404 when the course does not exist", async () => {
    mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "teacher" } });
    mockCourse.findById.mockReturnValue(lean(null));
    const res = await get();
    expect(res.status).toBe(404);
  });

  it("returns 403 when a teacher does not own the course", async () => {
    mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "teacher" } });
    mockCourse.findById.mockReturnValue(lean({ _id: COURSE_ID, teacherId: "999999999999999999999999" }));
    mockTeacher.findOne.mockReturnValue(lean({ _id: TEACHER_ID }));
    const res = await get();
    expect(res.status).toBe(403);
    expect(mockEnrollment.find).not.toHaveBeenCalled();
  });

  it("returns the roster joined with results and the class average for the owning teacher", async () => {
    mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "teacher" } });
    mockCourse.findById.mockReturnValue(
      lean({ _id: COURSE_ID, code: "CS101", title: "Intro", semester: 1, creditHours: 3, teacherId: TEACHER_ID })
    );
    mockTeacher.findOne.mockReturnValue(lean({ _id: TEACHER_ID }));
    mockEnrollment.find.mockReturnValue(
      chainPopulate([
        {
          studentId: {
            _id: STUDENT_A,
            rollNo: "CS-001",
            semester: 1,
            department: "CS",
            userId: { name: "Alice", email: "alice@test.com" },
          },
        },
        {
          studentId: {
            _id: STUDENT_B,
            rollNo: "CS-002",
            semester: 1,
            department: "CS",
            userId: { name: "Bob", email: "bob@test.com" },
          },
        },
      ])
    );
    mockResult.find.mockReturnValue(
      lean([
        { _id: "r1", studentId: STUDENT_A, marks: 80, grade: "A", feedback: "Nice" },
        { _id: "r2", studentId: STUDENT_B, marks: 90, grade: "A+" },
      ])
    );

    const res = await get();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.course.code).toBe("CS101");
    expect(json.data.students).toHaveLength(2);
    expect(json.data.students[0].id).toBe(STUDENT_A);
    expect(json.data.students[0].resultId).toBe("r1");
    expect(json.data.students[0].marks).toBe(80);
    expect(json.data.students[0].feedback).toBe("Nice");
    expect(json.data.students[1].resultId).toBe("r2");
    expect(json.data.students[1].feedback).toBe("");
    expect(json.data.classAverage).toBe(85);
  });

  it("marks enrolled students without a result as ungraded", async () => {
    mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "teacher" } });
    mockCourse.findById.mockReturnValue(
      lean({ _id: COURSE_ID, code: "CS101", title: "Intro", semester: 1, creditHours: 3, teacherId: TEACHER_ID })
    );
    mockTeacher.findOne.mockReturnValue(lean({ _id: TEACHER_ID }));
    mockEnrollment.find.mockReturnValue(
      chainPopulate([
        {
          studentId: {
            _id: STUDENT_A,
            rollNo: "CS-001",
            semester: 1,
            department: "CS",
            userId: { name: "Alice", email: "alice@test.com" },
          },
        },
      ])
    );
    mockResult.find.mockReturnValue(lean([]));

    const res = await get();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.students[0].resultId).toBe(null);
    expect(json.data.students[0].marks).toBe(null);
    expect(json.data.classAverage).toBe(0);
  });

  it("lets a department admin view their own department's course", async () => {
    mockAuth.mockResolvedValue({ user: { id: OTHER_USER, role: "admin", assignedDepartment: DEPT_ID } });
    mockCourse.findById.mockReturnValue(
      lean({ _id: COURSE_ID, code: "CS101", title: "Intro", semester: 1, creditHours: 3, teacherId: TEACHER_ID, departmentId: DEPT_ID })
    );
    mockEnrollment.find.mockReturnValue(chainPopulate([]));
    mockResult.find.mockReturnValue(lean([]));

    const res = await get();
    expect(res.status).toBe(200);
  });

  it("returns 403 when a department admin views another department's course", async () => {
    mockAuth.mockResolvedValue({ user: { id: OTHER_USER, role: "admin", assignedDepartment: DEPT_ID } });
    mockCourse.findById.mockReturnValue(
      lean({ _id: COURSE_ID, code: "CS101", title: "Intro", semester: 1, creditHours: 3, teacherId: TEACHER_ID, departmentId: DEPT_OTHER })
    );

    const res = await get();
    expect(res.status).toBe(403);
    expect(mockEnrollment.find).not.toHaveBeenCalled();
  });

  it("lets a super admin view any course", async () => {
    mockAuth.mockResolvedValue({ user: { id: OTHER_USER, role: "admin" } });
    mockCourse.findById.mockReturnValue(
      lean({ _id: COURSE_ID, code: "CS101", title: "Intro", semester: 1, creditHours: 3, teacherId: TEACHER_ID, departmentId: DEPT_OTHER })
    );
    mockEnrollment.find.mockReturnValue(chainPopulate([]));
    mockResult.find.mockReturnValue(lean([]));

    const res = await get();
    expect(res.status).toBe(200);
  });

  it("returns 500 on database error", async () => {
    mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "teacher" } });
    mockCourse.findById.mockImplementation(() => {
      throw new Error("db down");
    });
    const res = await get();
    expect(res.status).toBe(500);
  });
});
