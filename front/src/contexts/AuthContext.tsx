"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

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

type AuthResponse = {
  success: boolean;
  message: string;
  data?: any;
};

type AuthContextType = {
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
  setLogin: (userData: User, userToken: string) => void;
  googleLogin: () => void;
  handleGoogleCallback: (code: string) => Promise<AuthResponse>;
  checkAuth: () => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://providenceapi-back.onrender.com';

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar usuario al iniciar
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('providence_token');
      const savedUser = localStorage.getItem('providence_user');

      if (token && savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          
          const response = await fetch(`${API_URL}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const freshUserData = await response.json();
            setUser(freshUserData);
            localStorage.setItem('providence_user', JSON.stringify(freshUserData));
          } else {
            logout();
          }
        } catch (err) {
          console.error('Error cargando usuario:', err);
          logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  // LOGIN NORMAL
  const login = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/api/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en login');
      }

      if (!data.access_token) {
        throw new Error('No se recibió token');
      }

      localStorage.setItem('providence_token', data.access_token);

      const userResponse = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${data.access_token}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error('Error obteniendo usuario');
      }

      const userData = await userResponse.json();
      
      setUser(userData);
      localStorage.setItem('providence_user', JSON.stringify(userData));

      return { 
        success: true, 
        message: 'Login exitoso',
        data: userData
      };
    } catch (err: any) {
      const message = err.message || 'Error en login';
      setError(message);
      
      return { 
        success: false, 
        message 
      };
    } finally {
      setLoading(false);
    }
  };

  // REGISTER
  const register = async (userData: any, confirmPassword?: string): Promise<AuthResponse> => {
    try {
      setLoading(true);
      setError(null);

      const finalConfirmPassword = confirmPassword || userData.confirmPassword;
      
      if (!finalConfirmPassword) {
        throw new Error('Debes confirmar tu contraseña');
      }

      if (userData.password !== finalConfirmPassword) {
        throw new Error('Las contraseñas no coinciden');
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

      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en registro');
      }

      return { 
        success: true, 
        message: data.message || 'Registro exitoso. Por favor inicia sesión.',
        data
      };
    } catch (err: any) {
      const message = err.message || 'Error en registro';
      setError(message);
      
      return { 
        success: false, 
        message 
      };
    } finally {
      setLoading(false);
    }
  };

  // ACTUALIZAR PERFIL
  const updateProfile = async (userData: Partial<User>): Promise<AuthResponse> => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('providence_token');
      
      if (!token) {
        throw new Error('No hay sesión activa');
      }

      const response = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar perfil');
      }

      if (user) {
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        localStorage.setItem('providence_user', JSON.stringify(updatedUser));
      }

      return { 
        success: true, 
        message: 'Perfil actualizado exitosamente',
        data
      };
    } catch (err: any) {
      const message = err.message || 'Error al actualizar perfil';
      setError(message);
      
      return { 
        success: false, 
        message 
      };
    } finally {
      setLoading(false);
    }
  };

  // SUBIR IMAGEN DE PERFIL - USA LA MISMA LÓGICA QUE TU DASHBOARD
const uploadProfileImage = async (file: File): Promise<AuthResponse> => {
  try {
    setLoading(true);
    setError(null);

    console.log('🖼️ Subiendo imagen...');

    const token = localStorage.getItem('providence_token');
    
    if (!token) {
      throw new Error('No hay sesión activa');
    }

    const formData = new FormData();
    formData.append('file', file);

    // USA EXACTAMENTE LA MISMA URL Y MÉTODO QUE TU DASHBOARD
    const response = await fetch(`${API_URL}/users/profile/image`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        // NO incluyas 'Content-Type' para FormData
      },
      body: formData,
    });

    const data = await response.json();

    console.log('📥 Respuesta imagen:', { status: response.status, data });

    if (!response.ok) {
      throw new Error(data.message || `Error ${response.status} al subir imagen`);
    }

    // Obtener URL - según lo que devuelve tu backend
    const imageUrl = data.profileImage || data.url || data.imageUrl;

    // Actualizar usuario
    if (user && imageUrl) {
      const updatedUser = { 
        ...user, 
        profileImage: imageUrl 
      };
      setUser(updatedUser);
      localStorage.setItem('providence_user', JSON.stringify(updatedUser));
    }

    return { 
      success: true, 
      message: 'Imagen actualizada exitosamente',
      data
    };
    
  } catch (err: any) {
    const message = err.message || 'Error al subir imagen';
    setError(message);
    console.error('❌ Error subiendo imagen:', err);
    
    return { 
      success: false, 
      message 
    };
  } finally {
    setLoading(false);
  }
};

  // GOOGLE LOGIN
  const googleLogin = () => {
    window.location.href = `${API_URL}/api/auth/google/login`;
  };

  // GOOGLE CALLBACK
  const handleGoogleCallback = async (code: string): Promise<AuthResponse> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/api/auth/google/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          redirectUri: `${window.location.origin}/auth/google/callback`
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en autenticación Google');
      }

      if (!data.access_token || !data.user) {
        throw new Error('Datos incompletos de Google');
      }

      localStorage.setItem('providence_token', data.access_token);
      localStorage.setItem('providence_user', JSON.stringify(data.user));
      setUser(data.user);

      return {
        success: true,
        message: 'Autenticación Google exitosa',
        data: data.user
      };
    } catch (err: any) {
      const message = err.message || 'Error en Google OAuth';
      setError(message);
      
      return {
        success: false,
        message
      };
    } finally {
      setLoading(false);
    }
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem('providence_token');
    localStorage.removeItem('providence_user');
    setUser(null);
    setError(null);
    
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  // Actualizar usuario localmente
  const updateUser = (updatedData: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem('providence_user', JSON.stringify(updatedUser));
  };

  // Para Google OAuth
  const setLogin = (userData: User, userToken: string) => {
    setUser(userData);
    localStorage.setItem('providence_token', userToken);
    localStorage.setItem('providence_user', JSON.stringify(userData));
  };

  // Verificar autenticación
  const checkAuth = (): boolean => {
    return !!localStorage.getItem('providence_token');
  };

  const clearError = () => {
    setError(null);
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
    updateProfile,
    uploadProfileImage,
    isAuthenticated,
    clearError,
    setLogin,
    googleLogin,
    handleGoogleCallback,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}