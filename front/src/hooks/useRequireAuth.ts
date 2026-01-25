"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./useAuth";

type RequiredRole = "user" | "admin" | "superadmin" | "onlyUser";

export function useRequireAuth(requiredRole?: RequiredRole) {
  const router = useRouter();
  const { isAuthenticated, role, isLoading } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push(`/login?redirect=${pathname}`);
      return;
    }
    if (requiredRole) {
      const hasPermission =
        requiredRole === "user" ||
        (requiredRole === "onlyUser" && role === "user") ||
        (requiredRole === "admin" &&
          (role === "admin" || role === "superadmin")) ||
        (requiredRole === "superadmin" && role === "superadmin");
      if (!hasPermission) {
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, role, isLoading, pathname, router, requiredRole]);

  return { isLoading };
}
