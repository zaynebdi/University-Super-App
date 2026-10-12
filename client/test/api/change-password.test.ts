import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth-server", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  default: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/lib/models", () => ({
  User: {
    findById: vi.fn(),
  },
}));

vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn().mockResolvedValue("new-hash"),
  },
  compare: vi.fn(),
  hash: vi.fn().mockResolvedValue("new-hash"),
}));

import { POST as changePassword } from "@/app/api/auth/change-password/route";
import { auth } from "@/lib/auth-server";
import { User } from "@/lib/models";
import bcrypt from "bcryptjs";

const mockAuth = vi.mocked(auth) as unknown as {
  mockResolvedValue: (value: unknown) => void;
};
const mockUser = vi.mocked(User);
const mockCompare = bcrypt.compare as unknown as ReturnType<typeof vi.fn>;
const mockHash = bcrypt.hash as unknown as ReturnType<typeof vi.fn>;

const USER_ID = "aaaaaaaaaaaaaaaaaaaaaaaa";

function req(body: unknown) {
  return new Request("http://localhost/api/auth/change-password", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

const validBody = { currentPassword: "oldpassword", newPassword: "newpassword1" };

describe("POST /api/auth/change-password", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHash.mockResolvedValue("new-hash");
  });

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await changePassword(req(validBody));
    expect(res.status).toBe(401);
  });

  it("returns 400 for invalid input", async () => {
    mockAuth.mockResolvedValue({ user: { id: USER_ID } });
    const res = await changePassword(
      req({ currentPassword: "x", newPassword: "short" })
    );
    expect(res.status).toBe(400);
    expect(mockUser.findById).not.toHaveBeenCalled();
  });

  it("returns 404 when the user is not found", async () => {
    mockAuth.mockResolvedValue({ user: { id: USER_ID } });
    mockUser.findById.mockReturnValue({
      select: vi.fn().mockResolvedValue(null),
    } as never);
    const res = await changePassword(req(validBody));
    expect(res.status).toBe(404);
  });

  it("returns 403 when the current password is wrong", async () => {
    mockAuth.mockResolvedValue({ user: { id: USER_ID } });
    mockUser.findById.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        _id: USER_ID,
        password: "hashed",
        save: vi.fn(),
      }),
    } as never);
    mockCompare.mockResolvedValue(false);

    const res = await changePassword(req(validBody));
    expect(res.status).toBe(403);
  });

  it("returns 200, hashes and saves the new password on success", async () => {
    mockAuth.mockResolvedValue({ user: { id: USER_ID } });
    const user = {
      _id: USER_ID,
      password: "hashed",
      save: vi.fn().mockResolvedValue(undefined),
    };
    mockUser.findById.mockReturnValue({
      select: vi.fn().mockResolvedValue(user),
    } as never);
    mockCompare.mockResolvedValue(true);

    const res = await changePassword(req(validBody));
    expect(res.status).toBe(200);
    expect(user.password).toBe("new-hash");
    expect(user.save).toHaveBeenCalled();
  });
});
