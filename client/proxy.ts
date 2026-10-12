import { auth } from "@/auth";
import { getProxyDecision } from "@/lib/proxy-guard";

export default auth((req) => {
  const nextUrl = req.nextUrl.clone();
  const decision = getProxyDecision({
    path: nextUrl.pathname,
    search: nextUrl.search,
    isLoggedIn: !!req.auth?.user,
    role: (req.auth?.user as { role?: string } | undefined)?.role,
  });

  if (decision.type === "next") return;

  if (decision.type === "api-unauthorized") {
    return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (decision.type === "login-redirect") {
    const callback = encodeURIComponent(decision.callbackUrl);
    return Response.redirect(new URL(`/login?callbackUrl=${callback}`, nextUrl.origin));
  }

  return Response.redirect(new URL(decision.redirectTo, nextUrl.origin));
});

export const config = {
  matcher: [
    "/login",
    "/student/:path*",
    "/faculty/:path*",
    "/admin/:path*",
    "/api/:path*",
  ],
};
