
"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "src/app/lib/apiClient";

const AUTH_CALLBACK_KEY = "auth_callback_processing";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasProcessed = useRef(false);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Procesando autenticación...');

  useEffect(() => {
   
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const token = searchParams.get("token");
    const error = searchParams.get("error");

    console.log("🔍 Google Callback Params:", { token, error });

    
    if (error) {
      console.error("❌ OAuth error from server:", error);
      setStatus('error');
      setMessage(`Error: ${error}`);
      
      
      setTimeout(() => {
        router.replace(`/login?error=${encodeURIComponent(error)}`);
      }, 2000);
      return;
    }

    
    if (!token) {
      setStatus('error');
      setMessage('No se recibió token de autenticación');
      
      setTimeout(() => {
        router.replace("/login?error=missing_token");
      }, 2000);
      return;
    }

    
    const processToken = async () => {
      try {
        setMessage('Validando credenciales...');
        
        
        localStorage.removeItem("providence_token");
        localStorage.removeItem("providence_user");
        document.cookie = "providence_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        document.cookie = "providence_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

        
        localStorage.setItem("providence_token", token);
        
        
        document.cookie = `providence_token=${token}; path=/; max-age=86400; SameSite=Lax`;

        
        setMessage('Obteniendo información del usuario...');
        const { data: userData } = await apiClient.get("/api/auth/me");

        if (!userData) {
          throw new Error("No se recibieron datos del usuario");
        }

        
        if (userData.Rol) {
          userData.Rol = userData.Rol.toLowerCase();
          userData.role = userData.Rol;
        }

        
        const userStr = JSON.stringify(userData);
        localStorage.setItem("providence_user", userStr);
        
 
        document.cookie = `providence_user=${encodeURIComponent(userStr)}; path=/; max-age=86400; SameSite=Lax`;

        console.log("✅ Login por Google exitoso:", userData.email);
        setStatus('success');
        setMessage('¡Autenticación exitosa! Redirigiendo...');

    

        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1000);

      } catch (error: any) {
        console.error("❌ Error en callback por token:", error);
        
        
        localStorage.removeItem("providence_token");
        localStorage.removeItem("providence_user");
        document.cookie = "providence_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        document.cookie = "providence_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        
        setStatus('error');
        
        
        if (error.response?.status === 401) {
          setMessage('Token inválido o expirado');
          setTimeout(() => {
            router.replace("/login?error=invalid_token");
          }, 2000);
        } else if (error.message?.includes('Network')) {
          setMessage('Error de conexión');
          setTimeout(() => {
            router.replace("/login?error=network_error");
          }, 2000);
        } else {
          setMessage('Error en la autenticación');
          setTimeout(() => {
            router.replace("/login?error=auth_failed");
          }, 2000);
        }
      }
    };

    processToken();
  }, [router, searchParams]);

  
  const getUI = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-blue-600 mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Autenticando...</h2>
            <p className="text-gray-600">{message}</p>
            <div className="mt-6">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 animate-pulse"></div>
              </div>
            </div>
          </div>
        );
        
      case 'success':
        return (
          <div className="text-center">
            <div className="text-green-600 text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Éxito!</h2>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500 mt-4">Serás redirigido automáticamente...</p>
          </div>
        );
        
      case 'error':
        return (
          <div className="text-center">
            <div className="text-red-600 text-6xl mb-4">✗</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600">{message}</p>
            <button
              onClick={() => router.replace('/login')}
              className="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Volver al Login
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
        {getUI()}
      </div>
    </div>
  );
}

const Fallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Preparando autenticación...</h2>
      <p className="text-gray-500">Por favor espera</p>
    </div>
  </div>
);

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<Fallback />}>
      <AuthCallbackContent />
    </Suspense>
  );
}