"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { useAuth } from "src/contexts/AuthContext";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasProcessed = useRef(false);
  const { setLogin } = useAuth();

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const token = searchParams.get("token");

    if (!token) {
      router.replace("/login?error=missing_token");
      return;
    }

    const handleCallback = async () => {
      try {
        
        localStorage.setItem("providence_token", token);

        
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

        const response = await axios.get(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.data) {
          throw new Error("No se pudo obtener el usuario");
        }

      
        if (setLogin) {
          setLogin(response.data, token);
        }

       
        router.replace("/dashboard");
      } catch (error: any) {
        console.error("❌ OAuth error:", error.response?.data || error.message);

        localStorage.removeItem("providence_token");
        localStorage.removeItem("providence_user");

        router.replace("/login?error=oauth_failed");
      }
    };

    handleCallback();
  }, [router, searchParams, setLogin]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Iniciando sesión con Google...
        </h2>
        <p className="text-gray-600">
          Por favor espera mientras completamos tu autenticación.
        </p>
      </div>
    </div>
  );
}