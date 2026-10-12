import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    // NOTE: the `session` callback comes from auth.config.ts. It copies
    // `id`, `role` AND `assignedDepartment` from the JWT into session.user.
    // Overriding it here would silently drop the department scope, turning
    // every department admin into a super admin at runtime (tests that mock
    // sessions directly do not catch this). Keep `authorized` (auth.config
    // has no `authorized` callback, so spreading it in is safe).
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLogin = nextUrl.pathname.startsWith("/login");
      const isOnAuthApi = nextUrl.pathname.startsWith("/api/auth");
      const isPublicAsset = /\.(ico|png|jpg|jpeg|svg|css|js|woff2?)$/.test(nextUrl.pathname);

      if (isOnAuthApi || isPublicAsset) return true;

      if (isOnLogin) {
        if (isLoggedIn) {
          const role = (auth.user as { role?: string }).role;
          const redirect = role === "student" ? "/student/dashboard"
            : role === "teacher" ? "/faculty/dashboard"
            : "/admin";
          return Response.redirect(new URL(redirect, nextUrl.origin));
        }
        return true;
      }

      if (!isLoggedIn) return false;

      const role = (auth.user as { role?: string }).role;
      const path = nextUrl.pathname;

      if (path.startsWith("/student") && role !== "student") return false;
      if (path.startsWith("/faculty") && role !== "teacher") return false;
      if (path.startsWith("/admin") && role !== "admin") return false;

      return true;
    },
  },
});