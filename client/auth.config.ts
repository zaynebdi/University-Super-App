import type { NextAuthConfig } from "next-auth";
import { canAccess, homeForRole } from "@/lib/auth/roles";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const { pathname } = nextUrl;
      const isLoggedIn = Boolean(auth?.user);
      const role = auth?.user?.role;

      if (pathname === "/login") {
        if (isLoggedIn && role) {
          return Response.redirect(new URL(homeForRole(role), nextUrl));
        }
        return true;
      }

      const isProtected =
        pathname === "/student" ||
        pathname.startsWith("/student/") ||
        pathname === "/faculty" ||
        pathname.startsWith("/faculty/") ||
        pathname === "/admin" ||
        pathname.startsWith("/admin/") ||
        pathname.startsWith("/api/");

      if (!isProtected) return true;

      if (!isLoggedIn) {
        if (pathname.startsWith("/api/")) {
          return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }
        const signInUrl = new URL("/login", nextUrl);
        signInUrl.searchParams.set("callbackUrl", pathname);
        return Response.redirect(signInUrl);
      }

      if (role && !canAccess(role, pathname)) {
        return Response.redirect(new URL(homeForRole(role), nextUrl));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
