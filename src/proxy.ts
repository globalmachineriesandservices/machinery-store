import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session?.user;
  const isAdmin = session?.user?.role === "ADMIN";

  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isAuthRoute = nextUrl.pathname.startsWith("/auth");
  const isProfileRoute = nextUrl.pathname.startsWith("/profile");

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL(isAdmin ? "/admin" : "/", nextUrl));
  }

  // Protect admin routes
  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(
        new URL(`/auth/login?callbackUrl=${encodeURIComponent(nextUrl.pathname)}`, nextUrl)
      );
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/unauthorized", nextUrl));
    }
  }

  // Protect profile routes
  if (isProfileRoute && !isLoggedIn) {
    return NextResponse.redirect(
      new URL(`/auth/login?callbackUrl=${encodeURIComponent(nextUrl.pathname)}`, nextUrl)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/auth/:path*",
    "/profile/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
