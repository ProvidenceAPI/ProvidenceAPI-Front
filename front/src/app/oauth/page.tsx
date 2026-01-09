"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppContext } from "src/contexts/AuthContext";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setLogin } = useAppContext();

  useEffect(() => {
    const handleCallback = async () => {
      // Obtener el token de la URL
      const token = searchParams.get("token");

      if (!token) {
        console.error("❌ No se recibió token de Google");
        router.push("/login?error=no-token");
        return;
      }

      try {
        console.log("✅ Token recibido de Google:", token);

        // Guardar el token
        localStorage.setItem("providence_token", token);

        // Obtener el perfil del usuario usando el token
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
        const response = await fetch(`${API_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Error obteniendo perfil del usuario");
        }

        const userData = await response.json();
        console.log("👤 Usuario obtenido:", userData);

        // Guardar en contexto
        if (setLogin) {
          setLogin(userData, token);
        }

        // Redirigir al dashboard
        router.push("/dashboard");
      } catch (error) {
        console.error("❌ Error en OAuth callback:", error);
        router.push("/login?error=auth-failed");
      }
    };

    handleCallback();
  }, [searchParams, router, setLogin]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
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
