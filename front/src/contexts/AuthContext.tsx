"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';

type User = {
  id: string;
  name: string;
  email: string;
  lastname?: string;
  phone?: string;
  rol?: 'user' | 'admin' | 'superAdmin';
  status?: 'Active' | 'Cancelled' | 'Banned';
  profileImage?: string;
  genre?: string;
  birthdate?: string;
  dni?: number;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string; mode?: string }>;
  register: (userData: any) => Promise<{ success: boolean; message: string; mode?: string }>;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => void;
  isAuthenticated: boolean;
  mode: 'real';
  setLogin?: (user: User, token: string) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAppContext debe usarse dentro de AuthProvider');
  }
  return context;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode] = useState<'real'>('real');
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const loadAuthData = () => {
      const token = localStorage.getItem('providence_token');
      const savedUser = localStorage.getItem('providence_user');

      if (token && savedUser && savedUser !== 'undefined') {
        try {
          setToken(token);
          setUser(JSON.parse(savedUser));
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } catch (error) {
          console.error('Error parseando usuario guardado', error);
          localStorage.removeItem('providence_token');
          localStorage.removeItem('providence_user');
          setUser(null);
        }
      }

      setLoading(false);
    };

    loadAuthData();
  }, []);

  const loadUser = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('providence_token');

      if (!token) throw new Error('No hay token');

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

      const response = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(response.data);
      localStorage.setItem('providence_user', JSON.stringify(response.data));
      setError(null);
    } catch (err: any) {
      console.error('Error cargando usuario:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

      const response = await axios.post(`${API_URL}/api/auth/signin`, {
        email,
        password,
      });

      const { access_token } = response.data;

      if (!access_token) {
        throw new Error('No se recibió token de acceso');
      }

      localStorage.setItem('providence_token', access_token);
      setToken(access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      const profileResponse = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      setUser(profileResponse.data);
      localStorage.setItem('providence_user', JSON.stringify(profileResponse.data));

      return { success: true, message: 'Login exitoso', mode: 'real' };
    } catch (err: any) {
      console.error('Login error:', err);
      const message = err.response?.data?.message || 'Error al iniciar sesión';
      setError(message);

      localStorage.removeItem('providence_token');
      localStorage.removeItem('providence_user');
      delete axios.defaults.headers.common['Authorization'];
      
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const setLogin = (userData: User, userToken: string) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('providence_token', userToken);
    localStorage.setItem('providence_user', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
  };

  const register = async (userData: any): Promise<{ success: boolean; message: string; mode?: string }> => {
    try {
      setLoading(true);
      setError(null);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await axios.post(`${API_URL}/api/auth/signup`, userData);

      return { success: true, message: 'Registro exitoso', mode: 'real' };
    } catch (err: any) {
      const message = err.response?.data?.message || 'Error en el registro';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('providence_token');
    localStorage.removeItem('providence_user');
    setUser(null);
    setToken(null);
    setError(null);
    delete axios.defaults.headers.common['Authorization'];

    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  const updateUser = (updatedData: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem('providence_user', JSON.stringify(updatedUser));
  };

  const isAuthenticated = !!user;

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated,
    mode,
    setLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
