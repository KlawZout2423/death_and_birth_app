import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "./src/lib/session";

const authRoutes = ["/login"];

const protectedPrefixes = [
  "/dashboard",
  "/registrar",
  "/bank",
  "/insurance",
  "/ssnit",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get session token from cookie
  const sessionToken = request.cookies.get("session")?.value;
  const user = sessionToken ? verifySession(sessionToken) : null;

  // Check if user is authenticated
  const isAuthenticated = !!user;

  // If trying to access protected routes without auth, redirect to login
  if (protectedPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role-based gates for top-level areas
    const role = user?.role;
    const isAdmin = role === "ADMINISTRATOR";
    const isRegistrar = role === "REGISTRY_OFFICER";
    const isInstitutionOfficer = role === "INSTITUTION_OFFICER";

    if (pathname.startsWith("/registrar") && !isRegistrar) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (pathname.startsWith("/dashboard") && !isAdmin) {
      if (isRegistrar) return NextResponse.redirect(new URL("/registrar", request.url));
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (pathname.startsWith("/bank") && !(isInstitutionOfficer || isAdmin)) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (pathname.startsWith("/insurance") && !(isInstitutionOfficer || isAdmin)) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (pathname.startsWith("/ssnit") && !(isInstitutionOfficer || isAdmin)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // If already authenticated and trying to access auth routes, redirect to home
  if (authRoutes.some(route => pathname.startsWith(route))) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/registrar/:path*",
    "/bank/:path*",
    "/insurance/:path*",
    "/ssnit/:path*",
    "/login",
  ],
};

