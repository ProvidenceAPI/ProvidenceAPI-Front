// src/lib/auth.ts
import Cookies from "js-cookie";

export interface User {
  id: string;
  email: string;
  rol?: string;
  role?: string;
}

export const getToken = (): string | undefined => {
  if (typeof window !== "undefined") {
    const tokenLS = localStorage.getItem("providence_token");
    if (tokenLS) return tokenLS;
  }
  return Cookies.get("providence_token");
};

export const getUser = (): User | null => {
  if (typeof window !== "undefined") {
    const userLS = localStorage.getItem("providence_user");
    if (userLS) {
      try {
        return JSON.parse(userLS);
      } catch {}
    }
  }

  const userCookie = Cookies.get("providence_user");
  if (!userCookie) return null;
  try {
    return JSON.parse(userCookie);
  } catch {
    return null;
  }
};

export const getUserRole = (): string | null => {
  const user = getUser();
  const role = (user?.rol || user?.role || "") as string;
  return role ? role.toLowerCase() : null;
};

export const saveAuthData = (token: string, user: User) => {
  Cookies.set("providence_token", token, {
    expires: 7,
    secure: true,
    sameSite: "Strict",
  });
  Cookies.set("providence_user", JSON.stringify(user), {
    expires: 7,
    secure: true,
    sameSite: "Strict",
  });
};

export const clearAuthData = () => {
  Cookies.remove("providence_token");
  Cookies.remove("providence_user");
  localStorage.removeItem("providence_token");
  localStorage.removeItem("providence_user");
};

export const isAuthenticated = (): boolean => {
  return !!getToken() && !!getUser();
};

export const isAdmin = (): boolean => {
  const role = getUserRole();
  return role === "admin" || role === "superadmin";
};

export const isSuperAdmin = (): boolean => {
  const role = getUserRole();
  return role === "superadmin";
};
