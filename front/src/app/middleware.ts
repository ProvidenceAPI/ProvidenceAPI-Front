// middleware.ts - VERSIÓN FINAL CORREGIDA
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas públicas que NO requieren autenticación
const publicRoutes = [
  '/',
  '/home',
  '/login',
  '/register',
  '/nosotros',
  '/ubicacion',
  '/testimonios',
  '/auth/callback',  // ¡IMPORTANTE! Mantener como pública
  '/api/auth/callback' // Si existe esta ruta también
];

// Rutas que requieren autenticación como USUARIO
const protectedRoutes = [
  '/dashboard',
  '/mis-pagos',
  '/mis-reservas',
  '/contexts',
];

// Rutas que requieren ROL ADMIN
const adminRoutes = [
  '/dashboard',
  '/activitiesDashboard',
  '/users',
  '/turns',
  '/mis-reservas',
];

// Rutas que requieren ROL SUPER ADMIN
const superAdminRoutes = [
  '/dashboard',
  '/admin-dashboard',
  '/users',
  '/activitiesDashboard',
  '/turns',
  '/create-superadmin',
  '/mis-reservas',
  '/adminCreationForm'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('providence_token')?.value;
  
  // Obtener usuario de cookies
  const userCookie = request.cookies.get('providence_user');
  let user = null;
  let userRole = '';
  
  if (userCookie) {
    try {
      user = JSON.parse(decodeURIComponent(userCookie.value));
      userRole = (user.rol || user.role || '').toLowerCase();
    } catch (e) {
      console.error('Error parsing user cookie:', e);
    }
  }

  // ⭐⭐⭐ CAMBIO 1: Permitir siempre el callback de OAuth ⭐⭐⭐
  // Esto evita que el middleware interfiera con el flujo de Google
  if (pathname.startsWith('/auth/callback') || pathname.includes('auth/callback')) {
    return NextResponse.next();
  }

  // 1. Si es ruta pública, permitir siempre
  const isPublicRoute = publicRoutes.some(route => {
    // Permitir rutas exactas o que comiencen con la ruta pública
    return pathname === route || pathname.startsWith(route + '/');
  });

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // ⭐⭐⭐ CAMBIO 2: Mejor detección de rutas protegidas ⭐⭐⭐
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
  
  const isAdminRoute = adminRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
  
  const isSuperAdminRoute = superAdminRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  // 2. Si no hay token y es ruta protegida, redirigir a login
  if (!token && (isProtectedRoute || isAdminRoute || isSuperAdminRoute)) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Si hay token, continuar con validaciones de rol
  if (token) {
    // 3. Verificar rutas protegidas (usuarios normales)
    if (isProtectedRoute) {
      if (!user) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('error', 'no_user_data');
        return NextResponse.redirect(loginUrl);
      }
      // Cualquier usuario autenticado puede acceder
      return NextResponse.next();
    }

    // 4. Verificar rutas de ADMIN
    if (isAdminRoute) {
      if (!user || (userRole !== 'admin' && userRole !== 'superadmin')) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('error', 'no-admin');
        return NextResponse.redirect(loginUrl);
      }
      return NextResponse.next();
    }

    // 5. Verificar rutas de SUPER ADMIN
    if (isSuperAdminRoute) {
      if (!user || userRole !== 'superadmin') {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('error', 'no-superadmin');
        return NextResponse.redirect(loginUrl);
      }
      return NextResponse.next();
    }
  }

  // Para cualquier otra ruta no especificada, permitir acceso
  // (esto permite rutas como /about, /contact, etc.)
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
    '/((?!api|_next|_static|_vercel|favicon.ico|sitemap.xml|public).*)',
  ],
};