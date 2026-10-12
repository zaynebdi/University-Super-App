import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth-server", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  default: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/lib/enroll-field", () => ({
  enrollFieldStudents: vi.fn(),
}));

vi.mock("@/lib/models", () => ({
  Field: {
    find: vi.fn(),
    findById: vi.fn(),
    findOne: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
    create: vi.fn(),
  },
  Department: {
    findById: vi.fn(),
  },
  Course: {
    find: vi.fn(),
    countDocuments: vi.fn(),
  },
  Student: {
    countDocuments: vi.fn(),
  },
}));

import { GET as getFields, POST as createField } from "@/app/api/fields/route";
import {
  GET as getField,
  PUT as updateField,
  DELETE as deleteField,
} from "@/app/api/fields/[id]/route";
import { POST as enrollField } from "@/app/api/fields/[id]/enroll/route";
import { auth } from "@/lib/auth-server";
import { Field, Department, Course, Student } from "@/lib/models";
import { enrollFieldStudents } from "@/lib/enroll-field";

const mockAuth = vi.mocked(auth) as unknown as {
  mockResolvedValue: (value: unknown) => void;
};
const mockField = vi.mocked(Field);
const mockDepartment = vi.mocked(Department);
const mockCourse = vi.mocked(Course);
const mockStudent = vi.mocked(Student);
const mockEnrollFieldStudents = vi.mocked(enrollFieldStudents);

const ADMIN = "aaaaaaaaaaaaaaaaaaaaaaaa";
const FIELD_ID = "111111111111111111111111";
const FIELD_OTHER = "222222222222222222222222";
const DEPT_ID = "333333333333333333333333";
const DEPT_OTHER = "444444444444444444444444";
const COURSE_ID = "555555555555555555555555";
const STUDENT_ID = "666666666666666666666666";
const STUDENT_OTHER = "777777777777777777777777";

function createMockRequest(url: string, method = "GET", body?: unknown): Request {
  return new Request(url, { method, body: body ? JSON.stringify(body) : undefined });
}

function lean(value: unknown) {
  return { lean: vi.fn().mockResolvedValue(value) } as any;
}

function chainCollation(value: unknown) {
  return {
    collation: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue(value) }),
  } as any;
}

function chainSortLean(value: unknown) {
  return {
    sort: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue(value) }),
  } as any;
}

function chainSelectLean(value: unknown) {
  return {
    select: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue(value) }),
  } as any;
}

function fieldLean(overrides: Record<string, unknown> = {}) {
  return {
    _id: FIELD_ID,
    name: "Software Engineering",
    code: "SE",
    departmentId: DEPT_ID,
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
    fieldId: FIELD_ID,
  };
}

