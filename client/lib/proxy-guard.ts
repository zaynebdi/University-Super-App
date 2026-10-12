/**
 * Pure routing decisions for the auth proxy (middleware). Kept separate from
 * `proxy.ts` so it can be unit tested without instantiating NextAuth.
 */

export type ProxyDecision =
  | { type: "next" }
  | { type: "api-unauthorized" }
  | { type: "login-redirect"; callbackUrl: string }
  | { type: "home-redirect"; redirectTo: string };

/**
 * The landing page for a role. Every wrong-role fallback must point at the
 * user's *own* home, otherwise the redirects bounce between dashboards
 * forever (e.g. an admin sent to `/faculty/dashboard` is then sent to
 * `/student/dashboard`, which sends them back again).
 */
export function homePathForRole(role?: string | null): string {
  if (role === "student") return "/student/dashboard";
  if (role === "teacher") return "/faculty/dashboard";
  return "/admin";
}

export function getProxyDecision({
  path,
  search = "",
  isLoggedIn,
  role,
}: {
  path: string;
  search?: string;
  isLoggedIn: boolean;
  role?: string | null;
}): ProxyDecision {
  // NextAuth owns its own endpoints.
  if (path.startsWith("/api/auth")) return { type: "next" };

  // A signed-in user should never sit on the login page.
  if (path.startsWith("/login")) {
    if (isLoggedIn) {
      return { type: "home-redirect", redirectTo: homePathForRole(role) };
    }
    return { type: "next" };
  }

  if (!isLoggedIn) {
    if (path.startsWith("/api/")) return { type: "api-unauthorized" };
    return { type: "login-redirect", callbackUrl: `${path}${search}` };
  }

  if (path.startsWith("/student") && role !== "student") {
    return roleMismatchRedirect(path, role);
  }
  if (path.startsWith("/faculty") && role !== "teacher") {
    return roleMismatchRedirect(path, role);
  }
  if (path.startsWith("/admin") && role !== "admin") {
    return roleMismatchRedirect(path, role);
  }

  return { type: "next" };
}

/**
 * Redirect a wrong-role visitor to their own home, unless that home lives in
 * the section they are already in (which would bounce them back here and
 * loop). The unknown-role fallback home is `/admin`, so this guard is what
 * keeps an unrecognised role from ping-ponging on the admin section.
 */
function roleMismatchRedirect(path: string, role?: string | null): ProxyDecision {
  const redirectTo = homePathForRole(role);
  const section = path.split("/")[1];
  if (section && redirectTo.startsWith(`/${section}`)) {
    return { type: "next" };
  }
  return { type: "home-redirect", redirectTo };
}
