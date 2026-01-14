"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "src/contexts/AuthContext";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleGoogleCallback } = useAuth();

  useEffect(() => {
    const processGoogleCallback = async () => {
      const code = searchParams.get("code");
      const error = searchParams.get("error");

      if (error) {
        console.error("Error de Google:", error);
        router.push(`/login?error=google-auth-failed&message=${encodeURIComponent(error)}`);
        return;
      }

      if (!code) {
        console.error("No se recibió código de autorización");
        router.push("/login?error=no-code");
        return;
      }

      try {
        const result = await handleGoogleCallback(code);
        
        if (result.success) {
          // Redirigir después de un breve delay
          setTimeout(() => {
            router.push("/dashboard");
          }, 500);
        } else {
          router.push(`/login?error=oauth-failed&message=${encodeURIComponent(result.message)}`);
        }
      } catch (err) {
        console.error("Error procesando Google callback:", err);
        router.push(`/login?error=oauth-failed&message=${encodeURIComponent(err instanceof Error ? err.message : "Error desconocido")}`);
      }
    };

    processGoogleCallback();
  }, [router, searchParams, handleGoogleCallback]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Completando autenticación
        </h2>
        <p className="text-gray-600">
          Estamos finalizando tu inicio de sesión con Google...
        </p>
        <p className="text-sm text-gray-500 mt-4">
          Esto puede tomar unos segundos
        </p>
      </div>
    </div>
  );
}