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

const superAdminRoutes = [
  "/create-superadmin",
  "/adminCreationForm",
];

// Función auxiliar para verificar token
const isTokenValid = (token: string | undefined): boolean => {
  if (!token) return false;
  
  try {
    // Verificar que el token tenga formato JWT (3 partes)
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    // Decodificar payload (sin verificar firma, solo validación básica)
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
    
    // Verificar expiración si existe
    if (payload.exp) {
      const expirationTime = payload.exp * 1000; // convertir a ms
      if (Date.now() > expirationTime) {
        console.log("Token expirado");
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.log("Token inválido:", error);
    return false;
  }
};

// Función para extraer rol del usuario
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
  
  // Obtener token y usuario del cliente
  const token = request.cookies.get("providence_token")?.value;
  const userCookie = request.cookies.get("providence_user");
  const userRole = getUserRole(userCookie);
  const isTokenPresent = !!token;
  const isTokenValidFlag = isTokenValid(token);

  // RUTAS PÚBLICAS - Dejar pasar siempre
  const isPublicRoute = publicRoutes.some((route) => {
    return pathname === route || pathname.startsWith(route + "/");
  });

  if (isPublicRoute) {
    // Si ya está logueado y va a login, redirigir a dashboard
    if ((pathname === "/login" || pathname === "/register") && isTokenValidFlag) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  //  RUTAS PROTEGIDAS - Requieren estar logueado
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (isProtectedRoute) {
    if (!isTokenPresent || !isTokenValidFlag) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // RUTAS ADMIN - Requieren ser admin o superadmin
  const isAdminRoute = adminRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (isAdminRoute) {
    // Validar token
    if (!isTokenPresent || !isTokenValidFlag) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Validar rol
    if (userRole !== "admin" && userRole !== "superadmin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  }

  //  RUTAS SUPERADMIN - Requieren ser superadmin
  const isSuperAdminRoute = superAdminRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (isSuperAdminRoute) {
    // Validar token
    if (!isTokenPresent || !isTokenValidFlag) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Validar rol - SOLO superadmin
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