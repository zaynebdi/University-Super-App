import { describe, it, expect } from "vitest";
import { resolveLoginRedirect } from "@/lib/auth-redirect";

describe("resolveLoginRedirect", () => {
  it("redirects by role when no callbackUrl is provided", () => {
    expect(resolveLoginRedirect("student", undefined)).toBe("/student/dashboard");
    expect(resolveLoginRedirect("teacher", null)).toBe("/faculty/dashboard");
    expect(resolveLoginRedirect("admin")).toBe("/admin");
  });

  it("honors a safe callbackUrl the role is allowed to access", () => {
    expect(resolveLoginRedirect("student", "/student/dashboard")).toBe("/student/dashboard");
    expect(resolveLoginRedirect("teacher", "/faculty/announcements")).toBe("/faculty/announcements");
    expect(resolveLoginRedirect("admin", "/admin/users")).toBe("/admin/users");
  });

  it("ignores full URLs and protocol-relative URLs (open redirect protection)", () => {
    expect(resolveLoginRedirect("admin", "https://evil.com")).toBe("/admin");
    expect(resolveLoginRedirect("admin", "http://evil.com/cb")).toBe("/admin");
    expect(resolveLoginRedirect("admin", "//evil.com")).toBe("/admin");
    expect(resolveLoginRedirect("admin", "///evil.com")).toBe("/admin");
  });

  it("ignores backslash and whitespace-prefixed values", () => {
    expect(resolveLoginRedirect("admin", "/\\evil.com")).toBe("/admin");
    expect(resolveLoginRedirect("admin", " /admin")).toBe("/admin");
    expect(resolveLoginRedirect("admin", "/admin\n")).toBe("/admin");
  });

  it("ignores a bare slash and empty values", () => {
    expect(resolveLoginRedirect("admin", "/")).toBe("/admin");
    expect(resolveLoginRedirect("admin", "")).toBe("/admin");
  });

  it("ignores callbackUrl for a section the role cannot access", () => {
    expect(resolveLoginRedirect("teacher", "/admin/users")).toBe("/faculty/dashboard");
    expect(resolveLoginRedirect("student", "/faculty/dashboard")).toBe("/student/dashboard");
    expect(resolveLoginRedirect("student", "/admin")).toBe("/student/dashboard");
  });

  it("ignores paths outside the role sections (e.g. /login or random paths)", () => {
    expect(resolveLoginRedirect("student", "/login")).toBe("/student/dashboard");
    expect(resolveLoginRedirect("admin", "/random-page")).toBe("/admin");
  });

  it("falls back to /admin for an unknown role, mirroring auth.ts", () => {
    expect(resolveLoginRedirect(undefined, undefined)).toBe("/admin");
    expect(resolveLoginRedirect(undefined, "//evil.com")).toBe("/admin");
  });
});