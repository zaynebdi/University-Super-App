import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth-server", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  default: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/lib/models", () => ({
  Student: {
    find: vi.fn(),
  },
}));

import { GET as getStudents } from "@/app/api/students/route";
import { auth } from "@/lib/auth-server";
import { Student } from "@/lib/models";

const mockAuth = vi.mocked(auth) as unknown as {
  mockResolvedValue: (value: unknown) => void;
};
const mockStudent = vi.mocked(Student);

const ADMIN = "aaaaaaaaaaaaaaaaaaaaaaaa";
const STUDENT_ID = "111111111111111111111111";
const DEPARTMENT_ID = "222222222222222222222222";
const OTHER_DEPARTMENT_ID = "333333333333333333333333";
const FIELD_ID = "444444444444444444444444";
const USER_ID = "555555555555555555555555";

function createMockRequest(url: string): Request {
  return new Request(url);
}

function studentLean(overrides: Record<string, unknown> = {}) {
  return {
    _id: STUDENT_ID,
    userId: {
      _id: USER_ID,
      name: "Student One",
      email: "s1@test.com",
      phone: "123",
      photo: null,
      isActive: true,
    },
    rollNo: "CS-2026-001",
    department: "Computer Science",
    departmentId: DEPARTMENT_ID,
    fieldId: null,
    field: null,
    semester: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function chain(value: unknown) {
  return {
    populate: vi.fn().mockReturnValue({
      populate: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue(value) }),
    }),
  } as any;
}

describe("GET /api/students", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await getStudents(createMockRequest("http://localhost/api/students"));
    expect(res.status).toBe(401);
  });

  it("returns 403 for non-admin users", async () => {
    mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "student" } } as any);
    const res = await getStudents(createMockRequest("http://localhost/api/students"));
    expect(res.status).toBe(403);
  });

  it("returns 400 for an invalid departmentId query", async () => {
    mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
    const res = await getStudents(
      createMockRequest("http://localhost/api/students?departmentId=nope")
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 when both department and departmentId are provided", async () => {
    mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
    const res = await getStudents(
      createMockRequest(`http://localhost/api/students?department=CS&departmentId=${DEPARTMENT_ID}`)
    );
    expect(res.status).toBe(400);
  });

  it("lists all students when no filter is given", async () => {
    mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
    mockStudent.find.mockReturnValue(chain([studentLean()]));

    const res = await getStudents(createMockRequest("http://localhost/api/students"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(mockStudent.find).toHaveBeenCalledWith({});
    expect(json.data).toHaveLength(1);
    expect(json.data[0]).toMatchObject({
      rollNo: "CS-2026-001",
      department: "Computer Science",
      departmentId: DEPARTMENT_ID,
      semester: 3,
      name: "Student One",
      email: "s1@test.com",
    });
  });

  it("filters students by department name", async () => {
    mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
    mockStudent.find.mockReturnValue(chain([studentLean()]));

    const res = await getStudents(
      createMockRequest("http://localhost/api/students?department=Computer%20Science")
    );
    expect(res.status).toBe(200);
    expect(mockStudent.find).toHaveBeenCalledWith({
      department: "Computer Science",
    });
  });

  it("filters students by departmentId", async () => {
    mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
    mockStudent.find.mockReturnValue(chain([studentLean()]));

    const res = await getStudents(
      createMockRequest(`http://localhost/api/students?departmentId=${DEPARTMENT_ID}`)
    );
    expect(res.status).toBe(200);
    expect(mockStudent.find).toHaveBeenCalledWith({
      departmentId: DEPARTMENT_ID,
    });
  });

  it("treats a missing department as an empty string", async () => {
    mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
    mockStudent.find.mockReturnValue(chain([studentLean({ department: undefined })]));

    const res = await getStudents(createMockRequest("http://localhost/api/students"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data[0].department).toBe("");
  });

  it("returns 500 on database error", async () => {
    mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
    mockStudent.find.mockReturnValue({
      populate: vi.fn().mockReturnValue({ lean: vi.fn().mockRejectedValue(new Error("db down")) }),
    } as any);

    const res = await getStudents(createMockRequest("http://localhost/api/students"));
    expect(res.status).toBe(500);
  });

  it("filters students by fieldId", async () => {
    mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
    mockStudent.find.mockReturnValue(chain([studentLean()]));

    const res = await getStudents(
      createMockRequest(
        `http://localhost/api/students?departmentId=${DEPARTMENT_ID}&fieldId=${FIELD_ID}`
      )
    );
    expect(res.status).toBe(200);
    expect(mockStudent.find).toHaveBeenCalledWith({
      departmentId: DEPARTMENT_ID,
      fieldId: FIELD_ID,
    });
  });

  it("returns the populated field on each student", async () => {
    mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
    mockStudent.find.mockReturnValue(
      chain([
        studentLean({
          fieldId: FIELD_ID,
          field: { _id: FIELD_ID, name: "Software Engineering", code: "SE" },
        }),
      ])
    );

    const res = await getStudents(createMockRequest("http://localhost/api/students"));
    const json = await res.json();
    expect(json.data[0].fieldId).toBe(FIELD_ID);
    expect(json.data[0].field).toEqual({
      id: FIELD_ID,
      name: "Software Engineering",
      code: "SE",
    });
  });

  it("returns null field for students without a field (does not crash)", async () => {
    mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
    mockStudent.find.mockReturnValue(chain([studentLean()]));

    const res = await getStudents(createMockRequest("http://localhost/api/students"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data[0].fieldId).toBe(null);
    expect(json.data[0].field).toBe(null);
  });

  it("restricts a department admin to their own department", async () => {
    mockAuth.mockResolvedValue({
      user: { id: ADMIN, role: "admin", assignedDepartment: DEPARTMENT_ID },
    } as any);
    mockStudent.find.mockReturnValue(chain([studentLean()]));

    const res = await getStudents(createMockRequest("http://localhost/api/students"));
    expect(res.status).toBe(200);
    expect(mockStudent.find).toHaveBeenCalledWith({ departmentId: DEPARTMENT_ID });
  });

  it("returns 403 when a department admin requests another department", async () => {
    mockAuth.mockResolvedValue({
      user: { id: ADMIN, role: "admin", assignedDepartment: DEPARTMENT_ID },
    } as any);

    const res = await getStudents(
      createMockRequest(
        `http://localhost/api/students?departmentId=${OTHER_DEPARTMENT_ID}`
      )
    );
    expect(res.status).toBe(403);
  });
});