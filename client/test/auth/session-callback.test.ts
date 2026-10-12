import { describe, it, expect } from "vitest";
import { authConfig } from "@/auth.config";

/**
 * These tests pin the shape of the effective NextAuth callbacks used by the
 * app. The `session` callback in auth.config.ts is the ONE that runs at
 * runtime (auth.ts deliberately does NOT override it — overriding it used to
 * drop `assignedDepartment`, silently turning every department admin into a
 * super admin).
 */

// authConfig.callbacks is a plain object of functions; invoke them directly.
const cbs = authConfig.callbacks as unknown as {
  jwt: (params: {
    token: Record<string, unknown>;
    user?: { id: string; role: string; assignedDepartment?: string | null };
  }) => Record<string, unknown>;
  session: (params: {
    session: { user: Record<string, unknown>; expires: string };
    token: Record<string, unknown>;
  }) => { user: Record<string, unknown>; expires: string };
};

function emptySession() {
  return { user: {}, expires: new Date().toISOString() };
}

describe("auth callbacks (session scope)", () => {
  it("jwt copies id, role and assignedDepartment from the user", async () => {
    const token = await cbs.jwt({
      token: {},
      user: { id: "u1", role: "admin", assignedDepartment: "d1" },
    });
    expect(token).toMatchObject({
      id: "u1",
      role: "admin",
      assignedDepartment: "d1",
    });
  });

  it("jwt stores null assignedDepartment when the user has none", async () => {
    const token = await cbs.jwt({
      token: {},
      user: { id: "u2", role: "admin", assignedDepartment: null },
    });
    expect(token.assignedDepartment).toBeNull();
  });

  it("session copies assignedDepartment into the session user", async () => {
    const session = await cbs.session({
      session: emptySession(),
      token: { id: "u1", role: "admin", assignedDepartment: "d1" },
    });
    expect(session.user).toMatchObject({
      id: "u1",
      role: "admin",
      assignedDepartment: "d1",
    });
  });

  it("session sets assignedDepartment to null when the token has none", async () => {
    const session = await cbs.session({
      session: emptySession(),
      token: { id: "u1", role: "admin" },
    });
    expect(session.user.assignedDepartment).toBeNull();
  });

  it("preserves id and role through the jwt -> session round trip", async () => {
    const token = await cbs.jwt({
      token: {},
      user: { id: "t9", role: "teacher", assignedDepartment: null },
    });
    const session = await cbs.session({ session: emptySession(), token });
    expect(session.user.id).toBe("t9");
    expect(session.user.role).toBe("teacher");
    expect(session.user.assignedDepartment).toBeNull();
  });
});