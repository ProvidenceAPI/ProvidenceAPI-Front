"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { useAppContext } from "src/contexts/AuthContext";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasProcessed = useRef(false);
  const { setLogin } = useAppContext();

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const token = searchParams.get("token");

    if (!token) {
      console.error("❌ No se recibió token");
      router.push("/login?error=no-token");
      return;
    }

    const handleCallback = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

        const response = await axios.get(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.data) {
          throw new Error("No se pudo obtener el usuario");
        }

        console.log("✅ Usuario obtenido:", response.data.email);

        if (setLogin) {
          setLogin(response.data, token);
        }

        await new Promise(resolve => setTimeout(resolve, 100));

        router.push("/dashboard");
        router.refresh();
        
      } catch (err: any) {
        console.error("❌ Error:", err.response?.data || err.message);
        localStorage.removeItem("providence_token");
        localStorage.removeItem("providence_user");
        router.push("/login?error=oauth-failed");
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
        <p className="text-gray-600 mb-4">
          Por favor espera mientras completamos tu autenticación.
        </p>
      </div>
    </div>
  );
}
