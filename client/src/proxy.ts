import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;
  const path = nextUrl.pathname;
  const role = req.auth?.user?.role;

  if (path.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // First-time setup: unauthenticated access to /admin/register only; page enforces bootstrap vs admin
  if (path === "/admin/register") {
    if (isLoggedIn && role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    return NextResponse.next();
  }

  const isPublicRoute = path === "/";
  const isAuthRoute = path === "/login";

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(
      new URL(role === "admin" ? "/admin" : "/dashboard", nextUrl)
    );
  }

  if (!isLoggedIn && !isPublicRoute && !isAuthRoute) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  if (path.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  if (path.startsWith("/dashboard") && role === "admin") {
    return NextResponse.redirect(new URL("/admin", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
