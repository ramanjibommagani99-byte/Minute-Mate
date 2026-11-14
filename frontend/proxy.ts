import { NextRequest, NextResponse } from "next/server";

const sessionCookie = "minutemate_access_token";
const protectedPrefixes = ["/dashboard", "/meetings", "/review"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSessionCookie = request.cookies.has(sessionCookie);
  const requiresSession = protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  if (requiresSession && !hasSessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (hasSessionCookie && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/meetings/:path*", "/review/:path*", "/login", "/register"],
};
