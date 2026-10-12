import { describe, it, expect } from "vitest";

import { getProxyDecision, homePathForRole } from "@/lib/proxy-guard";

describe("proxy guard", () => {
  describe("homePathForRole", () => {
    it("maps each role to its own home", () => {
      expect(homePathForRole("student")).toBe("/student/dashboard");
      expect(homePathForRole("teacher")).toBe("/faculty/dashboard");
      expect(homePathForRole("admin")).toBe("/admin");
    });

    it("falls back to the admin home for an unknown role", () => {
      expect(homePathForRole(undefined)).toBe("/admin");
      expect(homePathForRole(null)).toBe("/admin");
    });
  });

  describe("getProxyDecision", () => {
    it("lets NextAuth endpoints through", () => {
      expect(
        getProxyDecision({ path: "/api/auth/session", isLoggedIn: false })
      ).toEqual({ type: "next" });
      expect(
        getProxyDecision({ path: "/api/auth/signin", isLoggedIn: true, role: "student" })
      ).toEqual({ type: "next" });
    });

    it("keeps a signed-out visitor on the login page", () => {
      expect(
        getProxyDecision({ path: "/login", isLoggedIn: false })
      ).toEqual({ type: "next" });
    });

    it("sends a signed-in user from the login page to their own home", () => {
      expect(
        getProxyDecision({ path: "/login", isLoggedIn: true, role: "student" })
      ).toEqual({ type: "home-redirect", redirectTo: "/student/dashboard" });
      expect(
        getProxyDecision({ path: "/login", isLoggedIn: true, role: "teacher" })
      ).toEqual({ type: "home-redirect", redirectTo: "/faculty/dashboard" });
      expect(
        getProxyDecision({ path: "/login", isLoggedIn: true, role: "admin" })
      ).toEqual({ type: "home-redirect", redirectTo: "/admin" });
    });

    it("returns 401 for unauthenticated API requests", () => {
      expect(
        getProxyDecision({ path: "/api/courses", isLoggedIn: false })
      ).toEqual({ type: "api-unauthorized" });
    });

    it("redirects unauthenticated page requests to login with a callback", () => {
      expect(
        getProxyDecision({
          path: "/student/dashboard",
          search: "?tab=grades",
          isLoggedIn: false,
        })
      ).toEqual({
        type: "login-redirect",
        callbackUrl: "/student/dashboard?tab=grades",
      });
    });

    it("allows a role onto its own section", () => {
      expect(
        getProxyDecision({ path: "/student/courses", isLoggedIn: true, role: "student" })
      ).toEqual({ type: "next" });
      expect(
        getProxyDecision({ path: "/faculty/grades", isLoggedIn: true, role: "teacher" })
      ).toEqual({ type: "next" });
      expect(
        getProxyDecision({ path: "/admin/users", isLoggedIn: true, role: "admin" })
      ).toEqual({ type: "next" });
    });

    it("sends an admin to the admin home instead of looping through other dashboards", () => {
      expect(
        getProxyDecision({ path: "/student/dashboard", isLoggedIn: true, role: "admin" })
      ).toEqual({ type: "home-redirect", redirectTo: "/admin" });
      expect(
        getProxyDecision({ path: "/faculty/dashboard", isLoggedIn: true, role: "admin" })
      ).toEqual({ type: "home-redirect", redirectTo: "/admin" });
    });

    it("sends a student and a teacher to their own homes", () => {
      expect(
        getProxyDecision({ path: "/faculty/grades", isLoggedIn: true, role: "student" })
      ).toEqual({ type: "home-redirect", redirectTo: "/student/dashboard" });
      expect(
        getProxyDecision({ path: "/admin/users", isLoggedIn: true, role: "teacher" })
      ).toEqual({ type: "home-redirect", redirectTo: "/faculty/dashboard" });
      expect(
        getProxyDecision({ path: "/student/courses", isLoggedIn: true, role: "teacher" })
      ).toEqual({ type: "home-redirect", redirectTo: "/faculty/dashboard" });
    });

    it("does not redirect for unrelated paths", () => {
      expect(
        getProxyDecision({ path: "/about", isLoggedIn: true, role: "student" })
      ).toEqual({ type: "next" });
    });

    it("never loops an unrecognised role back into the same section", () => {
      expect(
        getProxyDecision({ path: "/admin/users", isLoggedIn: true, role: undefined })
      ).toEqual({ type: "next" });
    });
  });
});
