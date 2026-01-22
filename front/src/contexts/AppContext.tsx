"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { apiClient, API_URL } from "src/app/lib/apiClient";
import { IUser } from "src/interfaces/IUser";

interface IProduct {
  id: number;
  name: string;
  price: number;
  quantity?: number;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data?: any;
}

interface AppContextType {
  user: IUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (userData: any, confirmPassword?: string) => Promise<AuthResponse>;
  logout: () => void;
  updateUser: (updatedData: Partial<IUser>) => void;
  updateProfile: (userData: Partial<IUser>) => Promise<AuthResponse>;
  uploadProfileImage: (file: File) => Promise<AuthResponse>;
  isAuthenticated: boolean;
  clearError: () => void;
  googleLogin: () => void;
  checkAuth: () => boolean;
  token: string | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  authLoading: boolean;
  loginLoading: boolean;
  canCreateAdmins: boolean;
  adminLoading: boolean;
  adminError: string | null;
  createAdminUser: (userData: any) => Promise<any>;
  cart: IProduct[];
  cartCount: number;
  cartTotal: number;
  addToCart: (product: IProduct) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
}
const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext debe usarse dentro de AppProvider");
  }
  return context;
};

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [cart, setCart] = useState<IProduct[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  const getUserRole = (userData: IUser | null): string => {
    if (!userData) return "";
    return (userData.rol || "").toLowerCase();
  };

  const userRole = getUserRole(user);
  const isAuthenticated = !!user;
  const isAdmin = userRole === "admin" || userRole === "superadmin";
  const isSuperAdmin = userRole === "superadmin";
  const canCreateAdmins =
    isSuperAdmin ||
    (isAdmin && user?.email === "superadmin.providence1@gmail.com");
  const cartCount = cart.reduce(
    (total, item) => total + (item.quantity || 1),
    0,
  );
  const cartTotal = cart.reduce(
    (total, item) => total + item.price * (item.quantity || 1),
    0,
  );

  const logout = useCallback(() => {
    localStorage.removeItem("providence_token");
    localStorage.removeItem("providence_user");
    localStorage.removeItem("providence_cart");
    setToken(null);
    setUser(null);
    setError(null);
    setCart([]);
    router.push("/login");
  }, [router]);

  useEffect(() => {
    const loadUser = async () => {
      if (typeof window !== "undefined" && pathname === "/auth/callback") {
        const storedCart = localStorage.getItem("providence_cart");
        if (storedCart) setCart(JSON.parse(storedCart));
        setAuthLoading(false);
        setLoading(false);
        return;
      }

      const savedToken = localStorage.getItem("providence_token");
      const savedUser = localStorage.getItem("providence_user");
      if (savedToken && savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          setToken(savedToken);
          const { data: freshUserData } = await apiClient.get("/api/auth/me");
          setUser(freshUserData);
          localStorage.setItem(
            "providence_user",
            JSON.stringify(freshUserData),
          );
        } catch (err) {
          logout();
        }
      }

      const storedCart = localStorage.getItem("providence_cart");
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
      setAuthLoading(false);
      setLoading(false);
    };
    loadUser();
  }, [logout, pathname]);

  const login = async (
    email: string,
    password: string,
  ): Promise<AuthResponse> => {
    try {
      setLoginLoading(true);
      setLoading(true);
      setError(null);

      const { data } = await apiClient.post("/api/auth/signin", {
        email,
        password,
      });
      if (!data.access_token) {
        throw new Error("No se recibió token");
      }
      const newToken = data.access_token;

      localStorage.setItem("providence_token", newToken);
      setToken(newToken);

      try {
        const { data: userData } = await apiClient.get("/api/auth/me");
        setUser(userData);
        localStorage.setItem("providence_user", JSON.stringify(userData));
        return {
          success: true,
          message: "Login exitoso",
          data: userData,
        };
      } catch (meError: any) {
        localStorage.removeItem("providence_token");
        localStorage.removeItem("providence_user");
        setToken(null);
        throw new Error(
          "Error verificando usuario. Por favor intenta de nuevo.",
        );
      }
    } catch (err: any) {
      const message = err.message || "Error en login";
      setError(message);
      throw err;
    } finally {
      setLoginLoading(false);
      setLoading(false);
    }
  };

  const register = async (
    userData: any,
    confirmPassword?: string,
  ): Promise<AuthResponse> => {
    try {
      setLoginLoading(true);
      setLoading(true);
      setError(null);

      const finalConfirmPassword = confirmPassword || userData.confirmPassword;
      if (!finalConfirmPassword) {
        throw new Error("Debes confirmar tu contraseña");
      }
      if (userData.password !== finalConfirmPassword) {
        throw new Error("Las contraseñas no coinciden");
      }
      const registrationData = {
        name: userData.name,
        lastname: userData.lastname,
        email: userData.email,
        password: userData.password,
        confirmPassword: finalConfirmPassword,
        phone: userData.phone,
        dni: userData.dni,
        genre: userData.genre,
        birthdate: userData.birthdate,
      };

      const { data } = await apiClient.post(
        "/api/auth/signup",
        registrationData,
      );
      return {
        success: true,
        message: data.message || "Registro exitoso. Por favor inicia sesión.",
        data,
      };
    } catch (err: any) {
      const message = err.message || "Error en registro";
      setError(message);
      return {
        success: false,
        message,
      };
    } finally {
      setLoginLoading(false);
      setLoading(false);
    }
  };

  const updateProfile = async (
    userData: Partial<IUser>,
  ): Promise<AuthResponse> => {
    try {
      setAdminLoading(true);
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("providence_token");
      if (!token) {
        throw new Error("No hay sesión activa");
      }
      const { data } = await apiClient.put("/api/users/profile", userData);
      if (user) {
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        localStorage.setItem("providence_user", JSON.stringify(updatedUser));
      }
      return {
        success: true,
        message: "Perfil actualizado exitosamente",
        data,
      };
    } catch (err: any) {
      const message = err.message || "Error al actualizar perfil";
      setError(message);
      return {
        success: false,
        message,
      };
    } finally {
      setAdminLoading(false);
      setLoading(false);
    }
  };

  const uploadProfileImage = async (file: File): Promise<AuthResponse> => {
    try {
      setAdminLoading(true);
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("providence_token");
      if (!token) {
        throw new Error("No hay sesión activa");
      }
      const previewUrl = URL.createObjectURL(file);
      if (user) {
        const tempUser = { ...user, profileImage: previewUrl };
        setUser(tempUser);
        localStorage.setItem("providence_user", JSON.stringify(tempUser));
      }
      const formData = new FormData();
      const { data } = await apiClient.put(
        "/api/users/profile/image",
        formData,
      );

      const cloudinaryUrl =
        data.profileImage ||
        data.image ||
        data.url ||
        data.secure_url ||
        data.imageUrl;
      const finalUrl = cloudinaryUrl || previewUrl;

      if (user) {
        const updatedUser = {
          ...user,
          profileImage: finalUrl,
        };
        setUser(updatedUser);
        localStorage.setItem("providence_user", JSON.stringify(updatedUser));
        if (cloudinaryUrl) {
          try {
            await updateProfile({ profileImage: cloudinaryUrl });
          } catch (err) {}
        }
      }
      return {
        success: true,
        message: cloudinaryUrl
          ? "Imagen subida exitosamente"
          : "Imagen mostrada (local)",
        data: { profileImage: finalUrl },
      };
    } catch (err: any) {
      const message = err.message || "Error al subir imagen";
      setError(message);
      return {
        success: false,
        message: "La imagen se muestra localmente. Error: " + message,
      };
    } finally {
      setAdminLoading(false);
      setLoading(false);
    }
  };

  const googleLogin = () => {
    window.location.href = `${API_URL}/api/auth/google/login`;
  };
  const updateUser = (updatedData: Partial<IUser>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem("providence_user", JSON.stringify(updatedUser));
  };
  const checkAuth = (): boolean => {
    return !!localStorage.getItem("providence_token");
  };
  const clearError = () => {
    setError(null);
  };

  const createAdminUser = async (userData: any) => {
    if (!canCreateAdmins) {
      throw new Error("No tienes permisos para crear administradores");
    }
    setAdminLoading(true);
    setAdminError(null);
    try {
      const { data } = await apiClient.post("/api/users", userData);
      return data;
    } catch (error: any) {
      setAdminError(error.message);
      throw error;
    } finally {
      setAdminLoading(false);
    }
  };

  const addToCart = (product: IProduct) => {
    const newCart = [...cart, product];
    setCart(newCart);
    localStorage.setItem("providence_cart", JSON.stringify(newCart));
  };

  const removeFromCart = (productId: number) => {
    const newCart = cart.filter((item) => item.id !== productId);
    setCart(newCart);
    localStorage.setItem("providence_cart", JSON.stringify(newCart));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("providence_cart");
  };

  const value: AppContextType = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    updateProfile,
    uploadProfileImage,
    isAuthenticated,
    clearError,
    googleLogin,
    checkAuth,
    token,
    isAdmin,
    isSuperAdmin,
    authLoading,
    loginLoading,
    canCreateAdmins,
    adminLoading,
    adminError,
    createAdminUser,
    cart,
    cartCount,
    cartTotal,
    addToCart,
    removeFromCart,
    clearCart,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
