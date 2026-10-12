import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth-server", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  default: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/lib/models", () => ({
  Result: {
    find: vi.fn(),
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
  },
  Course: {
    findById: vi.fn(),
  },
  Student: {
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

import { POST as createResult } from "@/app/api/results/route";
import { PUT as updateResult } from "@/app/api/results/[id]/route";
import { GET as getStudentResults } from "@/app/api/results/student/[studentId]/route";
import { auth } from "@/lib/auth-server";
import { Result, Course, Student, Teacher } from "@/lib/models";

const mockAuth = vi.mocked(auth) as unknown as {
  mockResolvedValue: (value: unknown) => void;
};
const mockResult = vi.mocked(Result);
const mockCourse = vi.mocked(Course);
const mockStudent = vi.mocked(Student);
const mockTeacher = vi.mocked(Teacher);

const COURSE_ID = "111111111111111111111111";
const COURSE_OTHER = "222222222222222222222222";
const STUDENT_ID = "333333333333333333333333";
const TEACHER_ID = "555555555555555555555555";
const RESULT_ID = "666666666666666666666666";
const USER_SELF = "aaaaaaaaaaaaaaaaaaaaaaaa";
const OTHER_USER = "bbbbbbbbbbbbbbbbbbbbbbbb";
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

const validBody = { studentId: STUDENT_ID, courseId: COURSE_ID, marks: 85, grade: "A" };

describe("Results API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/results", () => {
    it("returns 401 when not authenticated", async () => {
      mockAuth.mockResolvedValue(null);
      const res = await createResult(createMockRequest("http://localhost/api/results", "POST", validBody));
      expect(res.status).toBe(401);
    });

    it("returns 403 for a student", async () => {
      mockAuth.mockResolvedValue({ user: { id: OTHER_USER, role: "student" } });
      const res = await createResult(createMockRequest("http://localhost/api/results", "POST", validBody));
      expect(res.status).toBe(403);
    });

    it("returns 400 for a missing field", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "teacher" } });
      const res = await createResult(
        createMockRequest("http://localhost/api/results", "POST", { studentId: STUDENT_ID, courseId: COURSE_ID })
      );
      expect(res.status).toBe(400);
    });

    it("returns 400 for an invalid grade", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "teacher" } });
      const res = await createResult(
        createMockRequest("http://localhost/api/results", "POST", { ...validBody, grade: "Z" })
      );
      expect(res.status).toBe(400);
    });

    it("returns 400 for out-of-range marks", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "teacher" } });
      const res = await createResult(
        createMockRequest("http://localhost/api/results", "POST", { ...validBody, marks: 140 })
      );
      expect(res.status).toBe(400);
    });

    it("returns 404 when the course does not exist", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "teacher" } });
      mockCourse.findById.mockReturnValue(lean(null));
      const res = await createResult(createMockRequest("http://localhost/api/results", "POST", validBody));
      expect(res.status).toBe(404);
    });

    it("returns 403 when a teacher does not own the course", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "teacher" } });
      mockCourse.findById.mockReturnValue(lean({ _id: COURSE_ID, teacherId: COURSE_OTHER }));
      mockTeacher.findOne.mockReturnValue(lean({ _id: TEACHER_ID }));
      const res = await createResult(createMockRequest("http://localhost/api/results", "POST", validBody));
      expect(res.status).toBe(403);
    });

    it("returns 404 when the student does not exist", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "teacher" } });
      mockCourse.findById.mockReturnValue(lean({ _id: COURSE_ID, teacherId: TEACHER_ID }));
      mockTeacher.findOne.mockReturnValue(lean({ _id: TEACHER_ID }));
      mockStudent.findById.mockReturnValue(lean(null));
      const res = await createResult(createMockRequest("http://localhost/api/results", "POST", validBody));
      expect(res.status).toBe(404);
    });

    it("returns 409 when the result already exists", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "teacher" } });
      mockCourse.findById.mockReturnValue(lean({ _id: COURSE_ID, teacherId: TEACHER_ID }));
      mockTeacher.findOne.mockReturnValue(lean({ _id: TEACHER_ID }));
      mockStudent.findById.mockReturnValue(lean({ _id: STUDENT_ID }));
      mockResult.findOne.mockReturnValue(lean({ _id: RESULT_ID }));
      const res = await createResult(createMockRequest("http://localhost/api/results", "POST", validBody));
      expect(res.status).toBe(409);
    });

    it("creates a result as the owning teacher", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "teacher" } });
      mockCourse.findById.mockReturnValue(lean({ _id: COURSE_ID, teacherId: TEACHER_ID }));
      mockTeacher.findOne.mockReturnValue(lean({ _id: TEACHER_ID }));
      mockStudent.findById.mockReturnValue(lean({ _id: STUDENT_ID }));
      mockResult.findOne.mockReturnValue(lean(null));
      mockResult.create.mockResolvedValue({
        _id: RESULT_ID,
        studentId: STUDENT_ID,
        courseId: COURSE_ID,
        marks: 85,
        grade: "A",
      } as any);

      const res = await createResult(createMockRequest("http://localhost/api/results", "POST", validBody));
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.data.id).toBe(RESULT_ID);
      expect(json.data.grade).toBe("A");
    });

    it("creates a result as an admin for any course", async () => {
      mockAuth.mockResolvedValue({ user: { id: OTHER_USER, role: "admin" } });
      mockCourse.findById.mockReturnValue(lean({ _id: COURSE_ID, teacherId: TEACHER_ID }));
      mockStudent.findById.mockReturnValue(lean({ _id: STUDENT_ID }));
      mockResult.findOne.mockReturnValue(lean(null));
      mockResult.create.mockResolvedValue({
        _id: RESULT_ID,
        studentId: STUDENT_ID,
        courseId: COURSE_ID,
        marks: 85,
        grade: "A",
      } as any);

      const res = await createResult(createMockRequest("http://localhost/api/results", "POST", validBody));
      expect(res.status).toBe(201);
    });

    it("returns 409 on a duplicate key race", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "teacher" } });
      mockCourse.findById.mockReturnValue(lean({ _id: COURSE_ID, teacherId: TEACHER_ID }));
      mockTeacher.findOne.mockReturnValue(lean({ _id: TEACHER_ID }));
      mockStudent.findById.mockReturnValue(lean({ _id: STUDENT_ID }));
      mockResult.findOne.mockReturnValue(lean(null));
      mockResult.create.mockRejectedValue(Object.assign(new Error("dup"), { code: 11000 }));
      const res = await createResult(createMockRequest("http://localhost/api/results", "POST", validBody));
      expect(res.status).toBe(409);
    });

    it("lets a department admin create a result for their own department's course", async () => {
      mockAuth.mockResolvedValue({ user: { id: OTHER_USER, role: "admin", assignedDepartment: DEPT_ID } });
      mockCourse.findById.mockReturnValue(lean({ _id: COURSE_ID, teacherId: TEACHER_ID, departmentId: DEPT_ID }));
      mockStudent.findById.mockReturnValue(lean({ _id: STUDENT_ID }));
      mockResult.findOne.mockReturnValue(lean(null));
      mockResult.create.mockResolvedValue({
        _id: RESULT_ID,
        studentId: STUDENT_ID,
        courseId: COURSE_ID,
        marks: 85,
        grade: "A",
      } as any);

      const res = await createResult(createMockRequest("http://localhost/api/results", "POST", validBody));
      expect(res.status).toBe(201);
    });

    it("returns 403 when a department admin creates a result for another department's course", async () => {
      mockAuth.mockResolvedValue({ user: { id: OTHER_USER, role: "admin", assignedDepartment: DEPT_ID } });
      mockCourse.findById.mockReturnValue(lean({ _id: COURSE_ID, teacherId: TEACHER_ID, departmentId: DEPT_OTHER }));

      const res = await createResult(createMockRequest("http://localhost/api/results", "POST", validBody));
      expect(res.status).toBe(403);
      expect(mockResult.create).not.toHaveBeenCalled();
    });

    it("returns 500 on database error", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "teacher" } });
      mockCourse.findById.mockImplementation(() => {
        throw new Error("db down");
      });
      const res = await createResult(createMockRequest("http://localhost/api/results", "POST", validBody));
      expect(res.status).toBe(500);
    });
  });

  describe("PUT /api/results/:id", () => {
    const put = (body: unknown, id = RESULT_ID) =>
      updateResult(createMockRequest(`http://localhost/api/results/${id}`, "PUT", body), {
        params: Promise.resolve({ id }),
      });

    it("returns 401 when not authenticated", async () => {
      mockAuth.mockResolvedValue(null);
      const res = await put({ marks: 90 });
      expect(res.status).toBe(401);
    });

    it("returns 403 for a student", async () => {
      mockAuth.mockResolvedValue({ user: { id: OTHER_USER, role: "student" } });
      const res = await put({ marks: 90 });
      expect(res.status).toBe(403);
    });

    it("returns 400 for an invalid ID", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "teacher" } });
      const res = await put({ marks: 90 }, "nope");
      expect(res.status).toBe(400);
    });

    it("returns 400 for an invalid body", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "teacher" } });
      const res = await put({ marks: 200 });
      expect(res.status).toBe(400);
    });

    it("returns 404 when the result does not exist", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "teacher" } });
      mockResult.findById.mockReturnValue(lean(null));
      const res = await put({ marks: 90 });
      expect(res.status).toBe(404);
    });

    it("returns 403 when a teacher does not own the course", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "teacher" } });
      mockResult.findById.mockReturnValue(lean({ _id: RESULT_ID, courseId: COURSE_ID, marks: 80, grade: "B" }));
      mockCourse.findById.mockReturnValue(lean({ teacherId: COURSE_OTHER }));
      mockTeacher.findOne.mockReturnValue(lean({ _id: TEACHER_ID }));
      const res = await put({ marks: 90 });
      expect(res.status).toBe(403);
    });

    it("updates a result as the owning teacher", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "teacher" } });
      mockResult.findById.mockReturnValue(lean({ _id: RESULT_ID, courseId: COURSE_ID, marks: 80, grade: "B" }));
      mockCourse.findById.mockReturnValue(lean({ teacherId: TEACHER_ID }));
      mockTeacher.findOne.mockReturnValue(lean({ _id: TEACHER_ID }));
      mockResult.findByIdAndUpdate.mockReturnValue(
        lean({ _id: RESULT_ID, studentId: STUDENT_ID, courseId: COURSE_ID, marks: 90, grade: "A" })
      );

      const res = await put({ marks: 90, grade: "A" });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.marks).toBe(90);
    });

    it("updates a result as an admin", async () => {
      mockAuth.mockResolvedValue({ user: { id: OTHER_USER, role: "admin" } });
      mockResult.findById.mockReturnValue(lean({ _id: RESULT_ID, courseId: COURSE_ID, marks: 80, grade: "B" }));
      mockResult.findByIdAndUpdate.mockReturnValue(
        lean({ _id: RESULT_ID, studentId: STUDENT_ID, courseId: COURSE_ID, marks: 90, grade: "A" })
      );
      const res = await put({ marks: 90 });
      expect(res.status).toBe(200);
    });

    it("lets a department admin update a result of their own department", async () => {
      mockAuth.mockResolvedValue({ user: { id: OTHER_USER, role: "admin", assignedDepartment: DEPT_ID } });
      mockResult.findById.mockReturnValue(lean({ _id: RESULT_ID, courseId: COURSE_ID, marks: 80, grade: "B" }));
      mockCourse.findById.mockReturnValue(lean({ departmentId: DEPT_ID }));
      mockResult.findByIdAndUpdate.mockReturnValue(
        lean({ _id: RESULT_ID, studentId: STUDENT_ID, courseId: COURSE_ID, marks: 90, grade: "A" })
      );

      const res = await put({ marks: 90 });
      expect(res.status).toBe(200);
    });

    it("returns 403 when a department admin updates a result of another department", async () => {
      mockAuth.mockResolvedValue({ user: { id: OTHER_USER, role: "admin", assignedDepartment: DEPT_ID } });
      mockResult.findById.mockReturnValue(lean({ _id: RESULT_ID, courseId: COURSE_ID, marks: 80, grade: "B" }));
      mockCourse.findById.mockReturnValue(lean({ departmentId: DEPT_OTHER }));

      const res = await put({ marks: 90 });
      expect(res.status).toBe(403);
      expect(mockResult.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it("returns 500 on database error", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "teacher" } });
      mockResult.findById.mockImplementation(() => {
        throw new Error("db down");
      });
      const res = await put({ marks: 90 });
      expect(res.status).toBe(500);
    });
  });

  describe("GET /api/results/student/:studentId", () => {
    const get = (studentId = STUDENT_ID) =>
      getStudentResults(createMockRequest(`http://localhost/api/results/student/${studentId}`), {
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

    it("returns results and credit-weighted GPA for an admin", async () => {
      mockAuth.mockResolvedValue({ user: { id: OTHER_USER, role: "admin" } });
      mockStudent.findById.mockReturnValue(lean({ _id: STUDENT_ID, userId: USER_SELF }));
      mockResult.find.mockReturnValue(
        chainPopulate([
          { _id: "r1", courseId: { _id: COURSE_ID, code: "CS101", title: "Intro", creditHours: 3 }, marks: 92, grade: "A" },
          { _id: "r2", courseId: { _id: COURSE_OTHER, code: "CS102", title: "Data", creditHours: 3 }, marks: 81, grade: "B" },
        ])
      );

      const res = await get();
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.results).toHaveLength(2);
      expect(json.data.results[0].course.code).toBe("CS101");
      expect(json.data.gpa).toBe(3.5);
    });

    it("returns own results for a student", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "student" } });
      mockStudent.findById.mockReturnValue(lean({ _id: STUDENT_ID, userId: USER_SELF }));
      mockResult.find.mockReturnValue(chainPopulate([]));
      const res = await get();
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.results).toEqual([]);
      expect(json.data.gpa).toBe(0);
    });

    it("lets a department admin view a student of their own department", async () => {
      mockAuth.mockResolvedValue({ user: { id: OTHER_USER, role: "admin", assignedDepartment: DEPT_ID } });
      mockStudent.findById.mockReturnValue(lean({ _id: STUDENT_ID, userId: USER_SELF, departmentId: DEPT_ID }));
      mockResult.find.mockReturnValue(chainPopulate([]));

      const res = await get();
      expect(res.status).toBe(200);
    });

    it("returns 403 when a department admin views another department's student", async () => {
      mockAuth.mockResolvedValue({ user: { id: OTHER_USER, role: "admin", assignedDepartment: DEPT_ID } });
      mockStudent.findById.mockReturnValue(lean({ _id: STUDENT_ID, userId: USER_SELF, departmentId: DEPT_OTHER }));

      const res = await get();
      expect(res.status).toBe(403);
      expect(mockResult.find).not.toHaveBeenCalled();
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
