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

interface User {
  id: string;
  name: string;
  email: string;
  rol?: string;
  lastname?: string;
  birthdate?: string;
  phone?: string;
  dni?: string;
  profileImage?: string | null;
  genre?: string;
  status?: string;
  provider?: string;
}

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
  // === DEL VIEJO CONTEXTO ===
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (userData: any, confirmPassword?: string) => Promise<AuthResponse>;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => void;
  updateProfile: (userData: Partial<User>) => Promise<AuthResponse>;
  uploadProfileImage: (file: File) => Promise<AuthResponse>;
  isAuthenticated: boolean;
  clearError: () => void;
  googleLogin: () => void;
  checkAuth: () => boolean;

  // === DEL NUEVO CONTEXTO ===
  token: string | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  authLoading: boolean;
  loginLoading: boolean;

  // Admin
  canCreateAdmins: boolean;
  adminLoading: boolean;
  adminError: string | null;
  createAdminUser: (userData: any) => Promise<any>;

  // Cart
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

  // === STATE ===
  // Del viejo
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Del nuevo
  const [token, setToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [cart, setCart] = useState<IProduct[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  // === COMPUTED VALUES ===
  const getUserRole = (userData: User | null): string => {
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

  // Cart totals
  const cartCount = cart.reduce(
    (total, item) => total + (item.quantity || 1),
    0,
  );
  const cartTotal = cart.reduce(
    (total, item) => total + item.price * (item.quantity || 1),
    0,
  );

  // LOGOUT (definido antes del effect que lo usa)
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

  // === EFFECTS ===
  useEffect(() => {
    const loadUser = async () => {
      // En /auth/callback el flujo de Google es el dueño del token: no hacer
      // /api/auth/me con un token viejo para evitar 401 y que el interceptor
      // borre el token nuevo que el callback acaba de guardar.
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

          // Verificar token válido
          const { data: freshUserData } = await apiClient.get("/api/auth/me");
          setUser(freshUserData);
          localStorage.setItem(
            "providence_user",
            JSON.stringify(freshUserData),
          );
        } catch (err) {
          console.error("Error cargando usuario:", err);
          logout();
        }
      }

      // Cargar carrito
      const storedCart = localStorage.getItem("providence_cart");
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }

      setAuthLoading(false);
      setLoading(false);
    };

    loadUser();
  }, [logout, pathname]);

  // === FUNCIONES DEL VIEJO CONTEXTO (EXACTAMENTE IGUALES) ===

  // LOGIN NORMAL
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

      // Obtener datos del usuario
      const { data: userData } = await apiClient.get("/api/auth/me");

      setUser(userData);
      localStorage.setItem("providence_user", JSON.stringify(userData));

      return {
        success: true,
        message: "Login exitoso",
        data: userData,
      };
    } catch (err: any) {
      const message = err.message || "Error en login";
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

  // REGISTER
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

  // ACTUALIZAR PERFIL
  const updateProfile = async (
    userData: Partial<User>,
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

  // SUBIR IMAGEN DE PERFIL
  const uploadProfileImage = async (file: File): Promise<AuthResponse> => {
    try {
      setAdminLoading(true);
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("providence_token");

      if (!token) {
        throw new Error("No hay sesión activa");
      }

      console.log("🖼️ Subiendo imagen...");

      // 1. Preview inmediato
      const previewUrl = URL.createObjectURL(file);
      if (user) {
        const tempUser = { ...user, profileImage: previewUrl };
        setUser(tempUser);
        localStorage.setItem("providence_user", JSON.stringify(tempUser));
      }

      // 2. Crear FormData
      const formData = new FormData();
      formData.append("file", file);

      // 3. Enviar al backend
      const { data } = await apiClient.put(
        "/api/users/profile/image",
        formData,
      );

      console.log("📥 Respuesta backend:", data);

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
          } catch (err) {
            console.log("⚠️ No se pudo guardar URL en perfil, pero se muestra");
          }
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
      console.error("❌ Error subiendo imagen:", err);

      return {
        success: false,
        message: "La imagen se muestra localmente. Error: " + message,
      };
    } finally {
      setAdminLoading(false);
      setLoading(false);
    }
  };

  // GOOGLE LOGIN: redirige a GET /api/auth/google/login; el back redirige a /auth/callback?token=
  const googleLogin = () => {
    window.location.href = `${API_URL}/api/auth/google/login`;
  };

  // Actualizar usuario localmente
  const updateUser = (updatedData: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem("providence_user", JSON.stringify(updatedUser));
  };

  // Verificar autenticación
  const checkAuth = (): boolean => {
    return !!localStorage.getItem("providence_token");
  };

  const clearError = () => {
    setError(null);
  };

  // === FUNCIONES DEL NUEVO CONTEXTO ===

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
      console.error("Error creating admin:", error);
      setAdminError(error.message);
      throw error;
    } finally {
      setAdminLoading(false);
    }
  };

  // === CART METHODS ===
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

  // === CONTEXT VALUE ===
  const value: AppContextType = {
    // Del viejo (compatibilidad total)
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

    // Del nuevo
    token,
    isAdmin,
    isSuperAdmin,
    authLoading,
    loginLoading,

    // Admin
    canCreateAdmins,
    adminLoading,
    adminError,
    createAdminUser,

    // Cart
    cart,
    cartCount,
    cartTotal,
    addToCart,
    removeFromCart,
    clearCart,
  };

  // Debug
  useEffect(() => {
    if (!authLoading) {
      console.log("🔍 AppContext cargado:", {
        user: user?.email,
        isAuthenticated,
        isAdmin,
        loading,
        cartCount,
      });
    }
  }, [user, authLoading, isAuthenticated, isAdmin, loading, cartCount]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
