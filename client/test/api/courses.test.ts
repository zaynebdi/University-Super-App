import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth-server", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  default: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/lib/models", () => ({
  Course: {
    find: vi.fn(),
    findOne: vi.fn(),
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
    create: vi.fn(),
  },
  Enrollment: {
    findOne: vi.fn(),
    find: vi.fn(),
    create: vi.fn(),
    deleteMany: vi.fn(),
  },
  Teacher: {
    findById: vi.fn(),
    findOne: vi.fn(),
  },
  Department: {
    findById: vi.fn(),
  },
  Field: {
    findById: vi.fn(),
  },
  Student: {
    findById: vi.fn(),
  },
  User: {
    findById: vi.fn(),
  },
  Timetable: { deleteMany: vi.fn() },
  Attendance: { deleteMany: vi.fn() },
  Result: { deleteMany: vi.fn() },
}));

vi.mock("mongoose", () => {
  const startSession = vi.fn();
  const isValid = vi.fn((id: string) => /^[0-9a-fA-F]{24}$/.test(id));
  return {
    default: { startSession, Types: { ObjectId: { isValid } } },
    startSession,
    Types: { ObjectId: { isValid } },
  };
});

import { GET as getCourses, POST as createCourse } from "@/app/api/courses/route";
import { GET as getCourse, PUT as updateCourse, DELETE as deleteCourse } from "@/app/api/courses/[id]/route";
import { POST as enrollStudent } from "@/app/api/courses/[id]/enroll/route";
import { GET as getCourseStudents } from "@/app/api/courses/[id]/students/route";
import { auth } from "@/lib/auth-server";
import mongoose from "mongoose";
import { Course, Enrollment, Teacher, Department, Field, Student, User, Timetable, Attendance, Result } from "@/lib/models";

const mockAuth = vi.mocked(auth) as unknown as {
  mockResolvedValue: (value: unknown) => void;
};
const mockCourse = vi.mocked(Course);
const mockEnrollment = vi.mocked(Enrollment);
const mockTeacher = vi.mocked(Teacher);
const mockDepartment = vi.mocked(Department);
const mockField = vi.mocked(Field);
const mockStudent = vi.mocked(Student);
const mockUser = vi.mocked(User);
const mockTimetable = vi.mocked(Timetable);
const mockAttendance = vi.mocked(Attendance);
const mockResult = vi.mocked(Result);
const mockStartSession = (mongoose as unknown as { startSession: ReturnType<typeof vi.fn> }).startSession;

const COURSE_ID = "111111111111111111111111";
const COURSE_OTHER = "222222222222222222222222";
const TEACHER_ID = "333333333333333333333333";
const ENROLL_ID = "888888888888888888888888";
const STUDENT_ID = "444444444444444444444444";
const USER_SELF = "aaaaaaaaaaaaaaaaaaaaaaaa";
const USER_OTHER = "bbbbbbbbbbbbbbbbbbbbbbbb";
const DEPARTMENT_ID = "777777777777777777777777";
const DEPARTMENT_OTHER = "666666666666666666666666";
const FIELD_ID = "555555555555555555555555";

function createMockRequest(url: string, method = "GET", body?: unknown): Request {
  return new Request(url, { method, body: body ? JSON.stringify(body) : undefined });
}

function lean(value: unknown) {
  return { lean: vi.fn().mockResolvedValue(value) } as any;
}

function chainLean(value: unknown) {
  return {
    lean: vi.fn().mockResolvedValue(value),
    populate: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue(value) }),
  } as any;
}

function chainPopulate(value: unknown) {
  return {
    populate: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue(value) }),
  } as any;
}

function chainCollation(value: unknown) {
  return {
    collation: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue(value) }),
  } as any;
}

function makeSession() {
  return {
    withTransaction: vi.fn(async (fn: () => Promise<unknown>) => {
      await fn();
    }),
    endSession: vi.fn().mockResolvedValue(undefined),
  };
}

