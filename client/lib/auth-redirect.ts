export type UserRole = "student" | "teacher" | "admin";

const ROLE_HOME: Record<UserRole, string> = {
  student: "/student/dashboard",
  teacher: "/faculty/dashboard",
  admin: "/admin",
};

/**
 * A safe callback URL is a relative path beginning with exactly one "/".
 * Full URLs ("https://..."), protocol-relative URLs ("//evil.com") and
 * backslash values ("/\evil.com") are rejected to prevent open redirects.
 * Values with whitespace (e.g. " /admin", "/admin\n") are rejected too.
 */
const SAFE_RELATIVE_PATH = /^\/(?![/\\])\S+$/;

function roleAllowedForPath(role: UserRole, path: string): boolean {
  if (path.startsWith("/student")) return role === "student";
  if (path.startsWith("/faculty")) return role === "teacher";
  if (path.startsWith("/admin")) return role === "admin";
  return false;
}

/**
 * Decide where a freshly authenticated user should be sent. The callbackUrl
 * is only honored when it is a safe relative path the user's role is allowed
 * to access; otherwise the role's dashboard is returned. Mirrors the
 * authorized-callback fallback in auth.ts for unknown roles ("/admin").
 */
export function resolveLoginRedirect(
  role: UserRole | undefined,
  callbackUrl?: string | null
): string {
  const resolved = role ?? "admin";
  const home = ROLE_HOME[resolved];

  if (!callbackUrl) return home;
  if (!SAFE_RELATIVE_PATH.test(callbackUrl)) return home;
  return roleAllowedForPath(resolved, callbackUrl) ? callbackUrl : home;
}