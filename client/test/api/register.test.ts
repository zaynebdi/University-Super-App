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
  Student: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
  Teacher: {
    create: vi.fn(),
  },
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
import { User, Student, Teacher } from "@/lib/models";

const mockAuth = vi.mocked(auth) as unknown as {
  mockResolvedValue: (value: unknown) => void;
};
const mockDb = vi.mocked(dbConnect);
const mockUser = vi.mocked(User);
const mockStudent = vi.mocked(Student);
const mockTeacher = vi.mocked(Teacher);

const ADMIN = "aaaaaaaaaaaaaaaaaaaaaaaa";
const STUDENT_ID = "bbbbbbbbbbbbbbbbbbbbbbbb";

function createMockRequest(body?: unknown): Request {
  return new Request("http://localhost/api/auth/register", {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

function createdUser(role: "student" | "teacher") {
  return {
    _id: { toString: () => STUDENT_ID },
    name: "New User",
    email: "new@test.com",
    role,
  } as any;
}

const studentBody = {
  name: "New Student",
  email: "student@test.com",
  password: "password123",
  role: "student",
  rollNo: "SE-001",
  department: "Software Engineering",
  semester: 3,
};

const teacherBody = {
  name: "New Teacher",
  email: "teacher@test.com",
  password: "password123",
  role: "teacher",
  department: "Computer Science",
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

  it("returns 409 when the email is already registered", async () => {
    mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
    mockUser.findOne.mockResolvedValue({ _id: STUDENT_ID } as any);
    const res = await register(createMockRequest(studentBody));
    expect(res.status).toBe(409);
    expect(mockUser.create).not.toHaveBeenCalled();
  });

  it("returns 409 when the roll number is already in use", async () => {
    mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
    mockUser.findOne.mockResolvedValue(null);
    mockStudent.findOne.mockResolvedValue({ _id: STUDENT_ID } as any);
    const res = await register(createMockRequest(studentBody));
    expect(res.status).toBe(409);
    expect(mockUser.create).not.toHaveBeenCalled();
  });

  it("creates a student account and profile with 201", async () => {
    mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
    mockUser.findOne.mockResolvedValue(null);
    mockStudent.findOne.mockResolvedValue(null);
    mockUser.create.mockResolvedValue(createdUser("student"));

    const res = await register(createMockRequest(studentBody));
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data.role).toBe("student");
    expect(mockStudent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        rollNo: "SE-001",
        department: "Software Engineering",
        semester: 3,
      })
    );
  });

  it("creates a teacher profile with the given department", async () => {
    mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
    mockUser.findOne.mockResolvedValue(null);
    mockUser.create.mockResolvedValue(createdUser("teacher"));
    const res = await register(createMockRequest(teacherBody));
    expect(res.status).toBe(201);
    expect(mockTeacher.create).toHaveBeenCalledWith(
      expect.objectContaining({
        department: "Computer Science",
        designation: "Lecturer",
      })
    );
  });

  it("returns 500 on database error", async () => {
    mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
    mockDb.mockRejectedValueOnce(new Error("db down"));
    const res = await register(createMockRequest(studentBody));
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.success).toBe(false);
  });
});
