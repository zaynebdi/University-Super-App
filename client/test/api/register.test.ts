import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth-server", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  default: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/lib/models", () => ({
  User: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
  Department: {
    findById: vi.fn(),
  },
  Field: {
    findById: vi.fn(),
  },
  Student: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
  Teacher: {
    create: vi.fn(),
  },
  Course: {
    find: vi.fn(),
    updateMany: vi.fn(),
  },
}));

vi.mock("@/lib/roll-number", () => ({
  createStudentWithRollNumber: vi.fn(),
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed"),
  },
  hash: vi.fn().mockResolvedValue("hashed"),
}));

import { POST as register } from "@/app/api/auth/register/route";
import { auth } from "@/lib/auth-server";
import dbConnect from "@/lib/db";
import { User, Department, Field, Teacher, Course } from "@/lib/models";
import { createStudentWithRollNumber } from "@/lib/roll-number";

const mockAuth = vi.mocked(auth) as unknown as {
  mockResolvedValue: (value: unknown) => void;
};
const mockDb = vi.mocked(dbConnect);
const mockUser = vi.mocked(User);
const mockDepartment = vi.mocked(Department);
const mockField = vi.mocked(Field);
const mockTeacher = vi.mocked(Teacher);
const mockCourse = vi.mocked(Course);
const mockCreateStudent = vi.mocked(createStudentWithRollNumber);

const ADMIN = "aaaaaaaaaaaaaaaaaaaaaaaa";
const STUDENT_ID = "bbbbbbbbbbbbbbbbbbbbbbbb";
const TEACHER_ID = "cccccccccccccccccccccccc";
const DEPARTMENT_ID = "dddddddddddddddddddddddd";
const OTHER_DEPARTMENT_ID = "111111111111111111111111";
const FIELD_ID = "eeeeeeeeeeeeeeeeeeeeeeee";
const COURSE_ID = "999999999999999999999999";

