// src/contexts/AuthContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import * as api from "../app/services/api"; // Ajusta la ruta si es necesario

// Tipos
type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: "user" | "admin";
};

// Tipo AppContext para compatibilidad con LoginForm
export type AppContext = {
  user: User | null;
  token: string | null;
  setLogin: (user: User, token: string) => void;
  loading?: boolean;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; message?: string; user?: User; token?: string }>;
  register: (payload: { name: string; email: string; password: string; phone?: string }) => Promise<{ ok: boolean; message?: string }>;
  logout: () => void;
  setLogin: (user: User, token: string) => void;
};

// Crear contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Proveedor principal
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar datos desde localStorage al iniciar
  useEffect(() => {
    const raw = localStorage.getItem("auth");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setUser(parsed.user || null);
        setToken(parsed.token || null);
      } catch (e) {
        console.error("Error parsing auth data:", e);
        setUser(null);
        setToken(null);
        localStorage.removeItem("auth");
      }
    }
    setLoading(false);
  }, []);

  // Guardar datos en estado y localStorage
  const save = (userData: User | null, tokenData: string | null) => {
    setUser(userData);
    setToken(tokenData);
    if (userData && tokenData) {
      localStorage.setItem("auth", JSON.stringify({ user: userData, token: tokenData }));
    } else {
      localStorage.removeItem("auth");
    }
  };

  // Función setLogin (para LoginForm)
  const setLogin = (userData: User, tokenData: string) => {
    save(userData, tokenData);
  };

  // Función de login
  const login = async (email: string, password: string): Promise<{ ok: boolean; message?: string; user?: User; token?: string }> => {
    setLoading(true);
    try {
      const res = await api.login(email, password);
      if (res.ok && res.user && res.token) {
        const user: User = {
          ...res.user,
          role: res.user.role === "admin" ? "admin" : "user"
        };
        save(user, res.token);
        setLoading(false);
        return { ok: true, user, token: res.token };
      }
      setLoading(false);
      return { ok: res.ok, message: res.message };
    } catch (error) {
      setLoading(false);
      return { 
        ok: false, 
        message: "Error de conexión con el servidor" 
      };
    }
  };

  // Función de registro
  const register = async (payload: { 
    name: string; 
    email: string; 
    password: string; 
    phone?: string 
  }) => {
    setLoading(true);
    try {
      const res = await api.register(payload);
      if (res.ok && res.user && res.token) {
        const user: User = {
          ...res.user,
          role: res.user.role === "admin" ? "admin" : "user"
        };
        save(user, res.token);
      }
      setLoading(false);
      return res;
    } catch (error) {
      setLoading(false);
      return { 
        ok: false, 
        message: "Error de conexión con el servidor" 
      };
    }
  };

  // Función de logout
  const logout = () => {
    save(null, null);
  };

  // Valor del contexto
  const contextValue: AuthContextType = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    setLogin
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto (nuevo)
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
};

// Hook alternativo para compatibilidad (para LoginForm)
export const useAppContext = (): AppContext => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAppContext debe usarse dentro de AuthProvider");
  }
  
  // Retorna solo las propiedades que AppContext necesita
  return {
    user: context.user,
    token: context.token,
    setLogin: context.setLogin,
    loading: context.loading
  };
};