import { describe, it, expect, vi, beforeEach } from "vitest";

// Hoisted so the vi.mock factories below can reference them.
const mocks = vi.hoisted(() => {
  class RedirectSignal extends Error {
    constructor(public url: string) {
      super(`redirect(${url})`);
    }
  }
  return {
    RedirectSignal,
    redirect: vi.fn((url: string) => {
      throw new RedirectSignal(url);
    }),
    signIn: vi.fn(),
    auth: vi.fn(),
  };
});

vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/auth", () => ({ signIn: mocks.signIn, auth: mocks.auth }));
vi.mock("next-auth", () => ({
  AuthError: class MockAuthError extends Error {
    type: string;
    constructor(type: string) {
      super(type);
      this.type = type;
    }
  },
}));

import { login } from "@/app/login/actions";

function formDataWith(entries: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(entries)) fd.append(key, value);
  return fd;
}

function expectRedirectsTo(target: string) {
  return expect(login({}, formDataWith({ email: "u@test.com", password: "password123" }))).rejects.toMatchObject({
    url: target,
  });
}

describe("login server action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects a student to /student/dashboard on success", async () => {
    mocks.signIn.mockResolvedValue(undefined);
    mocks.auth.mockResolvedValue({ user: { id: "1", role: "student" } });
    await expectRedirectsTo("/student/dashboard");
    expect(mocks.redirect).toHaveBeenCalledWith("/student/dashboard");
  });

  it("redirects a teacher to /faculty/dashboard on success", async () => {
    mocks.signIn.mockResolvedValue(undefined);
    mocks.auth.mockResolvedValue({ user: { id: "1", role: "teacher" } });
    await expectRedirectsTo("/faculty/dashboard");
  });

  it("redirects an admin to /admin on success", async () => {
    mocks.signIn.mockResolvedValue(undefined);
    mocks.auth.mockResolvedValue({ user: { id: "1", role: "admin" } });
    await expectRedirectsTo("/admin");
  });

  it("uses a safe callbackUrl the role is allowed to access", async () => {
    mocks.signIn.mockResolvedValue(undefined);
    mocks.auth.mockResolvedValue({ user: { id: "1", role: "teacher" } });
    const fd = formDataWith({
      email: "u@test.com",
      password: "password123",
      callbackUrl: "/faculty/announcements",
    });
    await expect(login({}, fd)).rejects.toMatchObject({ url: "/faculty/announcements" });
    expect(mocks.redirect).toHaveBeenCalledWith("/faculty/announcements");
  });

  it("ignores an unsafe callbackUrl and uses the role dashboard", async () => {
    mocks.signIn.mockResolvedValue(undefined);
    mocks.auth.mockResolvedValue({ user: { id: "1", role: "admin" } });

    for (const bad of [
      "https://evil.com",
      "http://evil.com/cb",
      "//evil.com",
      "/\\evil.com",
      "/student/dashboard",
      "/login",
    ]) {
      const fd = formDataWith({ email: "u@test.com", password: "password123", callbackUrl: bad });
      await expect(login({}, fd)).rejects.toMatchObject({ url: "/admin" });
    }
    expect(mocks.redirect).toHaveBeenCalledTimes(6);
  });

  it("returns an invalid-credentials error without redirecting", async () => {
    const { AuthError } = await import("next-auth");
    mocks.signIn.mockRejectedValue(new AuthError("CredentialsSignin"));

    const result = await login({}, formDataWith({ email: "u@test.com", password: "password123" }));
    expect(result).toEqual({ success: false, error: "Invalid email or password" });
    expect(mocks.redirect).not.toHaveBeenCalled();
    expect(mocks.auth).not.toHaveBeenCalled();
  });

  it("returns a generic error for other auth errors without redirecting", async () => {
    const { AuthError } = await import("next-auth");
    mocks.signIn.mockRejectedValue(new AuthError("CallbackRouteError"));

    const result = await login({}, formDataWith({ email: "u@test.com", password: "password123" }));
    expect(result).toEqual({ success: false, error: "Something went wrong" });
    expect(mocks.redirect).not.toHaveBeenCalled();
  });
});