import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth-server", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  default: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/lib/models", () => ({
  Student: { findOne: vi.fn() },
  Teacher: { findOne: vi.fn() },
}));

import { GET as getStudentMe } from "@/app/api/students/me/route";
import { GET as getTeacherMe } from "@/app/api/teachers/me/route";
import { GET as getAuthMe } from "@/app/api/auth/me/route";
import { auth } from "@/lib/auth-server";
import { Student, Teacher } from "@/lib/models";

const STUDENT_ID = "aaaaaaaaaaaaaaaaaaaaaaaa";
const USER_ID = "cccccccccccccccccccccccc";

function chainPopulateLean(value: unknown) {
  const lean = vi.fn().mockResolvedValue(value);
  const populate = vi.fn().mockReturnValue({ lean });
  return { populate, lean };
}

describe("Profile me endpoints", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/auth/me", () => {
    it("returns 401 when unauthenticated", async () => {
      (auth as any).mockResolvedValue(null);
      const res = await getAuthMe();
      expect(res.status).toBe(401);
    });

    it("returns the assignedDepartment for a department admin", async () => {
      (auth as any).mockResolvedValue({
        user: {
          id: "ddd111111111111111111111",
          name: "Dept Admin",
          email: "dept@x.com",
          role: "admin",
          assignedDepartment: "333333333333333333333333",
        },
      });
      const res = await getAuthMe();
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.id).toBe("ddd111111111111111111111");
      expect(json.data.role).toBe("admin");
      expect(json.data.assignedDepartment).toBe(
        "333333333333333333333333"
      );
    });

    it("returns a null assignedDepartment when the admin has no scope", async () => {
      (auth as any).mockResolvedValue({
        user: { id: "aaaa", name: "Super", email: "s@x.com", role: "admin" },
      });
      const res = await getAuthMe();
      const json = await res.json();
      expect(json.data.assignedDepartment).toBeNull();
    });
  });

  describe("GET /api/students/me", () => {
    it("returns 401 when unauthenticated", async () => {
      (auth as any).mockResolvedValue(null);
      const res = await getStudentMe();
      expect(res.status).toBe(401);
    });

    it("returns 403 for non-students", async () => {
      (auth as any).mockResolvedValue({ user: { id: USER_ID, role: "teacher" } });
      const res = await getStudentMe();
      expect(res.status).toBe(403);
    });

    it("returns 404 when no student profile exists", async () => {
      (auth as any).mockResolvedValue({ user: { id: USER_ID, role: "student" } });
      const { populate } = chainPopulateLean(null);
      (Student.findOne as any).mockReturnValue({ populate });
      const res = await getStudentMe();
      expect(res.status).toBe(404);
    });

    it("returns the current student's profile", async () => {
      (auth as any).mockResolvedValue({ user: { id: USER_ID, role: "student" } });
      const { populate } = chainPopulateLean({
        _id: STUDENT_ID,
        userId: {
          _id: USER_ID,
          name: "Sara",
          email: "sara@x.com",
          phone: "123",
          photo: null,
        },
        rollNo: "SE-001",
        department: "SE",
        semester: 5,
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date("2026-01-02"),
      });
      (Student.findOne as any).mockReturnValue({ populate });

      const res = await getStudentMe();
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.id).toBe(STUDENT_ID);
      expect(json.data.userId).toBe(USER_ID);
      expect(json.data.name).toBe("Sara");
      expect(json.data.rollNo).toBe("SE-001");
      expect(json.data.semester).toBe(5);
      expect(Student.findOne).toHaveBeenCalledWith({ userId: USER_ID });
    });
  });

  describe("GET /api/teachers/me", () => {
    it("returns 401 when unauthenticated", async () => {
      (auth as any).mockResolvedValue(null);
      const res = await getTeacherMe();
      expect(res.status).toBe(401);
    });

    it("returns 403 for non-teachers", async () => {
      (auth as any).mockResolvedValue({ user: { id: USER_ID, role: "student" } });
      const res = await getTeacherMe();
      expect(res.status).toBe(403);
    });

    it("returns 404 when no teacher profile exists", async () => {
      (auth as any).mockResolvedValue({ user: { id: USER_ID, role: "teacher" } });
      const { populate } = chainPopulateLean(null);
      (Teacher.findOne as any).mockReturnValue({ populate });
      const res = await getTeacherMe();
      expect(res.status).toBe(404);
    });

    it("returns the current teacher's profile", async () => {
      (auth as any).mockResolvedValue({ user: { id: USER_ID, role: "teacher" } });
      const { populate } = chainPopulateLean({
        _id: "eeeeeeeeeeeeeeeeeeeeeeee",
        userId: {
          _id: USER_ID,
          name: "Dr. Ahmed",
          email: "ahmed@x.com",
          phone: "999",
          photo: null,
          isActive: true,
        },
        department: "SE",
        designation: "Professor",
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date("2026-01-02"),
      });
      (Teacher.findOne as any).mockReturnValue({ populate });

      const res = await getTeacherMe();
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.id).toBe("eeeeeeeeeeeeeeeeeeeeeeee");
      expect(json.data.name).toBe("Dr. Ahmed");
      expect(json.data.department).toBe("SE");
      expect(Teacher.findOne).toHaveBeenCalledWith({ userId: USER_ID });
    });
  });
});
