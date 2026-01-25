import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = [
  "/",
  "/home",
  "/login",
  "/activities",
  "/register",
  "/nosotros",
  "/ubicacion",
  "/testimonios",
  "/auth/callback",
];

const protectedRoutes = [
  "/dashboard",
  "/mis-pagos",
  "/mis-reservas",
  "/contexts",
];

const adminRoutes = [
  "/admin-dashboard",
  "/activitiesDashboard",
  "/users",
  "/turns",
];

const superAdminRoutes = ["/create-superadmin", "/adminCreationForm"];

const isTokenValid = (token: string | undefined): boolean => {
  if (!token) return false;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());

    if (payload.exp) {
      const expirationTime = payload.exp * 1000;
      if (Date.now() > expirationTime) {
        return false;
      }
    }

    return true;
  } catch (error) {
    return false;
  }
};

const getUserRole = (userCookie: any): string => {
  try {
    if (!userCookie) return "";
    const user = JSON.parse(decodeURIComponent(userCookie.value));
    return (user.rol || user.role || "").toLowerCase();
  } catch (e) {
    return "";
  }
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("providence_token")?.value;
  const userCookie = request.cookies.get("providence_user");
  const userRole = getUserRole(userCookie);
  const isTokenPresent = !!token;
  const isTokenValidFlag = isTokenValid(token);
  const isPublicRoute = publicRoutes.some((route) => {
    return pathname === route || pathname.startsWith(route + "/");
  });

  if (isPublicRoute) {
    if (
      (pathname === "/login" || pathname === "/register") &&
      isTokenValidFlag
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  if (isProtectedRoute) {
    if (!isTokenPresent || !isTokenValidFlag) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  const isAdminRoute = adminRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  if (isAdminRoute) {
    if (!isTokenPresent || !isTokenValidFlag) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (userRole !== "admin" && userRole !== "superadmin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  }

  const isSuperAdminRoute = superAdminRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  if (isSuperAdminRoute) {
    if (!isTokenPresent || !isTokenValidFlag) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (userRole !== "superadmin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next|_static|_vercel|favicon.ico|sitemap.xml|public).*)",
  ],
};
