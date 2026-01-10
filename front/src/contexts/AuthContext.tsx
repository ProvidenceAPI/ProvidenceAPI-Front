"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';

// Tipos
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
  mode: 'mock' | 'real';
  setLogin?: (user: User, token: string) => void; // Para compatibilidad con tu LoginForm
};

// Contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personalizado - Compatible con tu LoginForm
export const useAppContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAppContext debe usarse dentro de AuthProvider');
  }
  return context;
};

// También exportamos useAuth para otros componentes si lo prefieres
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

// Provider
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'mock' | 'real'>('real');
  const [token, setToken] = useState<string | null>(null);

  // Cargar usuario al iniciar
  useEffect(() => {
    const loadAuthData = () => {
      const token = localStorage.getItem('providence_token');
      const savedUser = localStorage.getItem('providence_user');
      const mockUser = localStorage.getItem('mock_user');

      if (token && savedUser) {
        try {
          setToken(token);
          setUser(JSON.parse(savedUser));
          setMode('real');
          
          // Configurar axios con el token
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } catch (err) {
          console.error('Error cargando datos de autenticación:', err);
          localStorage.removeItem('providence_token');
          localStorage.removeItem('providence_user');
        }
      } else if (mockUser) {
        try {
          setUser(JSON.parse(mockUser));
          setMode('mock');
        } catch (err) {
          console.error('Error cargando usuario mock:', err);
          localStorage.removeItem('mock_user');
        }
      }
      setLoading(false);
    };

    loadAuthData();
  }, []);

  // Función loadUser para obtener perfil del backend
  const loadUser = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('providence_token');
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await axios.get(`${API_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setUser(response.data);
      setMode('real');
      setError(null);
      
      // Guardar usuario actualizado
      localStorage.setItem('providence_user', JSON.stringify(response.data));
      
    } catch (err: any) {
      console.log('Backend no disponible, usando modo mock:', err.message);
      
      // Si falla, intentamos usar datos mockeados
      const mockUser = localStorage.getItem('mock_user');
      if (mockUser) {
        setUser(JSON.parse(mockUser));
        setMode('mock');
      } else {
        // Si no hay usuario mock, deslogueamos
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  // Login - Versión mejorada
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      
      // Intentamos login real
      try {
        const response = await axios.post(`${API_URL}/auth/signin`, {
          email,
          password
        });

        const { access_token, user: userData } = response.data;

        if (!access_token) {
          throw new Error('No se recibió token de autenticación');
        }

        // Guardar token
        localStorage.setItem('providence_token', access_token);
        setToken(access_token);
        
        // Configurar axios
        axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

        // Obtener perfil completo si no viene en la respuesta
        let fullUserData = userData;
        if (!fullUserData) {
          const profileResponse = await axios.get(`${API_URL}/users/me`, {
            headers: {
              'Authorization': `Bearer ${access_token}`
            }
          });
          fullUserData = profileResponse.data;
        }

        // Guardar usuario
        setUser(fullUserData);
        localStorage.setItem('providence_user', JSON.stringify(fullUserData));
        setMode('real');

        return { 
          success: true, 
          message: "Login exitoso", 
          mode: 'real' 
        };

      } catch (apiError: any) {
        console.log('Error en login con backend:', apiError.response?.data || apiError.message);
        
        // Si el backend falla, usamos mock
        const mockUser = {
          id: Date.now().toString(),
          name: email.split('@')[0] || "Usuario",
          email: email,
          phone: "+34 123 456 789",
          profileImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=667eea&color=fff`,
          rol: "user" as const,
          status: "Active" as const,
          genre: "Male",
          lastname: "Mock",
          dni: 123456789,
          birthdate: "1990-01-01"
        };
        
        localStorage.setItem('mock_user', JSON.stringify(mockUser));
        setUser(mockUser);
        setMode('mock');
        
        return { 
          success: true, 
          message: "Login exitoso (modo desarrollo)", 
          mode: 'mock' 
        };
      }
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Error al iniciar sesión';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Función setLogin para compatibilidad con tu LoginForm actual
  const setLogin = (userData: User, userToken: string) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('providence_token', userToken);
    localStorage.setItem('providence_user', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
    setMode('real');
  };

  



 const register = async (userData: any): Promise<{ success: boolean; message: string; mode?: string }> => {
    try {
        setLoading(true);
        setError(null);

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

        const response = await axios.post(`${API_URL}/auth/signup`, userData);
        
        const { access_token, user: userResponse } = response.data;

        if (access_token) {
            localStorage.setItem('providence_token', access_token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        }
        
        const finalUserData = userResponse || { ...userData, id: Date.now().toString() };
        setUser(finalUserData);
        localStorage.setItem('providence_user', JSON.stringify(finalUserData));
        setMode('real');

        return {
            success: true,
            message: 'Registro exitoso',
            mode: 'real'
        };
        
    } catch (error: any) {
        console.error('Error en registro:', error.response?.data || error.message);
        const errorMessage = error.response?.data?.message || error.message || 'Error en el registro';
        setError(errorMessage);
        
        return {
            success: false,
            message: errorMessage
        };
    } finally {
        setLoading(false);
    }
};


  const logout = () => {
    localStorage.removeItem('providence_token');
    localStorage.removeItem('providence_user');
    localStorage.removeItem('mock_user');
    setUser(null);
    setToken(null);
    setMode('mock');
    setError(null);
    delete axios.defaults.headers.common['Authorization'];
    
    // Redirigir al login
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  const updateUser = (updatedData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updatedData };
      setUser(updatedUser);
      
      if (mode === 'mock') {
        localStorage.setItem('mock_user', JSON.stringify(updatedUser));
      } else {
        localStorage.setItem('providence_user', JSON.stringify(updatedUser));
      }
    }
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
    setLogin // Añadido para compatibilidad
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};