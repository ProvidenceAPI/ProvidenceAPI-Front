"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "src/contexts/AuthContext";
import axios from "axios";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setLogin } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
  
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processGoogleCallback = async () => {

      const token = searchParams.get("token");
      const error = searchParams.get("error");

      if (error) {
        console.error("❌ Error de Google:", error);
        router.push(`/login?error=google-auth-failed&message=${encodeURIComponent(error)}`);
        return;
      }

      if (!token) {
        console.error("❌ No se recibió token de autorización");
        router.push("/login?error=no-token");
        return;
      }

      try {
        console.log("✅ Token recibido, obteniendo usuario...");


        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
        
        const response = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.data) {
          throw new Error("No se pudo obtener datos del usuario");
        }

        console.log("✅ Usuario obtenido:", response.data.email);


        if (setLogin) {
          setLogin(response.data, token);
        }


        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 500);

      } catch (err: any) {
        console.error("❌ Error procesando Google callback:", err);
        const errorMessage = err.response?.data?.message || err.message || "Error desconocido";
        

        localStorage.removeItem("providence_token");
        localStorage.removeItem("providence_user");
        
        router.push(`/login?error=oauth-failed&message=${encodeURIComponent(errorMessage)}`);
      }
    };

    processGoogleCallback();
  }, [router, searchParams, setLogin]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Iniciando sesión con Google...
        </h2>
        <p className="text-gray-600 mb-4">
          Estamos finalizando tu autenticación, por favor espera.
        </p>
        <p className="text-sm text-gray-500">
          Esto puede tomar unos segundos
        </p>
      </div>
    </div>
  );
}