describe("Fields API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/fields", () => {
    it("returns 403 when not authenticated", async () => {
      mockAuth.mockResolvedValue(null);
      const res = await getFields(createMockRequest("http://localhost/api/fields"));
      expect(res.status).toBe(403);
    });

    it("returns 403 for non-admin users", async () => {
      mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "teacher" } } as any);
      const res = await getFields(createMockRequest("http://localhost/api/fields"));
      expect(res.status).toBe(403);
    });

    it("lists fields with their courses grouped in", async () => {
      mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
      mockField.find.mockReturnValue(chainSortLean([fieldLean()]));
      mockCourse.find.mockReturnValue(chainSelectLean([courseLean()]));

      const res = await getFields(createMockRequest("http://localhost/api/fields"));
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data).toHaveLength(1);
      expect(json.data[0].name).toBe("Software Engineering");
      expect(json.data[0].courseCount).toBe(1);
      expect(json.data[0].courses[0]).toEqual({
        id: COURSE_ID,
        code: "CS101",
        title: "Intro to CS",
      });
    });

    it("filters by departmentId", async () => {
      mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
      mockField.find.mockReturnValue(chainSortLean([]));
      mockCourse.find.mockReturnValue(chainSelectLean([]));

      await getFields(createMockRequest(`http://localhost/api/fields?departmentId=${DEPT_ID}`));
      expect(mockField.find).toHaveBeenCalledWith({ departmentId: DEPT_ID });
    });

    it("returns 400 for an invalid departmentId query", async () => {
      mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
      const res = await getFields(
        createMockRequest("http://localhost/api/fields?departmentId=nope")
      );
      expect(res.status).toBe(400);
    });

    it("restricts a department admin to their own department's fields", async () => {
      mockAuth.mockResolvedValue({
        user: { id: ADMIN, role: "admin", assignedDepartment: DEPT_ID },
      } as any);
      mockField.find.mockReturnValue(chainSortLean([fieldLean()]));
      mockCourse.find.mockReturnValue(chainSelectLean([]));

      const res = await getFields(createMockRequest("http://localhost/api/fields"));
      expect(res.status).toBe(200);
      expect(mockField.find).toHaveBeenCalledWith({ departmentId: DEPT_ID });
    });

    it("returns 403 when a department admin requests another department", async () => {
      mockAuth.mockResolvedValue({
        user: { id: ADMIN, role: "admin", assignedDepartment: DEPT_ID },
      } as any);
      const res = await getFields(
        createMockRequest(`http://localhost/api/fields?departmentId=${DEPT_OTHER}`)
      );
      expect(res.status).toBe(403);
    });
  });

  describe("POST /api/fields", () => {
    it("returns 403 for non-admin users", async () => {
      mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "teacher" } } as any);
      const res = await createField(
        createMockRequest("http://localhost/api/fields", "POST", {
          name: "Software Engineering",
          code: "SE",
          departmentId: DEPT_ID,
        })
      );
      expect(res.status).toBe(403);
    });

    it("returns 400 for invalid input", async () => {
      mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
      const res = await createField(
        createMockRequest("http://localhost/api/fields", "POST", { name: "X" })
      );
      expect(res.status).toBe(400);
    });

    it("returns 404 when the department does not exist", async () => {
      mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
      mockDepartment.findById.mockReturnValue(lean(null));
      const res = await createField(
        createMockRequest("http://localhost/api/fields", "POST", {
          name: "Software Engineering",
          code: "SE",
          departmentId: DEPT_ID,
        })
      );
      expect(res.status).toBe(404);
    });

    it("returns 409 when the department is inactive", async () => {
      mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
      mockDepartment.findById.mockReturnValue(lean({ _id: DEPT_ID, isActive: false }));
      const res = await createField(
        createMockRequest("http://localhost/api/fields", "POST", {
          name: "Software Engineering",
          code: "SE",
          departmentId: DEPT_ID,
        })
      );
      expect(res.status).toBe(409);
    });

    it("returns 409 when the name or code already exists", async () => {
      mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
      mockDepartment.findById.mockReturnValue(lean({ _id: DEPT_ID, isActive: true }));
      mockField.findOne.mockReturnValue(chainCollation(fieldLean()));
      const res = await createField(
        createMockRequest("http://localhost/api/fields", "POST", {
          name: "Software Engineering",
          code: "SE",
          departmentId: DEPT_ID,
        })
      );
      expect(res.status).toBe(409);
    });

    it("creates a field with 201", async () => {
      mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
      mockDepartment.findById.mockReturnValue(lean({ _id: DEPT_ID, isActive: true }));
      mockField.findOne.mockReturnValue(chainCollation(null));
      mockField.create.mockResolvedValue(fieldLean() as never);

      const res = await createField(
        createMockRequest("http://localhost/api/fields", "POST", {
          name: "Software Engineering",
          code: "SE",
          departmentId: DEPT_ID,
        })
      );
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.data.name).toBe("Software Engineering");
      expect(json.data.code).toBe("SE");
      expect(json.data.departmentId).toBe(DEPT_ID);
      expect(mockField.create).toHaveBeenCalledWith({
        name: "Software Engineering",
        code: "SE",
        departmentId: DEPT_ID,
        isActive: true,
      });
    });

    it("allows a department admin to create a field in their own department", async () => {
      mockAuth.mockResolvedValue({
        user: { id: ADMIN, role: "admin", assignedDepartment: DEPT_ID },
      } as any);
      mockDepartment.findById.mockReturnValue(lean({ _id: DEPT_ID, isActive: true }));
      mockField.findOne.mockReturnValue(chainCollation(null));
      mockField.create.mockResolvedValue(fieldLean() as never);

      const res = await createField(
        createMockRequest("http://localhost/api/fields", "POST", {
          name: "Software Engineering",
          code: "SE",
          departmentId: DEPT_ID,
        })
      );
      expect(res.status).toBe(201);
    });

    it("returns 403 when a department admin adds a field to another department", async () => {
      mockAuth.mockResolvedValue({
        user: { id: ADMIN, role: "admin", assignedDepartment: DEPT_ID },
      } as any);
      const res = await createField(
        createMockRequest("http://localhost/api/fields", "POST", {
          name: "Electrical",
          code: "EE",
          departmentId: DEPT_OTHER,
        })
      );
      expect(res.status).toBe(403);
      expect(mockField.create).not.toHaveBeenCalled();
    });
  });

  describe("GET /api/fields/:id", () => {
    it("returns 403 for non-admin users", async () => {
      mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "student" } } as any);
      const res = await getField(createMockRequest("http://localhost/api/fields/" + FIELD_ID), {
        params: Promise.resolve({ id: FIELD_ID }),
      });
      expect(res.status).toBe(403);
    });

    it("returns 400 for an invalid id", async () => {
      mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
      const res = await getField(createMockRequest("http://localhost/api/fields/nope"), {
        params: Promise.resolve({ id: "nope" }),
      });
      expect(res.status).toBe(400);
    });

    it("returns 404 when the field does not exist", async () => {
      mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
      mockField.findById.mockReturnValue(lean(null));
      const res = await getField(createMockRequest("http://localhost/api/fields/" + FIELD_ID), {
        params: Promise.resolve({ id: FIELD_ID }),
      });
      expect(res.status).toBe(404);
    });

    it("returns the field with its courses", async () => {
      mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
      mockField.findById.mockReturnValue(lean(fieldLean()));
      mockCourse.find.mockReturnValue(chainSelectLean([courseLean()]));

      const res = await getField(createMockRequest("http://localhost/api/fields/" + FIELD_ID), {
        params: Promise.resolve({ id: FIELD_ID }),
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.id).toBe(FIELD_ID);
      expect(json.data.courseCount).toBe(1);
    });

    it("returns 403 when a department admin views another department's field", async () => {
      mockAuth.mockResolvedValue({
        user: { id: ADMIN, role: "admin", assignedDepartment: DEPT_ID },
      } as any);
      mockField.findById.mockReturnValue(lean(fieldLean({ departmentId: DEPT_OTHER })));
      const res = await getField(createMockRequest("http://localhost/api/fields/" + FIELD_ID), {
        params: Promise.resolve({ id: FIELD_ID }),
      });
      expect(res.status).toBe(403);
    });
  });

  describe("PUT /api/fields/:id", () => {
    it("returns 403 for non-admin users", async () => {
      mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "teacher" } } as any);
      const res = await updateField(
        createMockRequest("http://localhost/api/fields/" + FIELD_ID, "PUT", { name: "New" }),
        { params: Promise.resolve({ id: FIELD_ID }) }
      );
      expect(res.status).toBe(403);
    });

    it("returns 404 when the field does not exist", async () => {
      mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
      mockField.findById.mockReturnValue(lean(null));
      const res = await updateField(
        createMockRequest("http://localhost/api/fields/" + FIELD_ID, "PUT", { name: "New" }),
        { params: Promise.resolve({ id: FIELD_ID }) }
      );
      expect(res.status).toBe(404);
    });

    it("returns 409 on a duplicate name or code", async () => {
      mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
      mockField.findById.mockReturnValue(lean(fieldLean()));
      mockField.findOne.mockReturnValue(chainCollation(fieldLean({ _id: FIELD_OTHER })));
      const res = await updateField(
        createMockRequest("http://localhost/api/fields/" + FIELD_ID, "PUT", { name: "Taken" }),
        { params: Promise.resolve({ id: FIELD_ID }) }
      );
      expect(res.status).toBe(409);
    });

    it("returns 404 when moving to a missing department", async () => {
      mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
      mockField.findById.mockReturnValue(lean(fieldLean()));
      mockDepartment.findById.mockReturnValue(lean(null));
      const res = await updateField(
        createMockRequest("http://localhost/api/fields/" + FIELD_ID, "PUT", {
          departmentId: DEPT_OTHER,
        }),
        { params: Promise.resolve({ id: FIELD_ID }) }
      );
      expect(res.status).toBe(404);
    });

    it("updates a field and returns it with its courses", async () => {
      mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
      mockField.findById.mockReturnValue(lean(fieldLean({ name: "Updated" })));
      mockField.findOne.mockReturnValue(chainCollation(null));
      mockField.findByIdAndUpdate.mockReturnValue(lean(fieldLean({ name: "Updated" })));
      mockCourse.find.mockReturnValue(chainSelectLean([courseLean()]));

      const res = await updateField(
        createMockRequest("http://localhost/api/fields/" + FIELD_ID, "PUT", { name: "Updated" }),
        { params: Promise.resolve({ id: FIELD_ID }) }
      );
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.name).toBe("Updated");
      expect(json.data.courseCount).toBe(1);
      expect(mockField.findByIdAndUpdate).toHaveBeenCalledWith(
        FIELD_ID,
        { name: "Updated" },
        { new: true }
      );
    });

    it("returns 403 when a department admin edits another department's field", async () => {
      mockAuth.mockResolvedValue({
        user: { id: ADMIN, role: "admin", assignedDepartment: DEPT_ID },
      } as any);
      mockField.findById.mockReturnValue(lean(fieldLean({ departmentId: DEPT_OTHER })));
      const res = await updateField(
        createMockRequest("http://localhost/api/fields/" + FIELD_ID, "PUT", { name: "New" }),
        { params: Promise.resolve({ id: FIELD_ID }) }
      );
      expect(res.status).toBe(403);
      expect(mockField.findByIdAndUpdate).not.toHaveBeenCalled();
    });
  });

  describe("DELETE /api/fields/:id", () => {
    it("returns 403 for non-admin users", async () => {
      mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "student" } } as any);
      const res = await deleteField(createMockRequest("http://localhost/api/fields/" + FIELD_ID, "DELETE"), {
        params: Promise.resolve({ id: FIELD_ID }),
      });
      expect(res.status).toBe(403);
    });

    it("returns 400 for an invalid id", async () => {
      mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
      const res = await deleteField(createMockRequest("http://localhost/api/fields/nope", "DELETE"), {
        params: Promise.resolve({ id: "nope" }),
      });
      expect(res.status).toBe(400);
    });

    it("returns 404 when the field does not exist", async () => {
      mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
      mockField.findById.mockReturnValue(lean(null));
      const res = await deleteField(createMockRequest("http://localhost/api/fields/" + FIELD_ID, "DELETE"), {
        params: Promise.resolve({ id: FIELD_ID }),
      });
      expect(res.status).toBe(404);
    });

    it("returns 409 when courses still belong to the field", async () => {
      mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
      mockField.findById.mockReturnValue(lean(fieldLean()));
      mockCourse.countDocuments.mockResolvedValue(2);
      const res = await deleteField(createMockRequest("http://localhost/api/fields/" + FIELD_ID, "DELETE"), {
        params: Promise.resolve({ id: FIELD_ID }),
      });
      expect(res.status).toBe(409);
      const json = await res.json();
      expect(json.message).toContain("2 courses");
      expect(mockField.findByIdAndDelete).not.toHaveBeenCalled();
    });

    it("hard-deletes a field with no courses", async () => {
      mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
      mockField.findById.mockReturnValue(lean(fieldLean()));
      mockCourse.countDocuments.mockResolvedValue(0);
      mockField.findByIdAndDelete.mockResolvedValue(fieldLean() as never);

      const res = await deleteField(createMockRequest("http://localhost/api/fields/" + FIELD_ID, "DELETE"), {
        params: Promise.resolve({ id: FIELD_ID }),
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.message).toBe("Field deleted successfully");
      expect(mockField.findByIdAndDelete).toHaveBeenCalledWith(FIELD_ID);
    });

    it("returns 403 when a department admin deletes another department's field", async () => {
      mockAuth.mockResolvedValue({
        user: { id: ADMIN, role: "admin", assignedDepartment: DEPT_ID },
      } as any);
      mockField.findById.mockReturnValue(lean(fieldLean({ departmentId: DEPT_OTHER })));
      const res = await deleteField(createMockRequest("http://localhost/api/fields/" + FIELD_ID, "DELETE"), {
        params: Promise.resolve({ id: FIELD_ID }),
      });
      expect(res.status).toBe(403);
      expect(mockField.findByIdAndDelete).not.toHaveBeenCalled();
    });
  });

  describe("POST /api/fields/:id/enroll", () => {
    const enroll = (studentIds: string[], id = FIELD_ID) =>
      enrollField(
        createMockRequest(`http://localhost/api/fields/${id}/enroll`, "POST", { studentIds }),
        { params: Promise.resolve({ id }) }
      );

    it("returns 403 for non-admin users", async () => {
      mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "teacher" } } as any);
      const res = await enroll([STUDENT_ID]);
      expect(res.status).toBe(403);
    });

    it("returns 400 for an invalid field ID", async () => {
      mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
      const res = await enroll([STUDENT_ID], "nope");
      expect(res.status).toBe(400);
    });

    it("returns 400 for an empty student list", async () => {
      mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
      const res = await enroll([]);
      expect(res.status).toBe(400);
    });

    it("returns 404 when the field does not exist", async () => {
      mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
      mockField.findById.mockReturnValue(lean(null));
      const res = await enroll([STUDENT_ID]);
      expect(res.status).toBe(404);
    });

    it("enrolls students as a department admin in their own department", async () => {
      mockAuth.mockResolvedValue({
        user: { id: ADMIN, role: "admin", assignedDepartment: DEPT_ID },
      } as any);
      mockField.findById.mockReturnValue(
        lean(fieldLean({ departmentId: DEPT_ID, isActive: true }))
      );
      mockStudent.countDocuments.mockResolvedValue(1);
      mockEnrollFieldStudents.mockResolvedValue({
        enrolled: 1,
        alreadyEnrolled: 0,
      } as never);

      const res = await enroll([STUDENT_ID]);
      expect(res.status).toBe(200);
      expect(mockStudent.countDocuments).toHaveBeenCalledWith({
        _id: { $in: [STUDENT_ID] },
        departmentId: DEPT_ID,
      });
      expect(mockEnrollFieldStudents).toHaveBeenCalledWith(FIELD_ID, [STUDENT_ID]);
    });

    it("returns 403 when a department admin enrolls for another department's field", async () => {
      mockAuth.mockResolvedValue({
        user: { id: ADMIN, role: "admin", assignedDepartment: DEPT_ID },
      } as any);
      mockField.findById.mockReturnValue(
        lean(fieldLean({ departmentId: DEPT_OTHER, isActive: true }))
      );
      const res = await enroll([STUDENT_ID]);
      expect(res.status).toBe(403);
      expect(mockEnrollFieldStudents).not.toHaveBeenCalled();
    });

    it("returns 403 when a department admin selects students from another department", async () => {
      mockAuth.mockResolvedValue({
        user: { id: ADMIN, role: "admin", assignedDepartment: DEPT_ID },
      } as any);
      mockField.findById.mockReturnValue(
        lean(fieldLean({ departmentId: DEPT_ID, isActive: true }))
      );
      mockStudent.countDocuments.mockResolvedValue(0);

      const res = await enroll([STUDENT_ID, STUDENT_OTHER]);
      expect(res.status).toBe(403);
      expect(mockEnrollFieldStudents).not.toHaveBeenCalled();
    });
  });
});