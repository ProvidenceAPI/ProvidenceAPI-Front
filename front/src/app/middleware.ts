// middleware.ts - VERSIÓN CORREGIDA
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
  '/auth/callback'
];

// Rutas que requieren autenticación como USUARIO
const protectedRoutes = [
  '/dashboard',
  '/mis-pagos',
  '/mis-reservas',
  '/',
  '/contexts',
];

// Rutas que requieren ROL ADMIN
const adminRoutes = [
  '/',
  '/dashboard',
  '/activitiesDashboard',
  '/users',
  '/turns',
   '/mis-reservas',
];

// Rutas que requieren ROL SUPER ADMIN
const superAdminRoutes = [
  `/dashboard`,
  `/admin-dashboard`,
  '/users',
  `/activitiesDashboard`,
  `turns`,
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

  // 1. Si es ruta pública, permitir siempre
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // 2. Si no hay token, redirigir a login
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Verificar rutas protegidas (usuarios normales)
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 4. Verificar rutas de ADMIN
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    if (!user || (userRole !== 'admin' && userRole !== 'superadmin')) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'no-admin');
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 5. Verificar rutas de SUPER ADMIN
  if (superAdminRoutes.some(route => pathname.startsWith(route))) {
    if (!user || userRole !== 'superadmin') {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'no-superadmin');
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (static files)
     * 4. /favicon.ico, /sitemap.xml (static files)
     * 5. /public (static files)
     */
    '/((?!api|_next|_static|_vercel|favicon.ico|sitemap.xml|public).*)',
  ],
};