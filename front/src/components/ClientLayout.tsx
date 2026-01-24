"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppContext } from "src/contexts/AppContext";

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, isAuthenticated, isAdmin, isSuperAdmin, loading } =
    useAppContext();
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirected = useRef(false);

  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      if (
        error?.response?.status === 401 &&
        (error?.config?.url?.includes("/auth/signin") ||
          error?.config?.url?.includes("/auth/signup") ||
          error?.isAuthError)
      ) {
        event.preventDefault();
        return;
      }
    };
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    return () => {
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
      );
    };
  }, []);

  useEffect(() => {
    hasRedirected.current = false;
  }, [pathname]);

  useEffect(() => {
    if (loading || hasRedirected.current) {
      return;
    }
    const publicRoutes = [
      "/",
      "/login",
      "/register",
      "/create-superadmin",
      "/superadmin-setup",
    ];
    const isPublicRoute = publicRoutes.some((r) => pathname === r);
    if (isPublicRoute) {
      return;
    }
    const isAdminRoute =
      pathname.startsWith("/admin-dashboard") || pathname.startsWith("/admin/");
    const isSuperAdminRoute = pathname.startsWith("/super-admin");
    const isUserRoute =
      pathname.startsWith("/dashboard") || pathname.startsWith("/mis-");

    if (
      !isAuthenticated &&
      (isAdminRoute || isSuperAdminRoute || isUserRoute)
    ) {
      hasRedirected.current = true;
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (isAuthenticated && user) {
      if (isSuperAdmin) {
        return;
      }
      if (isAdmin) {
        if (isSuperAdminRoute) {
          hasRedirected.current = true;
          router.replace("/admin-dashboard");
          return;
        }
        return;
      }
      if (isAdminRoute || isSuperAdminRoute) {
        hasRedirected.current = true;
        router.replace("/dashboard");
        return;
      }
    }
  }, [loading, isAuthenticated, user, pathname, router, isAdmin, isSuperAdmin]);

  const publicRoutes = [
    "/",
    "/login",
    "/register",
    "/create-superadmin",
    "/superadmin-setup",
  ];
  const isPublicRoute = publicRoutes.some((r) => pathname === r);

  if (loading && !isPublicRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-red-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto"></div>
          <p className="mt-6 text-white text-lg font-medium">
            Verificando acceso...
          </p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