function courseLean(overrides: Record<string, unknown> = {}) {
  return {
    _id: COURSE_ID,
    code: "CS101",
    title: "Intro to CS",
    semester: 1,
    creditHours: 3,
    teacherId: {
      _id: TEACHER_ID,
      department: "CS",
      designation: "Professor",
      userId: { name: "Prof", email: "prof@test.com" },
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("Courses API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStartSession.mockReset();
  });

  describe("GET /api/courses", () => {
    it("returns 401 when not authenticated", async () => {
      mockAuth.mockResolvedValue(null);
      const res = await getCourses(createMockRequest("http://localhost/api/courses"));
      expect(res.status).toBe(401);
    });

    it("returns 400 for invalid semester query", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "student" } });
      const res = await getCourses(createMockRequest("http://localhost/api/courses?semester=abc"));
      expect(res.status).toBe(400);
    });

    it("returns 400 for invalid teacherId query", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "student" } });
      const res = await getCourses(createMockRequest("http://localhost/api/courses?teacherId=nope"));
      expect(res.status).toBe(400);
    });

    it("returns course list without filters", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "student" } });
      mockCourse.find.mockReturnValue(chainPopulate([courseLean()]));

      const res = await getCourses(createMockRequest("http://localhost/api/courses"));
      expect(res.status).toBe(200);
      expect(mockCourse.find).toHaveBeenCalledWith({});
      const data = await res.json();
      expect(data.data.length).toBe(1);
      expect(data.data[0].teacher.email).toBe("prof@test.com");
    });

    it("filters by semester", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      mockCourse.find.mockReturnValue(chainPopulate([]));

      await getCourses(createMockRequest("http://localhost/api/courses?semester=3"));
      expect(mockCourse.find).toHaveBeenCalledWith({ semester: 3 });
    });

    it("filters by teacherId", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      mockCourse.find.mockReturnValue(chainPopulate([]));

      await getCourses(createMockRequest("http://localhost/api/courses?teacherId=" + TEACHER_ID));
      expect(mockCourse.find).toHaveBeenCalledWith({ teacherId: TEACHER_ID });
    });

    it("filters by departmentId", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      mockCourse.find.mockReturnValue(chainPopulate([]));

      await getCourses(createMockRequest(`http://localhost/api/courses?departmentId=${DEPARTMENT_ID}`));
      expect(mockCourse.find).toHaveBeenCalledWith({ departmentId: DEPARTMENT_ID });
    });

    it("returns 400 for an invalid departmentId query", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      const res = await getCourses(createMockRequest("http://localhost/api/courses?departmentId=nope"));
      expect(res.status).toBe(400);
    });

    it("filters by fieldId", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      mockCourse.find.mockReturnValue(chainPopulate([]));

      await getCourses(createMockRequest(`http://localhost/api/courses?fieldId=${FIELD_ID}`));
      expect(mockCourse.find).toHaveBeenCalledWith({ fieldId: FIELD_ID });
    });

    it("restricts a department admin to their own department's courses", async () => {
      mockAuth.mockResolvedValue({
        user: { id: USER_SELF, role: "admin", assignedDepartment: DEPARTMENT_ID },
      } as any);
      mockCourse.find.mockReturnValue(chainPopulate([courseLean()]));

      const res = await getCourses(createMockRequest("http://localhost/api/courses"));
      expect(res.status).toBe(200);
      expect(mockCourse.find).toHaveBeenCalledWith({ departmentId: DEPARTMENT_ID });
    });

    it("returns 403 when a department admin filters another department", async () => {
      mockAuth.mockResolvedValue({
        user: { id: USER_SELF, role: "admin", assignedDepartment: DEPARTMENT_ID },
      } as any);

      const res = await getCourses(
        createMockRequest(`http://localhost/api/courses?departmentId=${DEPARTMENT_OTHER}`)
      );
      expect(res.status).toBe(403);
    });

    it("returns 500 on database error", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "student" } });
      mockCourse.find.mockImplementation(() => {
        throw new Error("db down");
      });
      const res = await getCourses(createMockRequest("http://localhost/api/courses"));
      expect(res.status).toBe(500);
    });
  });

  describe("POST /api/courses", () => {
    it("returns 403 for non-admin", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "teacher" } });
      const res = await createCourse(createMockRequest("http://localhost/api/courses", "POST", {
        code: "CS101", title: "Intro", semester: 1, creditHours: 3,
      }));
      expect(res.status).toBe(403);
    });

    it("returns 400 for invalid body", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      const res = await createCourse(createMockRequest("http://localhost/api/courses", "POST", { code: "CS101" }));
      expect(res.status).toBe(400);
    });

    it("returns 400 for unknown fields (strict)", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      const res = await createCourse(
        createMockRequest("http://localhost/api/courses", "POST", {
          code: "CS101",
          title: "Intro to CS",
          semester: 1,
          creditHours: 3,
          bogus: true,
        })
      );
      expect(res.status).toBe(400);
    });

    it("returns 404 when teacher does not exist", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      mockTeacher.findById.mockReturnValue(lean(null));

      const res = await createCourse(
        createMockRequest("http://localhost/api/courses", "POST", {
          code: "CS101",
          title: "Intro to CS",
          semester: 1,
          creditHours: 3,
          teacherId: TEACHER_ID,
        })
      );
      expect(res.status).toBe(404);
    });

    it("returns 409 when teacher is inactive", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      mockTeacher.findById.mockReturnValue(lean({ userId: USER_OTHER }));
      mockUser.findById.mockReturnValue(lean({ isActive: false }));

      const res = await createCourse(
        createMockRequest("http://localhost/api/courses", "POST", {
          code: "CS101",
          title: "Intro to CS",
          semester: 1,
          creditHours: 3,
          teacherId: TEACHER_ID,
        })
      );
      expect(res.status).toBe(409);
    });

    it("returns 404 when the department does not exist", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      mockDepartment.findById.mockReturnValue(lean(null));

      const res = await createCourse(
        createMockRequest("http://localhost/api/courses", "POST", {
          code: "CS101",
          title: "Intro to CS",
          semester: 1,
          creditHours: 3,
          departmentId: DEPARTMENT_ID,
        })
      );
      expect(res.status).toBe(404);
    });

    it("creates a course with a department", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      mockDepartment.findById.mockReturnValue(lean({ _id: DEPARTMENT_ID }));
      mockCourse.findOne.mockReturnValue(chainCollation(null));
      mockCourse.create.mockResolvedValue({ _id: COURSE_ID } as any);
      mockCourse.findById.mockReturnValue(chainLean(courseLean()));

      const res = await createCourse(
        createMockRequest("http://localhost/api/courses", "POST", {
          code: "CS101",
          title: "Intro to CS",
          semester: 1,
          creditHours: 3,
          departmentId: DEPARTMENT_ID,
        })
      );
      expect(res.status).toBe(201);
      expect(mockCourse.create).toHaveBeenCalledWith(
        expect.objectContaining({ departmentId: DEPARTMENT_ID })
      );
    });

    it("returns 409 when code already exists (case-insensitive)", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      mockCourse.findOne.mockReturnValue(chainCollation({ _id: COURSE_OTHER }));

      const res = await createCourse(
        createMockRequest("http://localhost/api/courses", "POST", {
          code: "cs101",
          title: "Intro to CS",
          semester: 1,
          creditHours: 3,
        })
      );
      expect(res.status).toBe(409);
    });

    it("creates a course and returns 201", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      mockCourse.findOne.mockReturnValue(chainCollation(null));
      mockTeacher.findById.mockReturnValue(lean({ userId: USER_OTHER }));
      mockUser.findById.mockReturnValue(lean({ isActive: true }));
      mockCourse.create.mockResolvedValue({ _id: COURSE_ID } as any);
      mockCourse.findById.mockReturnValue(chainLean(courseLean()));

      const res = await createCourse(
        createMockRequest("http://localhost/api/courses", "POST", {
          code: "CS101",
          title: "Intro to CS",
          semester: 1,
          creditHours: 3,
          teacherId: TEACHER_ID,
        })
      );
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.data.code).toBe("CS101");
      expect(data.data.teacher.id).toBe(TEACHER_ID);
    });

    it("returns 409 on duplicate key error from the database", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      mockCourse.findOne.mockReturnValue(chainCollation(null));
      mockCourse.create.mockRejectedValue(Object.assign(new Error("dup"), { code: 11000 }));

      const res = await createCourse(
        createMockRequest("http://localhost/api/courses", "POST", {
          code: "CS101",
          title: "Intro to CS",
          semester: 1,
          creditHours: 3,
        })
      );
      expect(res.status).toBe(409);
    });

    it("creates a course with a field", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      mockDepartment.findById.mockReturnValue(lean({ _id: DEPARTMENT_ID }));
      mockField.findById.mockReturnValue(
        lean({ _id: FIELD_ID, departmentId: DEPARTMENT_ID })
      );
      mockCourse.findOne.mockReturnValue(chainCollation(null));
      mockCourse.create.mockResolvedValue({ _id: COURSE_ID } as any);
      mockCourse.findById.mockReturnValue(
        chainLean(courseLean({ fieldId: { _id: FIELD_ID, name: "Software Engineering", code: "SE" } }))
      );

      const res = await createCourse(
        createMockRequest("http://localhost/api/courses", "POST", {
          code: "CS101",
          title: "Intro to CS",
          semester: 1,
          creditHours: 3,
          departmentId: DEPARTMENT_ID,
          fieldId: FIELD_ID,
        })
      );
      expect(res.status).toBe(201);
      expect(mockCourse.create).toHaveBeenCalledWith(
        expect.objectContaining({ fieldId: FIELD_ID })
      );
      const data = await res.json();
      expect(data.data.field).toEqual({
        id: FIELD_ID,
        name: "Software Engineering",
        code: "SE",
      });
    });

    it("returns 404 when the field does not exist", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      mockDepartment.findById.mockReturnValue(lean({ _id: DEPARTMENT_ID }));
      mockField.findById.mockReturnValue(lean(null));

      const res = await createCourse(
        createMockRequest("http://localhost/api/courses", "POST", {
          code: "CS101",
          title: "Intro to CS",
          semester: 1,
          creditHours: 3,
          departmentId: DEPARTMENT_ID,
          fieldId: FIELD_ID,
        })
      );
      expect(res.status).toBe(404);
      expect(mockCourse.create).not.toHaveBeenCalled();
    });

    it("returns 400 when the field does not belong to the department", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      mockDepartment.findById.mockReturnValue(lean({ _id: DEPARTMENT_ID }));
      mockField.findById.mockReturnValue(
        lean({ _id: FIELD_ID, departmentId: DEPARTMENT_OTHER })
      );

      const res = await createCourse(
        createMockRequest("http://localhost/api/courses", "POST", {
          code: "CS101",
          title: "Intro to CS",
          semester: 1,
          creditHours: 3,
          departmentId: DEPARTMENT_ID,
          fieldId: FIELD_ID,
        })
      );
      expect(res.status).toBe(400);
      expect(mockCourse.create).not.toHaveBeenCalled();
    });

    it("returns 500 on database error", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      mockCourse.findOne.mockReturnValue(chainCollation(null));
      mockCourse.create.mockRejectedValue(new Error("db down"));

      const res = await createCourse(
        createMockRequest("http://localhost/api/courses", "POST", {
          code: "CS101",
          title: "Intro to CS",
          semester: 1,
          creditHours: 3,
        })
      );
      expect(res.status).toBe(500);
    });
  });

  describe("GET /api/courses/:id", () => {
    it("returns 401 when not authenticated", async () => {
      mockAuth.mockResolvedValue(null);
      const res = await getCourse(createMockRequest("http://localhost/api/courses/" + COURSE_ID), {
        params: Promise.resolve({ id: COURSE_ID }),
      });
      expect(res.status).toBe(401);
    });

    it("returns 400 for invalid ID", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "student" } });
      const res = await getCourse(createMockRequest("http://localhost/api/courses/nope"), {
        params: Promise.resolve({ id: "nope" }),
      });
      expect(res.status).toBe(400);
    });

    it("returns 404 when course not found", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "student" } });
      mockCourse.findById.mockReturnValue(chainLean(null));

      const res = await getCourse(createMockRequest("http://localhost/api/courses/" + COURSE_ID), {
        params: Promise.resolve({ id: COURSE_ID }),
      });
      expect(res.status).toBe(404);
    });

    it("returns course details", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "student" } });
      mockCourse.findById.mockReturnValue(chainLean(courseLean()));

      const res = await getCourse(createMockRequest("http://localhost/api/courses/" + COURSE_ID), {
        params: Promise.resolve({ id: COURSE_ID }),
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.data.id).toBe(COURSE_ID);
    });

    it("returns 500 on database error", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "student" } });
      mockCourse.findById.mockImplementation(() => {
        throw new Error("db down");
      });

      const res = await getCourse(createMockRequest("http://localhost/api/courses/" + COURSE_ID), {
        params: Promise.resolve({ id: COURSE_ID }),
      });
      expect(res.status).toBe(500);
    });
  });

  describe("PUT /api/courses/:id", () => {
    it("returns 403 for non-admin", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "teacher" } });
      const res = await updateCourse(
        createMockRequest("http://localhost/api/courses/" + COURSE_ID, "PUT", { title: "New Title" }),
        { params: Promise.resolve({ id: COURSE_ID }) }
      );
      expect(res.status).toBe(403);
    });

    it("returns 400 for invalid ID", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      const res = await updateCourse(
        createMockRequest("http://localhost/api/courses/nope", "PUT", { title: "New Title" }),
        { params: Promise.resolve({ id: "nope" }) }
      );
      expect(res.status).toBe(400);
    });

    it("returns 400 for invalid body", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      const res = await updateCourse(
        createMockRequest("http://localhost/api/courses/" + COURSE_ID, "PUT", { semester: 99 }),
        { params: Promise.resolve({ id: COURSE_ID }) }
      );
      expect(res.status).toBe(400);
    });

    it("returns 404 when course not found", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      mockCourse.findById.mockReturnValue(chainLean(null));

      const res = await updateCourse(
        createMockRequest("http://localhost/api/courses/" + COURSE_ID, "PUT", { title: "New Title" }),
        { params: Promise.resolve({ id: COURSE_ID }) }
      );
      expect(res.status).toBe(404);
    });

    it("returns 409 when new code conflicts", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      mockCourse.findById.mockReturnValue(chainLean(courseLean()));
      mockCourse.findOne.mockReturnValue(chainCollation({ _id: COURSE_OTHER }));

      const res = await updateCourse(
        createMockRequest("http://localhost/api/courses/" + COURSE_ID, "PUT", { code: "CS102" }),
        { params: Promise.resolve({ id: COURSE_ID }) }
      );
      expect(res.status).toBe(409);
    });

    it("returns 404 when reassigning to a missing teacher", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      mockCourse.findById.mockReturnValue(chainLean(courseLean()));
      mockTeacher.findById.mockReturnValue(lean(null));

      const res = await updateCourse(
        createMockRequest("http://localhost/api/courses/" + COURSE_ID, "PUT", { teacherId: TEACHER_ID }),
        { params: Promise.resolve({ id: COURSE_ID }) }
      );
      expect(res.status).toBe(404);
    });

    it("returns 409 when reassigning to an inactive teacher", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      mockCourse.findById.mockReturnValue(chainLean(courseLean()));
      mockTeacher.findById.mockReturnValue(lean({ userId: USER_OTHER }));
      mockUser.findById.mockReturnValue(lean({ isActive: false }));

      const res = await updateCourse(
        createMockRequest("http://localhost/api/courses/" + COURSE_ID, "PUT", { teacherId: TEACHER_ID }),
        { params: Promise.resolve({ id: COURSE_ID }) }
      );
      expect(res.status).toBe(409);
    });

    it("updates a course and unassigns the teacher", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      mockCourse.findById.mockReturnValue(chainLean(courseLean({ title: "Updated", teacherId: null })));
      mockCourse.findByIdAndUpdate.mockResolvedValue({});

      const res = await updateCourse(
        createMockRequest("http://localhost/api/courses/" + COURSE_ID, "PUT", { teacherId: null }),
        { params: Promise.resolve({ id: COURSE_ID }) }
      );
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.data.teacher).toBe(null);
      expect(mockCourse.findByIdAndUpdate).toHaveBeenCalledWith(COURSE_ID, { teacherId: null }, { new: true });
    });

    it("returns 404 when reassigning to a missing department", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      mockCourse.findById.mockReturnValue(chainLean(courseLean()));
      mockDepartment.findById.mockReturnValue(lean(null));

      const res = await updateCourse(
        createMockRequest("http://localhost/api/courses/" + COURSE_ID, "PUT", { departmentId: DEPARTMENT_ID }),
        { params: Promise.resolve({ id: COURSE_ID }) }
      );
      expect(res.status).toBe(404);
    });

    it("updates the department of a course", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      mockCourse.findById.mockReturnValue(
        chainLean(
          courseLean({
            departmentId: { _id: DEPARTMENT_ID, name: "Computer Science", code: "CS" },
          })
        )
      );
      mockDepartment.findById.mockReturnValue(lean({ _id: DEPARTMENT_ID }));
      mockCourse.findByIdAndUpdate.mockResolvedValue({});

      const res = await updateCourse(
        createMockRequest("http://localhost/api/courses/" + COURSE_ID, "PUT", { departmentId: DEPARTMENT_ID }),
        { params: Promise.resolve({ id: COURSE_ID }) }
      );
      expect(res.status).toBe(200);
      expect(mockCourse.findByIdAndUpdate).toHaveBeenCalledWith(
        COURSE_ID,
        { departmentId: DEPARTMENT_ID },
        { new: true }
      );
    });

    it("returns 500 on database error", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      mockCourse.findById.mockImplementation(() => {
        throw new Error("db down");
      });

      const res = await updateCourse(
        createMockRequest("http://localhost/api/courses/" + COURSE_ID, "PUT", { title: "New Title" }),
        { params: Promise.resolve({ id: COURSE_ID }) }
      );
      expect(res.status).toBe(500);
    });
  });

  describe("DELETE /api/courses/:id", () => {
    it("returns 403 for non-admin", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "teacher" } });
      const res = await deleteCourse(createMockRequest("http://localhost/api/courses/" + COURSE_ID, "DELETE"), {
        params: Promise.resolve({ id: COURSE_ID }),
      });
      expect(res.status).toBe(403);
    });

    it("returns 400 for invalid ID", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      const res = await deleteCourse(createMockRequest("http://localhost/api/courses/nope", "DELETE"), {
        params: Promise.resolve({ id: "nope" }),
      });
      expect(res.status).toBe(400);
    });

    it("returns 404 when course not found", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      mockCourse.findById.mockReturnValue(chainLean(null));

      const res = await deleteCourse(createMockRequest("http://localhost/api/courses/" + COURSE_ID, "DELETE"), {
        params: Promise.resolve({ id: COURSE_ID }),
      });
      expect(res.status).toBe(404);
    });

    it("cascades deletion inside a transaction and returns 200", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      mockCourse.findById.mockReturnValue(chainLean(courseLean()));
      const session = makeSession();
      mockStartSession.mockResolvedValue(session);
      mockCourse.findByIdAndDelete.mockResolvedValue(courseLean());

      const res = await deleteCourse(createMockRequest("http://localhost/api/courses/" + COURSE_ID, "DELETE"), {
        params: Promise.resolve({ id: COURSE_ID }),
      });

      expect(res.status).toBe(200);
      const opts = { session };
      expect(mockEnrollment.deleteMany).toHaveBeenCalledWith({ courseId: COURSE_ID }, opts);
      expect(mockTimetable.deleteMany).toHaveBeenCalledWith({ courseId: COURSE_ID }, opts);
      expect(mockAttendance.deleteMany).toHaveBeenCalledWith({ courseId: COURSE_ID }, opts);
      expect(mockResult.deleteMany).toHaveBeenCalledWith({ courseId: COURSE_ID }, opts);
      expect(mockCourse.findByIdAndDelete).toHaveBeenCalledWith(COURSE_ID, opts);
      expect(session.withTransaction).toHaveBeenCalled();
      expect(session.endSession).toHaveBeenCalled();
    });

    it("returns 500 and aborts on cascade failure (no partial success)", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      mockCourse.findById.mockReturnValue(chainLean(courseLean()));
      const session = makeSession();
      session.withTransaction.mockRejectedValueOnce(new Error("transaction aborted"));
      mockStartSession.mockResolvedValue(session);

      const res = await deleteCourse(createMockRequest("http://localhost/api/courses/" + COURSE_ID, "DELETE"), {
        params: Promise.resolve({ id: COURSE_ID }),
      });

      expect(res.status).toBe(500);
      expect(session.endSession).toHaveBeenCalled();
    });

    it("returns 500 when the database errors", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      mockCourse.findById.mockImplementation(() => {
        throw new Error("db down");
      });

      const res = await deleteCourse(createMockRequest("http://localhost/api/courses/" + COURSE_ID, "DELETE"), {
        params: Promise.resolve({ id: COURSE_ID }),
      });
      expect(res.status).toBe(500);
    });
  });

  describe("POST /api/courses/:id/enroll", () => {
    it("returns 403 for non-admin", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "teacher" } });
      const res = await enrollStudent(
        createMockRequest("http://localhost/api/courses/" + COURSE_ID + "/enroll", "POST", { studentId: STUDENT_ID }),
        { params: Promise.resolve({ id: COURSE_ID }) }
      );
      expect(res.status).toBe(403);
    });

    it("returns 400 for invalid course ID", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      const res = await enrollStudent(
        createMockRequest("http://localhost/api/courses/nope/enroll", "POST", { studentId: STUDENT_ID }),
        { params: Promise.resolve({ id: "nope" }) }
      );
      expect(res.status).toBe(400);
    });

    it("returns 400 for invalid body", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      const res = await enrollStudent(
        createMockRequest("http://localhost/api/courses/" + COURSE_ID + "/enroll", "POST", { studentId: "bad" }),
        { params: Promise.resolve({ id: COURSE_ID }) }
      );
      expect(res.status).toBe(400);
    });

    it("returns 404 when course not found", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      mockCourse.findById.mockReturnValue(lean(null));

      const res = await enrollStudent(
        createMockRequest("http://localhost/api/courses/" + COURSE_ID + "/enroll", "POST", { studentId: STUDENT_ID }),
        { params: Promise.resolve({ id: COURSE_ID }) }
      );
      expect(res.status).toBe(404);
    });

    it("returns 404 when student does not exist", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      mockCourse.findById.mockReturnValue(lean(courseLean()));
      mockStudent.findById.mockReturnValue(lean(null));

      const res = await enrollStudent(
        createMockRequest("http://localhost/api/courses/" + COURSE_ID + "/enroll", "POST", { studentId: STUDENT_ID }),
        { params: Promise.resolve({ id: COURSE_ID }) }
      );
      expect(res.status).toBe(404);
    });

    it("returns 409 when the student is inactive", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      mockCourse.findById.mockReturnValue(lean(courseLean()));
      mockStudent.findById.mockReturnValue(lean({ userId: USER_OTHER }));
      mockUser.findById.mockReturnValue(lean({ isActive: false }));

      const res = await enrollStudent(
        createMockRequest("http://localhost/api/courses/" + COURSE_ID + "/enroll", "POST", { studentId: STUDENT_ID }),
        { params: Promise.resolve({ id: COURSE_ID }) }
      );
      expect(res.status).toBe(409);
    });

    it("returns 409 when the student is already enrolled", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      mockCourse.findById.mockReturnValue(lean(courseLean()));
      mockStudent.findById.mockReturnValue(lean({ userId: USER_OTHER }));
      mockUser.findById.mockReturnValue(lean({ isActive: true }));
      mockEnrollment.findOne.mockReturnValue(lean({ _id: ENROLL_ID }));

      const res = await enrollStudent(
        createMockRequest("http://localhost/api/courses/" + COURSE_ID + "/enroll", "POST", { studentId: STUDENT_ID }),
        { params: Promise.resolve({ id: COURSE_ID }) }
      );
      expect(res.status).toBe(409);
    });

    it("enrolls a student and returns 201", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      mockCourse.findById.mockReturnValue(lean(courseLean()));
      mockStudent.findById.mockReturnValue(lean({ userId: USER_OTHER }));
      mockUser.findById.mockReturnValue(lean({ isActive: true }));
      mockEnrollment.findOne.mockReturnValue(lean(null));
      mockEnrollment.create.mockResolvedValue({ _id: ENROLL_ID, enrolledAt: new Date() } as any);

      const res = await enrollStudent(
        createMockRequest("http://localhost/api/courses/" + COURSE_ID + "/enroll", "POST", { studentId: STUDENT_ID }),
        { params: Promise.resolve({ id: COURSE_ID }) }
      );
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.data.studentId).toBe(STUDENT_ID);
      expect(data.data.courseId).toBe(COURSE_ID);
    });

    it("returns 409 on duplicate key error from the database", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      mockCourse.findById.mockReturnValue(lean(courseLean()));
      mockStudent.findById.mockReturnValue(lean({ userId: USER_OTHER }));
      mockUser.findById.mockReturnValue(lean({ isActive: true }));
      mockEnrollment.findOne.mockReturnValue(lean(null));
      mockEnrollment.create.mockRejectedValue(Object.assign(new Error("dup"), { code: 11000 }));

      const res = await enrollStudent(
        createMockRequest("http://localhost/api/courses/" + COURSE_ID + "/enroll", "POST", { studentId: STUDENT_ID }),
        { params: Promise.resolve({ id: COURSE_ID }) }
      );
      expect(res.status).toBe(409);
    });

    it("returns 500 on database error", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      mockCourse.findById.mockImplementation(() => {
        throw new Error("db down");
      });

      const res = await enrollStudent(
        createMockRequest("http://localhost/api/courses/" + COURSE_ID + "/enroll", "POST", { studentId: STUDENT_ID }),
        { params: Promise.resolve({ id: COURSE_ID }) }
      );
      expect(res.status).toBe(500);
    });
  });

  describe("GET /api/courses/:id/students", () => {
    it("returns 401 when not authenticated", async () => {
      mockAuth.mockResolvedValue(null);
      const res = await getCourseStudents(createMockRequest("http://localhost/api/courses/" + COURSE_ID + "/students"), {
        params: Promise.resolve({ id: COURSE_ID }),
      });
      expect(res.status).toBe(401);
    });

    it("returns 400 for invalid ID", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      const res = await getCourseStudents(createMockRequest("http://localhost/api/courses/nope/students"), {
        params: Promise.resolve({ id: "nope" }),
      });
      expect(res.status).toBe(400);
    });

    it("returns 404 when course not found", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      mockCourse.findById.mockReturnValue(lean(null));

      const res = await getCourseStudents(createMockRequest("http://localhost/api/courses/" + COURSE_ID + "/students"), {
        params: Promise.resolve({ id: COURSE_ID }),
      });
      expect(res.status).toBe(404);
    });

    it("forbids a student role", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "student" } });
      mockCourse.findById.mockReturnValue(lean({ teacherId: TEACHER_ID }));

      const res = await getCourseStudents(createMockRequest("http://localhost/api/courses/" + COURSE_ID + "/students"), {
        params: Promise.resolve({ id: COURSE_ID }),
      });
      expect(res.status).toBe(403);
    });

    it("forbids a teacher who does not own the course", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "teacher" } });
      mockCourse.findById.mockReturnValue(lean({ teacherId: TEACHER_ID }));
      mockTeacher.findOne.mockReturnValue(lean({ _id: "999999999999999999999999" }));

      const res = await getCourseStudents(createMockRequest("http://localhost/api/courses/" + COURSE_ID + "/students"), {
        params: Promise.resolve({ id: COURSE_ID }),
      });
      expect(res.status).toBe(403);
    });

    it("returns enrolled students for the owning teacher", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "teacher" } });
      mockCourse.findById.mockReturnValue(lean({ teacherId: TEACHER_ID }));
      mockTeacher.findOne.mockReturnValue(lean({ _id: TEACHER_ID }));
      mockEnrollment.find.mockReturnValue(
        chainPopulate([
          {
            studentId: {
              _id: STUDENT_ID,
              rollNo: "R-1",
              department: "CS",
              semester: 3,
              userId: { name: "Stu", email: "stu@test.com" },
            },
          },
        ])
      );

      const res = await getCourseStudents(createMockRequest("http://localhost/api/courses/" + COURSE_ID + "/students"), {
        params: Promise.resolve({ id: COURSE_ID }),
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.data[0].rollNo).toBe("R-1");
      expect(data.data[0].name).toBe("Stu");
    });

    it("returns enrolled students for an admin", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      mockCourse.findById.mockReturnValue(lean({ teacherId: null }));
      mockEnrollment.find.mockReturnValue(chainPopulate([]));

      const res = await getCourseStudents(createMockRequest("http://localhost/api/courses/" + COURSE_ID + "/students"), {
        params: Promise.resolve({ id: COURSE_ID }),
      });
      expect(res.status).toBe(200);
    });

    it("returns 500 on database error", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } });
      mockCourse.findById.mockImplementation(() => {
        throw new Error("db down");
      });

      const res = await getCourseStudents(createMockRequest("http://localhost/api/courses/" + COURSE_ID + "/students"), {
        params: Promise.resolve({ id: COURSE_ID }),
      });
      expect(res.status).toBe(500);
    });
  });
});
