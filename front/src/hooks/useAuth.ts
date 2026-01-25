
"use client";

import { useEffect, useState } from "react";
import {
  getUser,
  getUserRole,
  isAuthenticated,
  isAdmin,
  isSuperAdmin,
  clearAuthData,
} from "../app/lib/auth";
import { useRouter } from "next/navigation";

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const user = getUser();
    setUser(user);
    setIsLoading(false);
  }, []);

  const logout = () => {
    clearAuthData();
    setUser(null);
    router.push("/login");
  };

  return {
    user,
    role: getUserRole(),
    isLoading,
    isAuthenticated: isAuthenticated(),
    isAdmin: isAdmin(),
    isSuperAdmin: isSuperAdmin(),
    logout,
  };
}

