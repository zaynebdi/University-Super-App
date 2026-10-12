import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock modules before importing the routes
vi.mock("@/lib/auth-server", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  default: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/lib/models", () => ({
  User: {
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findOne: vi.fn(),
    find: vi.fn(),
    countDocuments: vi.fn(),
    create: vi.fn(),
  },
  Student: {
    findById: vi.fn(),
    findOne: vi.fn(),
    find: vi.fn(),
    create: vi.fn(),
  },
  Teacher: {
    findById: vi.fn(),
    findOne: vi.fn(),
    find: vi.fn(),
    create: vi.fn(),
  },
  Enrollment: {
    find: vi.fn(),
  },
  Course: {},
}));

vi.mock("mongoose", () => {
  const mockSchema = vi.fn().mockImplementation(() => ({
    pre: vi.fn(),
    methods: {},
    index: vi.fn(),
  }));
  return {
    default: {
      connect: vi.fn().mockResolvedValue({}),
      models: {},
      model: vi.fn((name, schema) => ({ name, schema })),
      Schema: mockSchema,
      Types: {
        ObjectId: {
          isValid: vi.fn((id: string) => /^[0-9a-fA-F]{24}$/.test(id)),
        },
      },
    },
    Schema: mockSchema,
    Types: {
      ObjectId: {
        isValid: vi.fn((id: string) => /^[0-9a-fA-F]{24}$/.test(id)),
      },
    },
  };
});

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed"),
    compare: vi.fn().mockResolvedValue(true),
  },
  hash: vi.fn().mockResolvedValue("hashed"),
  compare: vi.fn().mockResolvedValue(true),
}));

// Now import the routes
import { GET as getUsers } from "@/app/api/users/route";
import { GET as getUser, PUT as updateUser, DELETE as deleteUser } from "@/app/api/users/[id]/route";
import { GET as getStudent } from "@/app/api/students/[id]/route";
import { GET as getStudentCourses } from "@/app/api/students/[id]/courses/route";
import { GET as getTeachers } from "@/app/api/teachers/route";
import { GET as getTeacher } from "@/app/api/teachers/[id]/route";
import { auth } from "@/lib/auth-server";
import dbConnect from "@/lib/db";
import { User, Student, Teacher, Enrollment } from "@/lib/models";
const mockAuth = vi.mocked(auth) as unknown as {
  mockResolvedValue: (value: unknown) => void;
};
const mockDb = vi.mocked(dbConnect);
const mockUser = vi.mocked(User);
const mockStudent = vi.mocked(Student);
const mockTeacher = vi.mocked(Teacher);
const mockEnrollment = vi.mocked(Enrollment);

function createMockRequest(url: string, method = "GET", body?: unknown): Request {
  return new Request(url, { method, body: body ? JSON.stringify(body) : undefined });
}

// All valid 24-char hex ObjectIds
const VALID_ID = "123456789012345678901234";
const VALID_ID_3 = "123456789012345678901236";
const DEPT_ID = "123456789012345678901235";
const DEPT_OTHER = "123456789012345678901237";
const USER_SELF = "aaaaaaaaaaaaaaaaaaaaaaaa";
const USER_OTHER = "bbbbbbbbbbbbbbbbbbbbbbbb";
const STUDENT_SELF = "cccccccccccccccccccccccc";
const STUDENT_OTHER = "dddddddddddddddddddddddd";
const TEACHER_SELF = "eeeeeeeeeeeeeeeeeeeeeeee";
const TEACHER_OTHER = "ffffffffffffffffffffffff";

// Chain that supports .select("-password").lean() (users [id] routes).
function userChain(value: unknown) {
  return {
    select: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue(value) }),
  } as any;
}

// Chain that supports both .select(...).lean() and .lean() (users list route).
function profileListChain(value: unknown) {
  return {
    select: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue(value) }),
    lean: vi.fn().mockResolvedValue(value),
  } as any;
}

// Chain that supports .sort().skip().limit().select("-password").lean().
function userListChain(value: unknown) {
  return {
    sort: vi.fn().mockReturnThis(),
    skip: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue(value) }),
  } as any;
}

// Student.findOne().select("departmentId").lean() shaped return.
function profileChain(departmentId: string | null) {
  return {
    select: vi.fn().mockReturnValue({
      lean: vi.fn().mockResolvedValue(departmentId ? { departmentId } : null),
    }),
  } as any;
}

