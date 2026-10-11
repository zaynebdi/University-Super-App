import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth-server", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  default: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/lib/models", () => ({
  Department: {
    find: vi.fn(),
    findById: vi.fn(),
    findOne: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    create: vi.fn(),
  },
  Course: {
    find: vi.fn(),
  },
}));

import { GET as getDepartments, POST as createDepartment } from "@/app/api/departments/route";
import { PUT as updateDepartment, DELETE as deleteDepartment } from "@/app/api/departments/[id]/route";
import { auth } from "@/lib/auth-server";
import { Department, Course } from "@/lib/models";

const mockAuth = vi.mocked(auth) as unknown as {
  mockResolvedValue: (value: unknown) => void;
};
const mockDepartment = vi.mocked(Department);
const mockCourse = vi.mocked(Course);

const ADMIN = "aaaaaaaaaaaaaaaaaaaaaaaa";
const DEPT_ID = "111111111111111111111111";
const DEPT_OTHER = "222222222222222222222222";
const COURSE_ID = "999999999999999999999999";

function createMockRequest(url: string, method = "GET", body?: unknown): Request {
  return new Request(url, { method, body: body ? JSON.stringify(body) : undefined });
}

function chainLean(value: unknown) {
  return { lean: vi.fn().mockResolvedValue(value) } as any;
}

function chainCollation(value: unknown) {
  return {
    collation: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue(value) }),
  } as any;
}

function chainSelectLean(value: unknown) {
  return {
    select: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue(value) }),
  } as any;
}

