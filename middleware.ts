import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth;

  // Protected routes
  const protectedPaths = ["/dashboard", "/tasks", "/calendar", "/analytics", "/settings"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  // Auth routes (should redirect to dashboard if already logged in)
  const authPaths = ["/login", "/signup"];
  const isAuthPage = authPaths.includes(pathname);

  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)).*)",
  ],
};