describe("Users API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUser.countDocuments.mockResolvedValue(0);
    mockStudent.find.mockReturnValue(profileListChain([]) as never);
    mockTeacher.find.mockReturnValue(profileListChain([]) as never);
  });

  describe("GET /api/users", () => {
    it("returns 403 for non-admin users", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "student" } } as any);
      const req = createMockRequest("http://localhost/api/users");
      const res = await getUsers(req);
      expect(res.status).toBe(403);
    });

    it("returns 200 with user list for admin", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } } as any);
      mockUser.countDocuments.mockResolvedValue(1);
      mockUser.find.mockReturnValue(
        userListChain([
          { _id: VALID_ID, name: "Admin User", email: "admin@test.com", role: "admin", phone: "123", photo: null, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        ])
      );

      const req = createMockRequest("http://localhost/api/users");
      const res = await getUsers(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.users.length).toBe(1);
      expect(data.data.total).toBe(1);
      expect(data.data.totalPages).toBe(1);
    });

    it("filters by role when provided", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } } as any);
      mockUser.find.mockReturnValue(userListChain([]));

      const req = createMockRequest("http://localhost/api/users?role=student");
      await getUsers(req);
      expect(mockUser.find).toHaveBeenCalledWith({ role: "student" });
    });

    it("paginates the user list", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } } as any);
      mockUser.countDocuments.mockResolvedValue(12);
      mockUser.find.mockReturnValue(userListChain([]));

      const req = createMockRequest("http://localhost/api/users?page=2&pageSize=5");
      const res = await getUsers(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.data.page).toBe(2);
      expect(data.data.pageSize).toBe(5);
      expect(data.data.total).toBe(12);
      expect(data.data.totalPages).toBe(3);
    });

    it("filters users by department", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } } as any);
      mockUser.find.mockReturnValue(userListChain([]));

      const req = createMockRequest("http://localhost/api/users?department=" + DEPT_ID);
      const res = await getUsers(req);
      expect(res.status).toBe(200);
      expect(mockStudent.find).toHaveBeenCalledWith({ departmentId: DEPT_ID });
      expect(mockTeacher.find).toHaveBeenCalledWith({ departmentId: DEPT_ID });
    });

    it("searches by roll number and finds matching students", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } } as any);
      mockStudent.find.mockReturnValue(profileListChain([{ userId: VALID_ID }]));
      mockUser.find.mockReturnValue(
        userListChain([
          { _id: VALID_ID, name: "Student", email: "s@test.com", role: "student", isActive: true, createdAt: new Date(), updatedAt: new Date() },
        ])
      );
      mockUser.countDocuments.mockResolvedValue(1);

      const req = createMockRequest("http://localhost/api/users?search=CS-2026-001");
      const res = await getUsers(req);
      expect(res.status).toBe(200);
      expect(mockStudent.find).toHaveBeenCalledWith({
        rollNo: { $regex: "CS-2026-001", $options: "i" },
      });
    });

    it("returns 403 when a department admin requests the admin role", async () => {
      mockAuth.mockResolvedValue({
        user: { id: USER_SELF, role: "admin", assignedDepartment: DEPT_ID },
      } as any);
      const req = createMockRequest("http://localhost/api/users?role=admin");
      const res = await getUsers(req);
      expect(res.status).toBe(403);
    });

    it("restricts a department admin to their own department users", async () => {
      mockAuth.mockResolvedValue({
        user: { id: USER_SELF, role: "admin", assignedDepartment: DEPT_ID },
      } as any);
      mockUser.find.mockReturnValue(userListChain([]));

      const req = createMockRequest("http://localhost/api/users");
      const res = await getUsers(req);
      expect(res.status).toBe(200);
      expect(mockUser.find).toHaveBeenCalledWith(
        expect.objectContaining({ role: { $in: ["student", "teacher"] } })
      );
      expect(mockStudent.find).toHaveBeenCalledWith({ departmentId: DEPT_ID });
      expect(mockTeacher.find).toHaveBeenCalledWith({ departmentId: DEPT_ID });
    });

    it("returns 403 when a department admin filters another department", async () => {
      mockAuth.mockResolvedValue({
        user: { id: USER_SELF, role: "admin", assignedDepartment: DEPT_ID },
      } as any);
      const req = createMockRequest("http://localhost/api/users?department=" + DEPT_OTHER);
      const res = await getUsers(req);
      expect(res.status).toBe(403);
    });

    it("returns 403 when not authenticated", async () => {
      mockAuth.mockResolvedValue(null);
      const req = createMockRequest("http://localhost/api/users");
      const res = await getUsers(req);
      expect(res.status).toBe(403);
    });

    it("returns 400 for invalid role query", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } } as any);
      const req = createMockRequest("http://localhost/api/users?role=invalid");
      const res = await getUsers(req);
      expect(res.status).toBe(400);
    });

    it("returns 500 on database error", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } } as any);
      mockDb.mockRejectedValueOnce(new Error("db down"));
      const req = createMockRequest("http://localhost/api/users");
      const res = await getUsers(req);
      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.success).toBe(false);
    });
  });

  describe("GET /api/users/:id", () => {
    it("returns 401 when not authenticated", async () => {
      mockAuth.mockResolvedValue(null);
      const req = createMockRequest("http://localhost/api/users/" + VALID_ID);
      const res = await getUser(req, { params: Promise.resolve({ id: VALID_ID }) });
      expect(res.status).toBe(401);
    });

    it("returns 400 for invalid ID", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "student" } } as any);
      const req = createMockRequest("http://localhost/api/users/invalid");
      const res = await getUser(req, { params: Promise.resolve({ id: "invalid" }) });
      expect(res.status).toBe(400);
    });

    it("returns 403 when accessing another user's profile", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "student" } } as any);
      const req = createMockRequest("http://localhost/api/users/" + USER_OTHER);
      const res = await getUser(req, { params: Promise.resolve({ id: USER_OTHER }) });
      expect(res.status).toBe(403);
    });

    it("returns user profile for self", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "student" } } as any);
      mockUser.findById.mockReturnValue({
        select: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue({
            _id: USER_SELF, name: "Test User", email: "test@test.com", role: "student", phone: "123", photo: null, isActive: true, createdAt: new Date(), updatedAt: new Date(),
          }),
        }),
      } as any);

      const req = createMockRequest("http://localhost/api/users/" + USER_SELF);
      const res = await getUser(req, { params: Promise.resolve({ id: USER_SELF }) });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.id).toBe(USER_SELF);
    });

    it("returns user profile for admin", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } } as any);
      mockUser.findById.mockReturnValue({
        select: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue({
            _id: USER_OTHER, name: "Other User", email: "other@test.com", role: "student", phone: "123", photo: null, isActive: true, createdAt: new Date(), updatedAt: new Date(),
          }),
        }),
      } as any);

      const req = createMockRequest("http://localhost/api/users/" + USER_OTHER);
      const res = await getUser(req, { params: Promise.resolve({ id: USER_OTHER }) });
      expect(res.status).toBe(200);
    });

    it("returns 200 when a department admin views a user of their own department", async () => {
      mockAuth.mockResolvedValue({
        user: { id: USER_SELF, role: "admin", assignedDepartment: DEPT_ID },
      } as any);
      mockUser.findById.mockReturnValue(
        userChain({
          _id: USER_OTHER, name: "Student", email: "s@test.com", role: "student", phone: "123", photo: null, isActive: true, createdAt: new Date(), updatedAt: new Date(),
        })
      );
      mockStudent.findOne.mockReturnValue(profileChain(DEPT_ID));
      mockTeacher.findOne.mockReturnValue(profileChain(null));

      const req = createMockRequest("http://localhost/api/users/" + USER_OTHER);
      const res = await getUser(req, { params: Promise.resolve({ id: USER_OTHER }) });
      expect(res.status).toBe(200);
    });

    it("returns 403 when a department admin views a user of another department", async () => {
      mockAuth.mockResolvedValue({
        user: { id: USER_SELF, role: "admin", assignedDepartment: DEPT_ID },
      } as any);
      mockUser.findById.mockReturnValue(
        userChain({
          _id: USER_OTHER, name: "Student", email: "s@test.com", role: "student", phone: "123", photo: null, isActive: true, createdAt: new Date(), updatedAt: new Date(),
        })
      );
      mockStudent.findOne.mockReturnValue(profileChain(DEPT_OTHER));
      mockTeacher.findOne.mockReturnValue(profileChain(null));

      const req = createMockRequest("http://localhost/api/users/" + USER_OTHER);
      const res = await getUser(req, { params: Promise.resolve({ id: USER_OTHER }) });
      expect(res.status).toBe(403);
    });

    it("returns 403 when a department admin views an admin account", async () => {
      mockAuth.mockResolvedValue({
        user: { id: USER_SELF, role: "admin", assignedDepartment: DEPT_ID },
      } as any);
      mockUser.findById.mockReturnValue(
        userChain({
          _id: USER_OTHER, name: "Admin", email: "a@test.com", role: "admin", phone: "123", photo: null, isActive: true, createdAt: new Date(), updatedAt: new Date(),
        })
      );

      const req = createMockRequest("http://localhost/api/users/" + USER_OTHER);
      const res = await getUser(req, { params: Promise.resolve({ id: USER_OTHER }) });
      expect(res.status).toBe(403);
    });

    it("returns 404 when user not found", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } } as any);
      mockUser.findById.mockReturnValue({
        select: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue(null),
        }),
      } as any);

      const req = createMockRequest("http://localhost/api/users/" + VALID_ID_3);
      const res = await getUser(req, { params: Promise.resolve({ id: VALID_ID_3 }) });
      expect(res.status).toBe(404);
    });

    it("returns 500 on database error", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "student" } } as any);
      mockDb.mockRejectedValueOnce(new Error("db down"));
      const req = createMockRequest("http://localhost/api/users/" + USER_SELF);
      const res = await getUser(req, { params: Promise.resolve({ id: USER_SELF }) });
      expect(res.status).toBe(500);
    });
  });

  describe("PUT /api/users/:id", () => {
    it("returns 401 when not authenticated", async () => {
      mockAuth.mockResolvedValue(null);
      const req = createMockRequest("http://localhost/api/users/" + USER_SELF, "PUT", { phone: "123" });
      const res = await updateUser(req, { params: Promise.resolve({ id: USER_SELF }) });
      expect(res.status).toBe(401);
    });

    it("returns 400 for invalid ID", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "student" } } as any);
      const req = createMockRequest("http://localhost/api/users/invalid", "PUT", { phone: "123" });
      const res = await updateUser(req, { params: Promise.resolve({ id: "invalid" }) });
      expect(res.status).toBe(400);
    });

    it("allows self to update phone and photo", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "student" } } as any);
      mockUser.findById.mockReturnValue(
        userChain({
          _id: USER_SELF, name: "Test", email: "test@test.com", role: "student", phone: "123", photo: "https://example.com/photo.jpg", isActive: true, createdAt: new Date(), updatedAt: new Date(),
        })
      );
      mockUser.findByIdAndUpdate.mockReturnValue(
        userChain({
          _id: USER_SELF, name: "Test", email: "test@test.com", role: "student", phone: "123", photo: "https://example.com/photo.jpg", isActive: true, createdAt: new Date(), updatedAt: new Date(),
        })
      );

      const req = createMockRequest("http://localhost/api/users/" + USER_SELF, "PUT", { phone: "123", photo: "https://example.com/photo.jpg" });
      const res = await updateUser(req, { params: Promise.resolve({ id: USER_SELF }) });
      expect(res.status).toBe(200);
    });

    it("rejects self updating email or role", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "student" } } as any);
      const req = createMockRequest("http://localhost/api/users/" + USER_SELF, "PUT", { email: "new@test.com", role: "admin" });
      const res = await updateUser(req, { params: Promise.resolve({ id: USER_SELF }) });
      expect(res.status).toBe(400);
    });

    it("rejects self updating email only", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "student" } } as any);
      const req = createMockRequest("http://localhost/api/users/" + USER_SELF, "PUT", { email: "new@test.com" });
      const res = await updateUser(req, { params: Promise.resolve({ id: USER_SELF }) });
      expect(res.status).toBe(400);
      expect(mockUser.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it("rejects self updating role only", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "student" } } as any);
      const req = createMockRequest("http://localhost/api/users/" + USER_SELF, "PUT", { role: "admin" });
      const res = await updateUser(req, { params: Promise.resolve({ id: USER_SELF }) });
      expect(res.status).toBe(400);
      expect(mockUser.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it("allows self to update phone only and strips no extra fields", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "student" } } as any);
      mockUser.findById.mockReturnValue(
        userChain({
          _id: USER_SELF, name: "Test", email: "test@test.com", role: "student", phone: "123", photo: null, isActive: true, createdAt: new Date(), updatedAt: new Date(),
        })
      );
      mockUser.findByIdAndUpdate.mockReturnValue(
        userChain({
          _id: USER_SELF, name: "Test", email: "test@test.com", role: "student", phone: "555", photo: null, isActive: true, createdAt: new Date(), updatedAt: new Date(),
        })
      );

      const req = createMockRequest("http://localhost/api/users/" + USER_SELF, "PUT", { phone: "555" });
      const res = await updateUser(req, { params: Promise.resolve({ id: USER_SELF }) });
      expect(res.status).toBe(200);
      expect(mockUser.findByIdAndUpdate).toHaveBeenCalledWith(
        USER_SELF,
        { phone: "555" },
        { new: true }
      );
    });

    it("allows admin to update all fields", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } } as any);
      mockUser.findById.mockReturnValue(
        userChain({
          _id: USER_OTHER, name: "Other", email: "other@test.com", role: "teacher", phone: "456", photo: null, isActive: true, createdAt: new Date(), updatedAt: new Date(),
        })
      );
      mockUser.findOne.mockResolvedValue(null);
      mockUser.findByIdAndUpdate.mockReturnValue(
        userChain({
          _id: USER_OTHER, name: "Updated", email: "new@test.com", role: "teacher", phone: "456", photo: null, isActive: true, createdAt: new Date(), updatedAt: new Date(),
        })
      );

      const req = createMockRequest("http://localhost/api/users/" + USER_OTHER, "PUT", { email: "new@test.com", role: "teacher" });
      const res = await updateUser(req, { params: Promise.resolve({ id: USER_OTHER }) });
      expect(res.status).toBe(200);
    });

    it("forbids updating another user's profile", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "student" } } as any);
      const req = createMockRequest("http://localhost/api/users/" + USER_OTHER, "PUT", { phone: "123" });
      const res = await updateUser(req, { params: Promise.resolve({ id: USER_OTHER }) });
      expect(res.status).toBe(403);
    });

    it("returns 404 when the target user does not exist", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "student" } } as any);
      mockUser.findById.mockReturnValue(userChain(null));

      const req = createMockRequest("http://localhost/api/users/" + USER_SELF, "PUT", { phone: "123" });
      const res = await updateUser(req, { params: Promise.resolve({ id: USER_SELF }) });
      expect(res.status).toBe(404);
    });

    it("returns 409 when admin sets an email already in use", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } } as any);
      mockUser.findById.mockReturnValue(
        userChain({
          _id: USER_OTHER, name: "Other", email: "other@test.com", role: "student", isActive: true, createdAt: new Date(), updatedAt: new Date(),
        })
      );
      mockUser.findOne.mockResolvedValueOnce({ _id: "someone-else" });

      const req = createMockRequest("http://localhost/api/users/" + USER_OTHER, "PUT", { email: "taken@test.com" });
      const res = await updateUser(req, { params: Promise.resolve({ id: USER_OTHER }) });
      expect(res.status).toBe(409);
    });

    it("returns 400 when an admin tries to deactivate their own account", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } } as any);
      mockUser.findById.mockReturnValue(
        userChain({
          _id: USER_SELF, name: "Admin", email: "admin@test.com", role: "admin", isActive: true, createdAt: new Date(), updatedAt: new Date(),
        })
      );

      const req = createMockRequest("http://localhost/api/users/" + USER_SELF, "PUT", { isActive: false });
      const res = await updateUser(req, { params: Promise.resolve({ id: USER_SELF }) });
      expect(res.status).toBe(400);
      expect(mockUser.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it("returns 400 when an admin tries to change their own role", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } } as any);
      mockUser.findById.mockReturnValue(
        userChain({
          _id: USER_SELF, name: "Admin", email: "admin@test.com", role: "admin", isActive: true, createdAt: new Date(), updatedAt: new Date(),
        })
      );

      const req = createMockRequest("http://localhost/api/users/" + USER_SELF, "PUT", { role: "student" });
      const res = await updateUser(req, { params: Promise.resolve({ id: USER_SELF }) });
      expect(res.status).toBe(400);
    });

    it("returns 409 when deactivating the last active super admin", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } } as any);
      mockUser.findById.mockReturnValue(
        userChain({
          _id: USER_OTHER, name: "Other Admin", email: "other@test.com", role: "admin", isActive: true, createdAt: new Date(), updatedAt: new Date(),
        })
      );
      mockUser.countDocuments.mockResolvedValue(1);

      const req = createMockRequest("http://localhost/api/users/" + USER_OTHER, "PUT", { isActive: false });
      const res = await updateUser(req, { params: Promise.resolve({ id: USER_OTHER }) });
      expect(res.status).toBe(409);
      expect(mockUser.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it("returns 409 when demoting the last active super admin", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } } as any);
      mockUser.findById.mockReturnValue(
        userChain({
          _id: USER_OTHER, name: "Other Admin", email: "other@test.com", role: "admin", isActive: true, createdAt: new Date(), updatedAt: new Date(),
        })
      );
      mockUser.countDocuments.mockResolvedValue(1);

      const req = createMockRequest("http://localhost/api/users/" + USER_OTHER, "PUT", { role: "student" });
      const res = await updateUser(req, { params: Promise.resolve({ id: USER_OTHER }) });
      expect(res.status).toBe(409);
    });

    it("allows a department admin to edit a user of their own department", async () => {
      mockAuth.mockResolvedValue({
        user: { id: USER_SELF, role: "admin", assignedDepartment: DEPT_ID },
      } as any);
      mockUser.findById.mockReturnValue(
        userChain({
          _id: USER_OTHER, name: "Student", email: "s@test.com", role: "student", phone: "123", isActive: true, createdAt: new Date(), updatedAt: new Date(),
        })
      );
      mockStudent.findOne.mockReturnValue(profileChain(DEPT_ID));
      mockTeacher.findOne.mockReturnValue(profileChain(null));
      mockUser.findByIdAndUpdate.mockReturnValue(
        userChain({
          _id: USER_OTHER, name: "Student", email: "s@test.com", role: "student", phone: "789", isActive: true, createdAt: new Date(), updatedAt: new Date(),
        })
      );

      const req = createMockRequest("http://localhost/api/users/" + USER_OTHER, "PUT", { phone: "789" });
      const res = await updateUser(req, { params: Promise.resolve({ id: USER_OTHER }) });
      expect(res.status).toBe(200);
    });

    it("returns 403 when a department admin edits a student of another department", async () => {
      mockAuth.mockResolvedValue({
        user: { id: USER_SELF, role: "admin", assignedDepartment: DEPT_ID },
      } as any);
      mockUser.findById.mockReturnValue(
        userChain({
          _id: USER_OTHER, name: "Student", email: "s@test.com", role: "student", isActive: true, createdAt: new Date(), updatedAt: new Date(),
        })
      );
      mockStudent.findOne.mockReturnValue(profileChain(DEPT_OTHER));
      mockTeacher.findOne.mockReturnValue(profileChain(null));

      const req = createMockRequest("http://localhost/api/users/" + USER_OTHER, "PUT", { phone: "789" });
      const res = await updateUser(req, { params: Promise.resolve({ id: USER_OTHER }) });
      expect(res.status).toBe(403);
      expect(mockUser.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it("returns 403 when a department admin edits an admin account", async () => {
      mockAuth.mockResolvedValue({
        user: { id: USER_SELF, role: "admin", assignedDepartment: DEPT_ID },
      } as any);
      mockUser.findById.mockReturnValue(
        userChain({
          _id: USER_OTHER, name: "Admin", email: "a@test.com", role: "admin", isActive: true, createdAt: new Date(), updatedAt: new Date(),
        })
      );

      const req = createMockRequest("http://localhost/api/users/" + USER_OTHER, "PUT", { phone: "789" });
      const res = await updateUser(req, { params: Promise.resolve({ id: USER_OTHER }) });
      expect(res.status).toBe(403);
    });

    it("returns 400 when a department admin tries to change a role", async () => {
      mockAuth.mockResolvedValue({
        user: { id: USER_SELF, role: "admin", assignedDepartment: DEPT_ID },
      } as any);
      mockUser.findById.mockReturnValue(
        userChain({
          _id: USER_OTHER, name: "Student", email: "s@test.com", role: "student", isActive: true, createdAt: new Date(), updatedAt: new Date(),
        })
      );
      mockStudent.findOne.mockReturnValue(profileChain(DEPT_ID));
      mockTeacher.findOne.mockReturnValue(profileChain(null));

      const req = createMockRequest("http://localhost/api/users/" + USER_OTHER, "PUT", { role: "admin" });
      const res = await updateUser(req, { params: Promise.resolve({ id: USER_OTHER }) });
      expect(res.status).toBe(400);
    });

    it("returns 500 on database error", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "student" } } as any);
      mockDb.mockRejectedValueOnce(new Error("db down"));

      const req = createMockRequest("http://localhost/api/users/" + USER_SELF, "PUT", { phone: "123" });
      const res = await updateUser(req, { params: Promise.resolve({ id: USER_SELF }) });
      expect(res.status).toBe(500);
    });
  });

  describe("DELETE /api/users/:id", () => {
    it("returns 403 for non-admin", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "student" } } as any);
      const req = createMockRequest("http://localhost/api/users/" + USER_OTHER, "DELETE");
      const res = await deleteUser(req, { params: Promise.resolve({ id: USER_OTHER }) });
      expect(res.status).toBe(403);
    });

    it("returns 400 when an admin deactivates their own account", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } } as any);
      const req = createMockRequest("http://localhost/api/users/" + USER_SELF, "DELETE");
      const res = await deleteUser(req, { params: Promise.resolve({ id: USER_SELF }) });
      expect(res.status).toBe(400);
      expect(mockUser.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it("soft deletes user for admin", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } } as any);
      mockUser.findById.mockReturnValue(
        userChain({
          _id: USER_OTHER, name: "User", email: "user@test.com", role: "student", isActive: true, createdAt: new Date(), updatedAt: new Date(),
        })
      );
      mockUser.findByIdAndUpdate.mockResolvedValue({} as never);

      const req = createMockRequest("http://localhost/api/users/" + USER_OTHER, "DELETE");
      const res = await deleteUser(req, { params: Promise.resolve({ id: USER_OTHER }) });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.message).toBe("User deactivated successfully");
      expect(mockUser.findByIdAndUpdate).toHaveBeenCalledWith(USER_OTHER, { isActive: false });
    });

    it("returns 400 for invalid ID", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } } as any);
      const req = createMockRequest("http://localhost/api/users/invalid", "DELETE");
      const res = await deleteUser(req, { params: Promise.resolve({ id: "invalid" }) });
      expect(res.status).toBe(400);
    });

    it("returns 404 when user not found", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } } as any);
      mockUser.findById.mockReturnValue(userChain(null));

      const req = createMockRequest("http://localhost/api/users/" + USER_OTHER, "DELETE");
      const res = await deleteUser(req, { params: Promise.resolve({ id: USER_OTHER }) });
      expect(res.status).toBe(404);
    });

    it("returns 409 when deleting the last active super admin", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } } as any);
      mockUser.findById.mockReturnValue(
        userChain({
          _id: USER_OTHER, name: "Other Admin", email: "other@test.com", role: "admin", isActive: true, createdAt: new Date(), updatedAt: new Date(),
        })
      );
      mockUser.countDocuments.mockResolvedValue(1);

      const req = createMockRequest("http://localhost/api/users/" + USER_OTHER, "DELETE");
      const res = await deleteUser(req, { params: Promise.resolve({ id: USER_OTHER }) });
      expect(res.status).toBe(409);
      expect(mockUser.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it("returns 403 when a department admin deactivates an admin account", async () => {
      mockAuth.mockResolvedValue({
        user: { id: USER_SELF, role: "admin", assignedDepartment: DEPT_ID },
      } as any);
      mockUser.findById.mockReturnValue(
        userChain({
          _id: USER_OTHER, name: "Admin", email: "a@test.com", role: "admin", isActive: true, createdAt: new Date(), updatedAt: new Date(),
        })
      );

      const req = createMockRequest("http://localhost/api/users/" + USER_OTHER, "DELETE");
      const res = await deleteUser(req, { params: Promise.resolve({ id: USER_OTHER }) });
      expect(res.status).toBe(403);
      expect(mockUser.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it("returns 403 when a department admin deactivates another department's user", async () => {
      mockAuth.mockResolvedValue({
        user: { id: USER_SELF, role: "admin", assignedDepartment: DEPT_ID },
      } as any);
      mockUser.findById.mockReturnValue(
        userChain({
          _id: USER_OTHER, name: "Student", email: "s@test.com", role: "student", isActive: true, createdAt: new Date(), updatedAt: new Date(),
        })
      );
      mockStudent.findOne.mockReturnValue(profileChain(DEPT_OTHER));
      mockTeacher.findOne.mockReturnValue(profileChain(null));

      const req = createMockRequest("http://localhost/api/users/" + USER_OTHER, "DELETE");
      const res = await deleteUser(req, { params: Promise.resolve({ id: USER_OTHER }) });
      expect(res.status).toBe(403);
      expect(mockUser.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it("returns 500 on database error", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } } as any);
      mockDb.mockRejectedValueOnce(new Error("db down"));

      const req = createMockRequest("http://localhost/api/users/" + USER_OTHER, "DELETE");
      const res = await deleteUser(req, { params: Promise.resolve({ id: USER_OTHER }) });
      expect(res.status).toBe(500);
    });
  });
});