function departmentLean(overrides: Record<string, unknown> = {}) {
  return {
    _id: DEPT_ID,
    name: "Computer Science",
    code: "CS",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function courseLean() {
  return {
    _id: COURSE_ID,
    code: "CS101",
    title: "Intro to CS",
    departmentId: DEPT_ID,
  };
}

describe("Departments API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/departments", () => {
    it("returns 403 when not authenticated", async () => {
      mockAuth.mockResolvedValue(null);
      const res = await getDepartments(createMockRequest("http://localhost/api/departments"));
      expect(res.status).toBe(403);
    });

    it("returns 403 for non-admin users", async () => {
      mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "student" } } as any);
      const res = await getDepartments(createMockRequest("http://localhost/api/departments"));
      expect(res.status).toBe(403);
    });

    it("returns 400 for an invalid activeOnly query", async () => {
      mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
      const res = await getDepartments(
        createMockRequest("http://localhost/api/departments?activeOnly=maybe")
      );
      expect(res.status).toBe(400);
    });

    it("lists departments with their courses grouped in", async () => {
      mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
      mockDepartment.find.mockReturnValue(
        chainLean([departmentLean(), departmentLean({ _id: DEPT_OTHER, name: "Math", code: "MT" })])
      );
      mockCourse.find.mockReturnValue(chainSelectLean([courseLean()]));

      const res = await getDepartments(createMockRequest("http://localhost/api/departments"));
      expect(res.status).toBe(200);
      const json = await res.json();

      expect(json.data).toHaveLength(2);
      const cs = json.data[0];
      expect(cs.name).toBe("Computer Science");
      expect(cs.code).toBe("CS");
      expect(cs.courseCount).toBe(1);
      expect(cs.courses[0]).toEqual({
        id: COURSE_ID,
        code: "CS101",
        title: "Intro to CS",
      });
      const math = json.data[1];
      expect(math.courseCount).toBe(0);
      expect(math.courses).toEqual([]);
    });

    it("filters to active departments with activeOnly=true", async () => {
      mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
      mockDepartment.find.mockReturnValue(chainLean([departmentLean()]));
      mockCourse.find.mockReturnValue(chainSelectLean([]));

      await getDepartments(createMockRequest("http://localhost/api/departments?activeOnly=true"));
      expect(mockDepartment.find).toHaveBeenCalledWith({ isActive: true });
    });

    it("returns 500 on database error", async () => {
      mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
      mockDepartment.find.mockReturnValue({ lean: vi.fn().mockRejectedValue(new Error("db down")) } as any);
      const res = await getDepartments(createMockRequest("http://localhost/api/departments"));
      expect(res.status).toBe(500);
    });
  });

  describe("POST /api/departments", () => {
    it("returns 403 for non-admin users", async () => {
      mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "teacher" } } as any);
      const res = await createDepartment(
        createMockRequest("http://localhost/api/departments", "POST", { name: "CS", code: "CS" })
      );
      expect(res.status).toBe(403);
    });

    it("returns 400 for invalid input", async () => {
      mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
      const res = await createDepartment(
        createMockRequest("http://localhost/api/departments", "POST", { name: "X" })
      );
      expect(res.status).toBe(400);
    });

    it("returns 409 when the name or code already exists", async () => {
      mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
      mockDepartment.findOne.mockReturnValue(chainCollation(departmentLean()));
      const res = await createDepartment(
        createMockRequest("http://localhost/api/departments", "POST", { name: "Computer Science", code: "CS" })
      );
      expect(res.status).toBe(409);
    });

    it("creates a department with 201", async () => {
      mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
      mockDepartment.findOne.mockReturnValue(chainCollation(null));
      mockDepartment.create.mockResolvedValue(departmentLean() as never);

      const res = await createDepartment(
        createMockRequest("http://localhost/api/departments", "POST", { name: "Computer Science", code: "CS" })
      );
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.data.name).toBe("Computer Science");
      expect(json.data.code).toBe("CS");
      expect(json.data.isActive).toBe(true);
      expect(json.data.courseCount).toBe(0);
      expect(mockDepartment.create).toHaveBeenCalledWith({
        name: "Computer Science",
        code: "CS",
        isActive: true,
      });
    });

    it("returns 409 on a duplicate key error", async () => {
      mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
      mockDepartment.findOne.mockReturnValue(chainCollation(null));
      mockDepartment.create.mockRejectedValue({ code: 11000 });
      const res = await createDepartment(
        createMockRequest("http://localhost/api/departments", "POST", { name: "Math", code: "MT" })
      );
      expect(res.status).toBe(409);
    });
  });

  describe("PUT /api/departments/:id", () => {
    it("returns 403 for non-admin users", async () => {
      mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "student" } } as any);
      const res = await updateDepartment(
        createMockRequest("http://localhost/api/departments/" + DEPT_ID, "PUT", { name: "New" }),
        { params: Promise.resolve({ id: DEPT_ID }) }
      );
      expect(res.status).toBe(403);
    });

    it("returns 400 for an invalid id", async () => {
      mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
      const res = await updateDepartment(
        createMockRequest("http://localhost/api/departments/nope", "PUT", { name: "New" }),
        { params: Promise.resolve({ id: "nope" }) }
      );
      expect(res.status).toBe(400);
    });

    it("returns 404 when the department does not exist", async () => {
      mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
      mockDepartment.findById.mockReturnValue(chainLean(null));
      const res = await updateDepartment(
        createMockRequest("http://localhost/api/departments/" + DEPT_ID, "PUT", { name: "New" }),
        { params: Promise.resolve({ id: DEPT_ID }) }
      );
      expect(res.status).toBe(404);
    });

    it("returns 409 on a duplicate name or code", async () => {
      mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
      mockDepartment.findById.mockReturnValue(chainLean(departmentLean()));
      mockDepartment.findOne.mockReturnValue(chainCollation(departmentLean()));
      const res = await updateDepartment(
        createMockRequest("http://localhost/api/departments/" + DEPT_ID, "PUT", { code: "CS" }),
        { params: Promise.resolve({ id: DEPT_ID }) }
      );
      expect(res.status).toBe(409);
    });

    it("updates a department and returns it with its courses", async () => {
      mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
      mockDepartment.findById.mockReturnValue(chainLean(departmentLean({ name: "Updated" })));
      mockDepartment.findOne.mockReturnValue(chainCollation(null));
      mockDepartment.findByIdAndUpdate.mockReturnValue(chainLean(departmentLean({ name: "Updated" })));
      mockCourse.find.mockReturnValue(chainSelectLean([courseLean()]));

      const res = await updateDepartment(
        createMockRequest("http://localhost/api/departments/" + DEPT_ID, "PUT", { name: "Updated" }),
        { params: Promise.resolve({ id: DEPT_ID }) }
      );
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.name).toBe("Updated");
      expect(json.data.courseCount).toBe(1);
      expect(mockDepartment.findByIdAndUpdate).toHaveBeenCalledWith(
        DEPT_ID,
        { name: "Updated" },
        { new: true }
      );
    });
  });

  describe("DELETE /api/departments/:id", () => {
    it("returns 403 for non-admin users", async () => {
      mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "student" } } as any);
      const res = await deleteDepartment(
        createMockRequest("http://localhost/api/departments/" + DEPT_ID, "DELETE"),
        { params: Promise.resolve({ id: DEPT_ID }) }
      );
      expect(res.status).toBe(403);
    });

    it("returns 404 when the department does not exist", async () => {
      mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
      mockDepartment.findByIdAndUpdate.mockReturnValue(chainLean(null));
      const res = await deleteDepartment(
        createMockRequest("http://localhost/api/departments/" + DEPT_ID, "DELETE"),
        { params: Promise.resolve({ id: DEPT_ID }) }
      );
      expect(res.status).toBe(404);
    });

    it("deactivates the department (soft delete)", async () => {
      mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
      mockDepartment.findByIdAndUpdate.mockReturnValue(chainLean(departmentLean({ isActive: false })));
      const res = await deleteDepartment(
        createMockRequest("http://localhost/api/departments/" + DEPT_ID, "DELETE"),
        { params: Promise.resolve({ id: DEPT_ID }) }
      );
      expect(res.status).toBe(200);
      expect(mockDepartment.findByIdAndUpdate).toHaveBeenCalledWith(
        DEPT_ID,
        { isActive: false },
        { new: true }
      );
    });
  });
});