'use client';

import { useEffect, useRef } from "react";

import { useRouter, usePathname } from "next/navigation";
import { useAppContext } from "src/contexts/AppContext";

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, isAuthenticated, isAdmin, isSuperAdmin, loading } = useAppContext();
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirected = useRef(false);

  // Silenciar errores de autenticación no capturados
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      // Silenciar errores 401 de autenticación
      if (
        error?.response?.status === 401 &&
        (error?.config?.url?.includes('/auth/signin') || 
         error?.config?.url?.includes('/auth/signup') ||
         error?.isAuthError)
      ) {
        event.preventDefault(); // Prevenir que Next.js muestre el error
        return;
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Debug
  useEffect(() => {
    if (!loading) {
      console.log(`
╔═══════════════════════════════════════════════════════
║ 🔍 CLIENT LAYOUT
║ 📍 ${pathname}
║ 👤 ${user?.email || 'No autenticado'}
║ 🎭 ${user?.rol || 'N/A'}
║ ✅ Auth: ${isAuthenticated} | Admin: ${isAdmin} | Super: ${isSuperAdmin}
║ 🚫 HasRedirected: ${hasRedirected.current}
╚═══════════════════════════════════════════════════════
      `);
    }
  }, [pathname, user, isAuthenticated, isAdmin, isSuperAdmin, loading]);

  // Reset flag cuando cambia pathname
  useEffect(() => {
    hasRedirected.current = false;
  }, [pathname]);

  // Protección de rutas
  useEffect(() => {
    if (loading || hasRedirected.current) {
      console.log("⏸️ Esperando...");
      return;
    }

    // 🔥 RUTAS PÚBLICAS - NO HACER NADA (ni siquiera si está autenticado)
    const publicRoutes = ['/', '/login', '/register', '/create-superadmin', '/superadmin-setup'];
    const isPublicRoute = publicRoutes.some(r => pathname === r);

    if (isPublicRoute) {
      console.log("✅ Ruta pública - no verificar");
      return; // 🔥 IMPORTANTE: No redirigir desde login
    }

    // 🔥 VERIFICAR SOLO RUTAS PROTEGIDAS
    const isAdminRoute = pathname.startsWith('/admin-dashboard') || pathname.startsWith('/admin/');
    const isSuperAdminRoute = pathname.startsWith('/super-admin');
    const isUserRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/mis-');

    // No autenticado en ruta protegida
    if (!isAuthenticated && (isAdminRoute || isSuperAdminRoute || isUserRoute)) {
      console.log("🚫 No autenticado en ruta protegida → /login");
      hasRedirected.current = true;
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    // Autenticado - verificar permisos
    if (isAuthenticated && user) {
      // SuperAdmin: acceso total
      if (isSuperAdmin) {
        console.log("✅ 👑 SuperAdmin - Acceso total");
        return;
      }

      // Admin: no puede acceder a SuperAdmin routes
      if (isAdmin) {
        if (isSuperAdminRoute) {
          console.log("🚫 Admin sin permiso → /admin-dashboard");
          hasRedirected.current = true;
          router.replace('/admin-dashboard');
          return;
        }
        console.log("✅ 👔 Admin - Acceso permitido");
        return;
      }

      // Usuario normal: no puede acceder a admin routes
      if (isAdminRoute || isSuperAdminRoute) {
        console.log("🚫 Usuario sin permiso → /dashboard");
        hasRedirected.current = true;
        router.replace('/dashboard');
        return;
      }

      console.log("✅ 👤 Usuario - Acceso permitido");
    }
  }, [loading, isAuthenticated, user, pathname, router, isAdmin, isSuperAdmin]);

  // Loading solo en rutas protegidas
  const publicRoutes = ['/', '/login', '/register', '/create-superadmin', '/superadmin-setup'];
  const isPublicRoute = publicRoutes.some(r => pathname === r);

  if (loading && !isPublicRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-red-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto"></div>
          <p className="mt-6 text-white text-lg font-medium">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}