describe("Students API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/students/:id", () => {
    it("returns 401 when not authenticated", async () => {
      mockAuth.mockResolvedValue(null);
      const req = createMockRequest("http://localhost/api/students/" + STUDENT_SELF);
      const res = await getStudent(req, { params: Promise.resolve({ id: STUDENT_SELF }) });
      expect(res.status).toBe(401);
    });

    it("returns 400 for invalid ID", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "student" } } as any);
      const req = createMockRequest("http://localhost/api/students/not-an-id");
      const res = await getStudent(req, { params: Promise.resolve({ id: "not-an-id" }) });
      expect(res.status).toBe(400);
    });

    it("returns 404 when session user not found", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "student" } } as any);
      mockUser.findById.mockReturnValue({
        lean: vi.fn().mockResolvedValue(null),
      } as any);

      const req = createMockRequest("http://localhost/api/students/" + STUDENT_SELF);
      const res = await getStudent(req, { params: Promise.resolve({ id: STUDENT_SELF }) });
      expect(res.status).toBe(404);
    });

    it("returns student profile for self", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "student" } } as any);
      mockUser.findById.mockReturnValue({
        lean: vi.fn().mockResolvedValue({ _id: USER_SELF, name: "Student", email: "student@test.com" }),
      } as any);
      mockStudent.findOne.mockReturnValue({
        populate: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue({
            _id: STUDENT_SELF, userId: { _id: USER_SELF, name: "Student", email: "student@test.com", phone: "123", photo: null }, rollNo: "123", department: "CS", semester: 3,
          }),
        }),
      } as any);

      const req = createMockRequest("http://localhost/api/students/" + STUDENT_SELF);
      const res = await getStudent(req, { params: Promise.resolve({ id: STUDENT_SELF }) });
      expect(res.status).toBe(200);
    });

    it("forbids access to other student's profile", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "student" } } as any);
      mockUser.findById.mockReturnValue({
        lean: vi.fn().mockResolvedValue({ _id: USER_SELF }),
      } as any);
      mockStudent.findOne.mockReturnValue({
        populate: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue({ _id: STUDENT_SELF }),
        }),
      } as any);

      const req = createMockRequest("http://localhost/api/students/" + STUDENT_OTHER);
      const res = await getStudent(req, { params: Promise.resolve({ id: STUDENT_OTHER }) });
      expect(res.status).toBe(403);
    });

    it("returns student profile for admin", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } } as any);
      mockStudent.findById.mockReturnValue({
        populate: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue({
            _id: STUDENT_OTHER, userId: { _id: USER_OTHER, name: "Student", email: "student@test.com", phone: "123", photo: null }, rollNo: "123", department: "CS", semester: 3,
          }),
        }),
      } as any);

      const req = createMockRequest("http://localhost/api/students/" + STUDENT_OTHER);
      const res = await getStudent(req, { params: Promise.resolve({ id: STUDENT_OTHER }) });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.data.id).toBe(STUDENT_OTHER);
    });

    it("returns 404 when student not found for admin", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } } as any);
      mockStudent.findById.mockReturnValue({
        populate: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue(null),
        }),
      } as any);

      const req = createMockRequest("http://localhost/api/students/" + STUDENT_OTHER);
      const res = await getStudent(req, { params: Promise.resolve({ id: STUDENT_OTHER }) });
      expect(res.status).toBe(404);
    });

    it("returns 500 on database error", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "student" } } as any);
      mockDb.mockRejectedValueOnce(new Error("db down"));
      const req = createMockRequest("http://localhost/api/students/" + STUDENT_SELF);
      const res = await getStudent(req, { params: Promise.resolve({ id: STUDENT_SELF }) });
      expect(res.status).toBe(500);
    });
  });

  describe("GET /api/students/:id/courses", () => {
    it("returns 401 when not authenticated", async () => {
      mockAuth.mockResolvedValue(null);
      const req = createMockRequest("http://localhost/api/students/" + STUDENT_SELF + "/courses");
      const res = await getStudentCourses(req, { params: Promise.resolve({ id: STUDENT_SELF }) });
      expect(res.status).toBe(401);
    });

    it("returns 400 for invalid ID", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "student" } } as any);
      const req = createMockRequest("http://localhost/api/students/not-an-id/courses");
      const res = await getStudentCourses(req, { params: Promise.resolve({ id: "not-an-id" }) });
      expect(res.status).toBe(400);
    });

    it("forbids another student from viewing courses", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "student" } } as any);
      mockUser.findById.mockReturnValue({
        lean: vi.fn().mockResolvedValue({ _id: USER_SELF }),
      } as any);
      mockStudent.findOne.mockReturnValue({
        lean: vi.fn().mockResolvedValue({ _id: STUDENT_SELF }),
      } as any);

      const req = createMockRequest("http://localhost/api/students/" + STUDENT_OTHER + "/courses");
      const res = await getStudentCourses(req, { params: Promise.resolve({ id: STUDENT_OTHER }) });
      expect(res.status).toBe(403);
    });

    it("returns enrolled courses for student", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "student" } } as any);
      mockUser.findById.mockReturnValue({
        lean: vi.fn().mockResolvedValue({ _id: USER_SELF }),
      } as any);
      mockStudent.findOne.mockReturnValue({
        lean: vi.fn().mockResolvedValue({ _id: STUDENT_SELF }),
      } as any);
      mockEnrollment.find.mockReturnValue({
        populate: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([
            {
              courseId: {
                _id: VALID_ID, code: "CS101", title: "Intro to CS", semester: 1, creditHours: 3,
                teacherId: { _id: TEACHER_SELF, userId: { name: "Prof", email: "prof@test.com" }, department: "CS", designation: "Professor" },
              },
              enrolledAt: new Date(),
            },
          ]),
        }),
      } as any);

      const req = createMockRequest("http://localhost/api/students/" + STUDENT_SELF + "/courses");
      const res = await getStudentCourses(req, { params: Promise.resolve({ id: STUDENT_SELF }) });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.length).toBe(1);
    });

    it("returns 404 when student not found for admin", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } } as any);
      mockStudent.findById.mockReturnValue({
        lean: vi.fn().mockResolvedValue(null),
      } as any);

      const req = createMockRequest("http://localhost/api/students/" + STUDENT_OTHER + "/courses");
      const res = await getStudentCourses(req, { params: Promise.resolve({ id: STUDENT_OTHER }) });
      expect(res.status).toBe(404);
    });

    it("lets a department admin view courses of a student in their own department", async () => {
      mockAuth.mockResolvedValue({
        user: { id: USER_SELF, role: "admin", assignedDepartment: DEPT_ID },
      } as any);
      mockStudent.findById.mockReturnValue({
        lean: vi.fn().mockResolvedValue({ _id: STUDENT_OTHER, departmentId: DEPT_ID }),
      } as any);
      mockEnrollment.find.mockReturnValue({
        populate: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([]),
        }),
      } as any);

      const req = createMockRequest("http://localhost/api/students/" + STUDENT_OTHER + "/courses");
      const res = await getStudentCourses(req, { params: Promise.resolve({ id: STUDENT_OTHER }) });
      expect(res.status).toBe(200);
    });

    it("returns 403 when a department admin views courses of another department's student", async () => {
      mockAuth.mockResolvedValue({
        user: { id: USER_SELF, role: "admin", assignedDepartment: DEPT_ID },
      } as any);
      mockStudent.findById.mockReturnValue({
        lean: vi.fn().mockResolvedValue({ _id: STUDENT_OTHER, departmentId: DEPT_OTHER }),
      } as any);

      const req = createMockRequest("http://localhost/api/students/" + STUDENT_OTHER + "/courses");
      const res = await getStudentCourses(req, { params: Promise.resolve({ id: STUDENT_OTHER }) });
      expect(res.status).toBe(403);
      expect(mockEnrollment.find).not.toHaveBeenCalled();
    });

    it("returns 500 on database error", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "student" } } as any);
      mockDb.mockRejectedValueOnce(new Error("db down"));

      const req = createMockRequest("http://localhost/api/students/" + STUDENT_SELF + "/courses");
      const res = await getStudentCourses(req, { params: Promise.resolve({ id: STUDENT_SELF }) });
      expect(res.status).toBe(500);
    });
  });
});

