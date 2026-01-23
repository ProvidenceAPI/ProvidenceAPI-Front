import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rutas públicas que NO requieren autenticación
const publicRoutes = [
  "/",
  "/home",
  "/login",
  "/activities",
  "/register",
  "/nosotros",
  "/ubicacion",
  "/testimonios",
  "/auth/callback", // ¡IMPORTANTE! Mantener como pública
 
];

// Rutas que requieren autenticación como USUARIO
const protectedRoutes = [
  "/dashboard",
  "/mis-pagos",
  "/mis-reservas",
  "/contexts",
];

// Rutas que requieren ROL ADMIN
const adminRoutes = [
  "/dashboard",
  "/activitiesDashboard",
  "/admin-dashboard",
  "/users",
  "/turns",
 
];

// Rutas que requieren ROL SUPER ADMIN
const superAdminRoutes = [
  "/dashboard",
  "/admin-dashboard",
  "/users",
  "/activitiesDashboard",
  "/turns",
  "/create-superadmin",
  "/mis-reservas",
  "/adminCreationForm",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("providence_token")?.value;
  const userCookie = request.cookies.get("providence_user");
  let user = null;
  let userRole = "";
  let userStatus = "";

  if (userCookie) {
    try {
      user = JSON.parse(decodeURIComponent(userCookie.value));
      userRole = (user.rol || user.role || "").toLowerCase();
    } catch (e) {}
  }
  if (
    pathname.startsWith("/auth/callback") ||
    pathname.includes("auth/callback")
  ) {
    return NextResponse.next();
  }
  const isPublicRoute = publicRoutes.some((route) => {
    return pathname === route || pathname.startsWith(route + "/");
  });

  if (isPublicRoute) {
    return NextResponse.next();
  }
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  const isAdminRoute = adminRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );
  const isSuperAdminRoute = superAdminRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );
  if (!token && (isProtectedRoute || isAdminRoute || isSuperAdminRoute)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }
  if (token) {
    if (isProtectedRoute) {
      if (!user) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("error", "no_user_data");
        return NextResponse.redirect(loginUrl);
      }
      return NextResponse.next();
    }

    if (isAdminRoute) {
      if (!user || (userRole !== "admin" && userRole !== "superadmin")) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("error", "no-admin");
        return NextResponse.redirect(loginUrl);
      }
      return NextResponse.next();
    }

    if (isSuperAdminRoute) {
      if (!user || userRole !== "superadmin") {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("error", "no-superadmin");
        return NextResponse.redirect(loginUrl);
      }
      return NextResponse.next();
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api routes (excepto /api/auth/callback si lo necesitas)
     * 2. /_next (Next.js internals)
     * 3. /_static (static files)
     * 4. /favicon.ico, /sitemap.xml (static files)
     * 5. /public (static files)
     */
    "/((?!api|_next|_static|_vercel|favicon.ico|sitemap.xml|public).*)",
  ],
};
