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

// bcryptjs is intentionally NOT mocked: the real implementation is used so the
// stored password must genuinely verify against the plaintext, the same way the
// login flow does (auth.config.ts authorize -> bcrypt.compare).

import bcrypt from "bcryptjs";
import { POST as register } from "@/app/api/auth/register/route";
import { auth } from "@/lib/auth-server";
import { User, Department } from "@/lib/models";

const mockAuth = vi.mocked(auth) as unknown as {
  mockResolvedValue: (value: unknown) => void;
};
const mockUser = vi.mocked(User);
const mockDepartment = vi.mocked(Department);
const mockCreate = mockUser.create as unknown as ReturnType<typeof vi.fn>;

const ADMIN = "aaaaaaaaaaaaaaaaaaaaaaaa";
const DEPARTMENT_ID = "dddddddddddddddddddddddd";

function adminRequest(body: unknown): Request {
  return new Request("http://localhost/api/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("register -> login password integrity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("stores a password that verifies with the same password at login", async () => {
    mockAuth.mockResolvedValue({ user: { id: ADMIN, role: "admin" } } as any);
    mockUser.findOne.mockResolvedValue(null);
    mockDepartment.findById.mockReturnValue({
      lean: vi.fn().mockResolvedValue({
        _id: DEPARTMENT_ID,
        name: "Computer Science",
        code: "CS",
        isActive: true,
      }),
    } as any);

    const plaintext = "Sup3rSecret!";
    const body = {
      name: "Teacher One",
      email: "teachero@example.com",
      password: plaintext,
      role: "teacher",
      departmentId: DEPARTMENT_ID,
      designation: "Lecturer",
    };

    let createdArgs: { password?: string } | undefined;
    mockCreate.mockImplementation(
      (args: { name: string; email: string; password: string; role: string }) => {
        createdArgs = args;
        return Promise.resolve({
          _id: { toString: () => ADMIN },
          name: args.name,
          email: args.email,
          role: args.role,
        });
      }
    );

    const res = await register(adminRequest(body));
    expect(res.status).toBe(201);
    expect(mockUser.create).toHaveBeenCalledTimes(1);

    const stored = createdArgs?.password;
    expect(stored).toBeDefined();
    expect(stored).not.toBe(plaintext);

    // Stored as a single 12-round bcrypt hash...
    expect(bcrypt.getRounds(stored!)).toBe(12);

    // ...which is exactly what the login flow compares against.
    expect(await bcrypt.compare(plaintext, stored!)).toBe(true);
  });
});