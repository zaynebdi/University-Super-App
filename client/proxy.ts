import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth?.user;
  const nextUrl = req.nextUrl.clone();
  const path = nextUrl.pathname;

  if (path.startsWith("/api/auth")) return;
  if (path.startsWith("/login")) {
    if (isLoggedIn && req.auth?.user) {
      const role = (req.auth.user as { role?: string }).role;
      const redirect = role === "student" ? "/student/dashboard"
        : role === "teacher" ? "/faculty/dashboard"
        : "/admin";
      return Response.redirect(new URL(redirect, nextUrl.origin));
    }
    return;
  }

  if (!isLoggedIn) {
    if (path.startsWith("/api/")) {
      return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    const callback = encodeURIComponent(path + nextUrl.search);
    return Response.redirect(new URL(`/login?callbackUrl=${callback}`, nextUrl.origin));
  }

  if (req.auth?.user) {
    const role = (req.auth.user as { role?: string }).role;
    if (path.startsWith("/student") && role !== "student") {
      return Response.redirect(new URL("/faculty/dashboard", nextUrl.origin));
    }
    if (path.startsWith("/faculty") && role !== "teacher") {
      return Response.redirect(new URL("/student/dashboard", nextUrl.origin));
    }
    if (path.startsWith("/admin") && role !== "admin") {
      return Response.redirect(new URL(role === "student" ? "/student/dashboard" : "/faculty/dashboard", nextUrl.origin));
    }
  }
});

export const config = {
  matcher: [
    "/student/:path*",
    "/faculty/:path*",
    "/admin/:path*",
    "/api/:path*",
  ],
};