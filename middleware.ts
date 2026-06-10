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

  const sessionToken = request.cookies.get("session")?.value;

  const user = sessionToken ? await verifySession(sessionToken) : null;
  const isAuthenticated = !!user;

  // Protect routes
  if (protectedPrefixes.some((p) => pathname.startsWith(p))) {
    if (!isAuthenticated) {
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    const role = user?.role;

    const isAdmin = role === "ADMINISTRATOR";
    const isRegistrar = role === "REGISTRY_OFFICER";
    const isInstitution = role === "INSTITUTION_OFFICER";

    if (pathname.startsWith("/registrar") && !isRegistrar) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (pathname.startsWith("/dashboard") && !isAdmin) {
      if (isRegistrar) {
        return NextResponse.redirect(new URL("/registrar", request.url));
      }
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (
      (pathname.startsWith("/bank") ||
        pathname.startsWith("/insurance") ||
        pathname.startsWith("/ssnit")) &&
      !(isInstitution || isAdmin)
    ) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Prevent logged-in users from going back to login
  if (authRoutes.some((r) => pathname.startsWith(r))) {
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