// app/auth/callback/page.tsx
"use client";

import { Suspense, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "src/app/lib/apiClient";

const AUTH_CALLBACK_KEY = "auth_callback_processing";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasProcessed = useRef(false);


  const handleTokenCallback = useCallback(
    async (token: string) => {
      try {
        console.log("🔄 Procesando token de Google...");

        localStorage.setItem("providence_token", token);

        const { data: userData } = await apiClient.get("/api/auth/me");

        if (userData.Rol) {
          userData.Rol = userData.Rol.toLowerCase();
          userData.role = userData.Rol;
        }

        localStorage.setItem("providence_user", JSON.stringify(userData));
        console.log("✅ Login por Google exitoso:", userData.email);

        sessionStorage.removeItem(AUTH_CALLBACK_KEY);
        router.replace("/dashboard");
      } catch (error: any) {
        console.error("❌ Error en callback por token:", error);
        localStorage.removeItem("providence_token");
        localStorage.removeItem("providence_user");
        sessionStorage.removeItem(AUTH_CALLBACK_KEY);
        router.replace("/login?error=token_failed");
      }
    },
    [router],
  );

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const token = searchParams.get("token");
    const error = searchParams.get("error");

    console.log("🔍 Google Callback Params:", { token, error });

    if (error) {
      console.error("❌ OAuth error from server:", error);
      router.replace("/login?error=oauth_failed");
      return;
    }

    if (token) {
      
      if (typeof sessionStorage !== "undefined" && sessionStorage.getItem(AUTH_CALLBACK_KEY)) {
        return;
      }
      sessionStorage.setItem(AUTH_CALLBACK_KEY, "1");
      handleTokenCallback(token);
      return;
    }

    console.error("❌ No se recibió token");
    router.replace("/login?error=missing_params");
  }, [router, searchParams, handleTokenCallback]);

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
        <div className="mt-4 text-sm text-gray-500">
          <p>🔍 Verifica la consola para más detalles</p>
        </div>
      </div>
    </div>
  );
}

const Fallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center max-w-md mx-auto p-8">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Cargando...</h2>
      <p className="text-gray-600">Completando autenticación.</p>
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