function createMockRequest(body?: unknown): Request {
  return new Request("http://localhost/api/auth/register", {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

function createdUser(role: "student" | "teacher" | "admin") {
  return {
    _id: { toString: () => STUDENT_ID },
    name: "New User",
    email: "new@test.com",
    role,
  } as any;
}

function mockDepartmentRecord() {
  return {
    _id: DEPARTMENT_ID,
    name: "Software Engineering",
    code: "SE",
    isActive: true,
  } as any;
}

function chain(value: unknown) {
  return { lean: vi.fn().mockResolvedValue(value) } as any;
}

const studentBody = {
  name: "New Student",
  email: "student@test.com",
  password: "password123",
  role: "student",
  departmentId: DEPARTMENT_ID,
  semester: 3,
};

const teacherBody = {
  name: "New Teacher",
  email: "teacher@test.com",
  password: "password123",
  role: "teacher",
  departmentId: DEPARTMENT_ID,
  designation: "Lecturer",
};

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 403 for non-admin users", async () => {
    mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "student" } } as any);
    const res = await register(createMockRequest(studentBody));
    expect(res.status).toBe(403);
  });

  it("returns 403 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await register(createMockRequest(studentBody));
    expect(res.status).toBe(403);
  });

  it("returns 400 when student profile fields are missing", async () => {
    mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
    const res = await register(
      createMockRequest({
        name: "New Student",
        email: "student@test.com",
        password: "password123",
        role: "student",
      })
    );
    expect(res.status).toBe(400);
    expect(mockUser.create).not.toHaveBeenCalled();
  });

  it("returns 400 when a teacher designation is not from the allowed list", async () => {
    mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
    const res = await register(
      createMockRequest({ ...teacherBody, designation: "CEO" })
    );
    expect(res.status).toBe(400);
    expect(mockUser.create).not.toHaveBeenCalled();
  });

  it("returns 400 when the department does not exist", async () => {
    mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
    mockDepartment.findById.mockReturnValue(chain(null));
    const res = await register(createMockRequest(studentBody));
    expect(res.status).toBe(400);
    expect(mockUser.create).not.toHaveBeenCalled();
  });

  it("returns 400 when the department is inactive", async () => {
    mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
    mockDepartment.findById.mockReturnValue(
      chain({ ...mockDepartmentRecord(), isActive: false })
    );
    const res = await register(createMockRequest(studentBody));
    expect(res.status).toBe(400);
    expect(mockUser.create).not.toHaveBeenCalled();
  });

  it("returns 409 when the email is already registered", async () => {
    mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
    mockDepartment.findById.mockReturnValue(chain(mockDepartmentRecord()));
    mockUser.findOne.mockResolvedValue({ _id: STUDENT_ID } as any);
    const res = await register(createMockRequest(studentBody));
    expect(res.status).toBe(409);
    expect(mockUser.create).not.toHaveBeenCalled();
  });

  it("creates a student account and profile with a generated roll number", async () => {
    mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
    mockDepartment.findById.mockReturnValue(chain(mockDepartmentRecord()));
    mockUser.findOne.mockResolvedValue(null);
    mockUser.create.mockResolvedValue(createdUser("student"));
    mockCreateStudent.mockResolvedValue({
      studentId: STUDENT_ID as never,
      rollNo: "SE-2026-001",
    } as never);

    const res = await register(createMockRequest(studentBody));
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data.role).toBe("student");
    expect(json.data.rollNo).toBe("SE-2026-001");
    expect(mockCreateStudent).toHaveBeenCalledWith(
      expect.anything(),
      DEPARTMENT_ID,
      "SE",
      "Software Engineering",
      3,
      undefined,
      null
    );
  });

  it("creates a teacher profile with the selected department and designation", async () => {
    mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
    mockDepartment.findById.mockReturnValue(chain(mockDepartmentRecord()));
    mockUser.findOne.mockResolvedValue(null);
    mockUser.create.mockResolvedValue(createdUser("teacher"));
    mockTeacher.create.mockResolvedValue({
      _id: { toString: () => TEACHER_ID },
    } as any);

    const res = await register(createMockRequest(teacherBody));
    expect(res.status).toBe(201);
    expect(mockTeacher.create).toHaveBeenCalledWith(
      expect.objectContaining({
        department: "Software Engineering",
        departmentId: DEPARTMENT_ID,
        designation: "Lecturer",
      })
    );
    expect(mockCourse.updateMany).not.toHaveBeenCalled();
  });

  it("assigns the teacher to courses of the selected department", async () => {
    mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
    mockDepartment.findById.mockReturnValue(chain(mockDepartmentRecord()));
    mockUser.findOne.mockResolvedValue(null);
    mockUser.create.mockResolvedValue(createdUser("teacher"));
    mockTeacher.create.mockResolvedValue({
      _id: { toString: () => TEACHER_ID },
    } as any);
    (mockCourse.find as ReturnType<typeof vi.fn>).mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue([{ _id: COURSE_ID, departmentId: DEPARTMENT_ID }]),
      }),
    });

    const res = await register(
      createMockRequest({ ...teacherBody, courseIds: [COURSE_ID] })
    );
    expect(res.status).toBe(201);
    const updateCall = (mockCourse.updateMany as ReturnType<typeof vi.fn>).mock
      .calls[0];
    expect(updateCall[0]).toEqual({ _id: { $in: [COURSE_ID] } });
    expect(String((updateCall[1] as { $set: { teacherId: unknown } }).$set.teacherId)).toBe(
      TEACHER_ID
    );
  });

  it("does not assign courses from other departments", async () => {
    mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
    mockDepartment.findById.mockReturnValue(chain(mockDepartmentRecord()));
    mockUser.findOne.mockResolvedValue(null);
    mockUser.create.mockResolvedValue(createdUser("teacher"));
    mockTeacher.create.mockResolvedValue({
      _id: { toString: () => TEACHER_ID },
    } as any);
    (mockCourse.find as ReturnType<typeof vi.fn>).mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue([
          { _id: COURSE_ID, departmentId: "111111111111111111111111" },
        ]),
      }),
    });

    const res = await register(
      createMockRequest({ ...teacherBody, courseIds: [COURSE_ID] })
    );
    expect(res.status).toBe(201);
    expect(mockCourse.updateMany).not.toHaveBeenCalled();
  });

  it("returns 500 on database error", async () => {
    mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
    mockDb.mockRejectedValueOnce(new Error("db down"));
    const res = await register(createMockRequest(studentBody));
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.success).toBe(false);
  });

  it("returns 403 when a department admin tries to create an admin", async () => {
    mockAuth.mockResolvedValue({
      user: { id: ADMIN, role: "admin", assignedDepartment: DEPARTMENT_ID },
    } as any);
    const res = await register(
      createMockRequest({
        name: "New Admin",
        email: "admin@test.com",
        password: "password123",
        role: "admin",
      })
    );
    expect(res.status).toBe(403);
    expect(mockUser.create).not.toHaveBeenCalled();
  });

  it("returns 403 when a department admin adds a student to another department", async () => {
    mockAuth.mockResolvedValue({
      user: { id: ADMIN, role: "admin", assignedDepartment: DEPARTMENT_ID },
    } as any);
    const res = await register(
      createMockRequest({ ...studentBody, departmentId: OTHER_DEPARTMENT_ID })
    );
    expect(res.status).toBe(403);
    expect(mockUser.create).not.toHaveBeenCalled();
  });

  it("allows a department admin to create a student in their own department", async () => {
    mockAuth.mockResolvedValue({
      user: { id: ADMIN, role: "admin", assignedDepartment: DEPARTMENT_ID },
    } as any);
    mockDepartment.findById.mockReturnValue(chain(mockDepartmentRecord()));
    mockUser.findOne.mockResolvedValue(null);
    mockUser.create.mockResolvedValue(createdUser("student"));
    mockCreateStudent.mockResolvedValue({
      studentId: STUDENT_ID as never,
      rollNo: "SE-2026-001",
    } as never);

    const res = await register(createMockRequest(studentBody));
    expect(res.status).toBe(201);
    expect(mockCreateStudent).toHaveBeenCalled();
  });

  it("lets a super admin create a super admin (no scope)", async () => {
    mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
    mockUser.findOne.mockResolvedValue(null);
    mockUser.create.mockResolvedValue(createdUser("admin"));

    const res = await register(
      createMockRequest({
        name: "New Admin",
        email: "admin@test.com",
        password: "password123",
        role: "admin",
        designation: "System Administrator",
      })
    );
    expect(res.status).toBe(201);
    expect(mockUser.create).toHaveBeenCalledWith(
      expect.objectContaining({ role: "admin", assignedDepartment: null })
    );
    const json = await res.json();
    expect(json.data.role).toBe("admin");
    expect(json.data.assignedDepartmentId).toBe(null);
  });

  it("creates a department admin with the selected department scope", async () => {
    mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
    mockDepartment.findById.mockReturnValue(chain(mockDepartmentRecord()));
    mockUser.findOne.mockResolvedValue(null);
    mockUser.create.mockResolvedValue({
      _id: { toString: () => ADMIN },
      name: "Dept Admin",
      email: "deptadmin@test.com",
      role: "admin",
    } as never);

    const res = await register(
      createMockRequest({
        name: "Dept Admin",
        email: "deptadmin@test.com",
        password: "password123",
        role: "admin",
        departmentId: DEPARTMENT_ID,
        designation: "Department Coordinator",
      })
    );
    expect(res.status).toBe(201);
    expect(mockUser.create).toHaveBeenCalledWith(
      expect.objectContaining({ assignedDepartment: DEPARTMENT_ID })
    );
    const json = await res.json();
    expect(json.data.assignedDepartmentId).toBe(DEPARTMENT_ID);
  });

  it("returns 400 for an invalid admin designation", async () => {
    mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
    const res = await register(
      createMockRequest({
        name: "New Admin",
        email: "admin@test.com",
        password: "password123",
        role: "admin",
        designation: "Supreme Leader",
      })
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 when the student field does not belong to the department", async () => {
    mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
    mockDepartment.findById.mockReturnValue(chain(mockDepartmentRecord()));
    mockField.findById.mockReturnValue(
      chain({ _id: FIELD_ID, departmentId: OTHER_DEPARTMENT_ID, isActive: true } as any)
    );

    const res = await register(
      createMockRequest({ ...studentBody, fieldId: FIELD_ID })
    );
    expect(res.status).toBe(400);
    expect(mockUser.create).not.toHaveBeenCalled();
  });

  it("creates a student with a validated field", async () => {
    mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
    mockDepartment.findById.mockReturnValue(chain(mockDepartmentRecord()));
    mockField.findById.mockReturnValue(
      chain({ _id: FIELD_ID, departmentId: DEPARTMENT_ID, isActive: true } as any)
    );
    mockUser.findOne.mockResolvedValue(null);
    mockUser.create.mockResolvedValue(createdUser("student"));
    mockCreateStudent.mockResolvedValue({
      studentId: STUDENT_ID as never,
      rollNo: "SE-2026-001",
    } as never);

    const res = await register(
      createMockRequest({ ...studentBody, fieldId: FIELD_ID })
    );
    expect(res.status).toBe(201);
    expect(mockCreateStudent).toHaveBeenCalledWith(
      expect.anything(),
      DEPARTMENT_ID,
      "SE",
      "Software Engineering",
      3,
      undefined,
      FIELD_ID
    );
  });
});