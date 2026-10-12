import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth-server", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  default: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/lib/models", () => ({
  Department: { findOne: vi.fn(), create: vi.fn() },
  Field: { findOne: vi.fn(), create: vi.fn() },
  Course: { findOne: vi.fn(), create: vi.fn() },
}));

import { POST as loadDefaultData } from "@/app/api/academic-data/route";
import { auth } from "@/lib/auth-server";
import { Department, Field, Course } from "@/lib/models";
import { buildAcademicSeedData } from "@/scripts/academic-data";

const mockAuth = vi.mocked(auth) as unknown as {
  mockResolvedValue: (value: unknown) => void;
};
const mockDepartment = vi.mocked(Department);
const mockField = vi.mocked(Field);
const mockCourse = vi.mocked(Course);

const ADMIN = "aaaaaaaaaaaaaaaaaaaaaaaa";
const DEPT_ID = "111111111111111111111111";

function request(): Request {
  return new Request("http://localhost/api/academic-data", { method: "POST" });
}

function collationChain(value: unknown) {
  return {
    collation: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue(value) }),
  } as any;
}

function docWithId() {
  return { _id: { toString: () => "abc" } };
}

describe("POST /api/academic-data", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 403 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await loadDefaultData();
    expect(res.status).toBe(403);
  });

  it("returns 403 for non-admin users", async () => {
    mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "teacher" } } as any);
    const res = await loadDefaultData();
    expect(res.status).toBe(403);
  });

  it("returns 403 for a department admin", async () => {
    mockAuth.mockResolvedValue({
      user: { id: ADMIN, role: "admin", assignedDepartment: DEPT_ID },
    } as any);
    const res = await loadDefaultData();
    expect(res.status).toBe(403);
  });

  it("creates all default data when nothing exists", async () => {
    mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
    mockDepartment.findOne.mockReturnValue(collationChain(null));
    mockField.findOne.mockReturnValue(collationChain(null));
    mockCourse.findOne.mockReturnValue(collationChain(null));
    mockDepartment.create.mockResolvedValue(docWithId() as never);
    mockField.create.mockResolvedValue(docWithId() as never);
    mockCourse.create.mockResolvedValue(docWithId() as never);

    const res = await loadDefaultData();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.created.departments).toBe(7);
    expect(json.data.created.fields).toBe(28);
    expect(json.data.created.courses).toBe(140);
    expect(json.data.existed.departments).toBe(0);
    expect(json.data.existed.fields).toBe(0);
    expect(json.data.existed.courses).toBe(0);
    expect(mockDepartment.create).toHaveBeenCalledTimes(7);
    expect(mockField.create).toHaveBeenCalledTimes(28);
    expect(mockCourse.create).toHaveBeenCalledTimes(140);
  });

  it("reports the exact dataset totals", async () => {
    const { summary } = buildAcademicSeedData();
    expect(summary.departmentCount).toBe(7);
    expect(summary.fieldCount).toBe(28);
    expect(summary.courseCount).toBe(140);
  });

  it("is idempotent when everything already exists", async () => {
    mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
    mockDepartment.findOne.mockReturnValue(collationChain(docWithId()));
    mockField.findOne.mockReturnValue(collationChain(docWithId()));
    mockCourse.findOne.mockReturnValue(collationChain(docWithId()));

    const res = await loadDefaultData();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.created.departments).toBe(0);
    expect(json.data.created.fields).toBe(0);
    expect(json.data.created.courses).toBe(0);
    expect(json.data.existed.departments).toBe(7);
    expect(json.data.existed.fields).toBe(28);
    expect(json.data.existed.courses).toBe(140);
    expect(mockDepartment.create).not.toHaveBeenCalled();
    expect(mockField.create).not.toHaveBeenCalled();
    expect(mockCourse.create).not.toHaveBeenCalled();
  });

  it("treats a duplicate-key race as already existing", async () => {
    mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);

    let deptCalls = 0;
    let fieldCalls = 0;
    let courseCalls = 0;
    mockDepartment.findOne.mockImplementation(() =>
      collationChain(++deptCalls === 1 ? null : docWithId())
    );
    mockField.findOne.mockImplementation(() =>
      collationChain(++fieldCalls === 1 ? null : docWithId())
    );
    mockCourse.findOne.mockImplementation(() =>
      collationChain(++courseCalls === 1 ? null : docWithId())
    );
    mockDepartment.create.mockRejectedValue({ code: 11000 });
    mockField.create.mockRejectedValue({ code: 11000 });
    mockCourse.create.mockRejectedValue({ code: 11000 });

    const res = await loadDefaultData();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.created.departments).toBe(0);
    expect(json.data.created.fields).toBe(0);
    expect(json.data.created.courses).toBe(0);
    expect(json.data.existed.departments).toBe(7);
    expect(json.data.existed.fields).toBe(28);
    expect(json.data.existed.courses).toBe(140);
    expect(json.data.total.courses).toBe(140);
  });
});