describe("Teachers API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/teachers", () => {
    it("returns 403 for non-admin", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "teacher" } } as any);
      const res = await getTeachers();
      expect(res.status).toBe(403);
    });

    it("returns 403 when not authenticated", async () => {
      mockAuth.mockResolvedValue(null);
      const res = await getTeachers();
      expect(res.status).toBe(403);
    });

    it("returns teachers list for admin", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } } as any);
      mockTeacher.find.mockReturnValue({
        populate: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([
            { _id: TEACHER_SELF, userId: { _id: USER_SELF, name: "Teacher", email: "teacher@test.com", phone: "123", photo: null, isActive: true }, department: "CS", designation: "Prof" },
          ]),
        }),
      } as any);

      const res = await getTeachers();
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.length).toBe(1);
    });

    it("returns 500 on database error", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } } as any);
      mockDb.mockRejectedValueOnce(new Error("db down"));
      const res = await getTeachers();
      expect(res.status).toBe(500);
    });
  });

  describe("GET /api/teachers/:id", () => {
    it("returns 401 when not authenticated", async () => {
      mockAuth.mockResolvedValue(null);
      const req = createMockRequest("http://localhost/api/teachers/" + TEACHER_SELF);
      const res = await getTeacher(req, { params: Promise.resolve({ id: TEACHER_SELF }) });
      expect(res.status).toBe(401);
    });

    it("returns 400 for invalid ID", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "teacher" } } as any);
      const req = createMockRequest("http://localhost/api/teachers/not-an-id");
      const res = await getTeacher(req, { params: Promise.resolve({ id: "not-an-id" }) });
      expect(res.status).toBe(400);
    });

    it("returns 404 when session user not found", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "teacher" } } as any);
      mockUser.findById.mockReturnValue({
        lean: vi.fn().mockResolvedValue(null),
      } as any);

      const req = createMockRequest("http://localhost/api/teachers/" + TEACHER_SELF);
      const res = await getTeacher(req, { params: Promise.resolve({ id: TEACHER_SELF }) });
      expect(res.status).toBe(404);
    });

    it("returns teacher profile for self", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "teacher" } } as any);
      mockUser.findById.mockReturnValue({
        lean: vi.fn().mockResolvedValue({ _id: USER_SELF }),
      } as any);
      mockTeacher.findOne.mockReturnValue({
        populate: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue({
            _id: TEACHER_SELF, userId: { _id: USER_SELF, name: "Teacher", email: "teacher@test.com", phone: "123", photo: null, isActive: true }, department: "CS", designation: "Prof",
          }),
        }),
      } as any);

      const req = createMockRequest("http://localhost/api/teachers/" + TEACHER_SELF);
      const res = await getTeacher(req, { params: Promise.resolve({ id: TEACHER_SELF }) });
      expect(res.status).toBe(200);
    });

    it("forbids teacher accessing another teacher's profile", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "teacher" } } as any);
      mockUser.findById.mockReturnValue({
        lean: vi.fn().mockResolvedValue({ _id: USER_SELF }),
      } as any);
      mockTeacher.findOne.mockReturnValue({
        populate: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue({ _id: TEACHER_SELF }),
        }),
      } as any);

      const req = createMockRequest("http://localhost/api/teachers/" + TEACHER_OTHER);
      const res = await getTeacher(req, { params: Promise.resolve({ id: TEACHER_OTHER }) });
      expect(res.status).toBe(403);
    });

    it("returns teacher profile for admin", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } } as any);
      mockTeacher.findById.mockReturnValue({
        populate: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue({
            _id: TEACHER_OTHER, userId: { _id: USER_OTHER, name: "Teacher", email: "teacher@test.com", phone: "123", photo: null, isActive: true }, department: "CS", designation: "Prof",
          }),
        }),
      } as any);

      const req = createMockRequest("http://localhost/api/teachers/" + TEACHER_OTHER);
      const res = await getTeacher(req, { params: Promise.resolve({ id: TEACHER_OTHER }) });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.data.id).toBe(TEACHER_OTHER);
    });

    it("returns 404 when teacher not found for admin", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "admin" } } as any);
      mockTeacher.findById.mockReturnValue({
        populate: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue(null),
        }),
      } as any);

      const req = createMockRequest("http://localhost/api/teachers/" + TEACHER_OTHER);
      const res = await getTeacher(req, { params: Promise.resolve({ id: TEACHER_OTHER }) });
      expect(res.status).toBe(404);
    });

    it("returns 500 on database error", async () => {
      mockAuth.mockResolvedValue({ user: { id: USER_SELF, role: "teacher" } } as any);
      mockDb.mockRejectedValueOnce(new Error("db down"));
      const req = createMockRequest("http://localhost/api/teachers/" + TEACHER_SELF);
      const res = await getTeacher(req, { params: Promise.resolve({ id: TEACHER_SELF }) });
      expect(res.status).toBe(500);
    });
  });
});
