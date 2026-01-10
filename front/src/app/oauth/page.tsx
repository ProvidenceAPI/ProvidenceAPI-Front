"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;

    const handleCallback = () => {
      try {
        const token = searchParams.get("token");
        const userEncoded = searchParams.get("user");

        console.log("==========================================");
        console.log("🔍 DEBUG - OAuth Callback");
        console.log("==========================================");
        console.log("Token recibido:", token ? "SÍ" : "NO");
        console.log("User encoded recibido:", userEncoded ? "SÍ" : "NO");
        console.log("User encoded valor:", userEncoded);
        console.log("==========================================");

        if (!token) {
          console.error("❌ No se recibió token de Google");
          router.push("/login?error=no-token");
          return;
        }

        console.log("✅ Token recibido de Google");
        hasProcessed.current = true;

        // Guardar el token
        localStorage.setItem("providence_token", token);

        // Decodificar usuario si viene en la URL
        let userData;
        if (userEncoded) {
          try {
            // Decodificar desde base64
            const decoded = atob(userEncoded);
            console.log("📦 Decoded JSON string:", decoded);

            userData = JSON.parse(decoded);
            console.log("✅ Datos de usuario decodificados:", userData);
            console.log("   - Nombre:", userData.name);
            console.log("   - Email:", userData.email);
            console.log("   - Foto:", userData.profileImage);
          } catch (decodeError) {
            console.error("❌ Error decodificando usuario:", decodeError);
            // Fallback si falla la decodificación
            userData = {
              id: "google-user",
              name: "Usuario de Google (fallback)",
              email: "user@gmail.com",
              rol: "user",
              status: "Active",
            };
            console.log("⚠️ Usando datos de fallback");
          }
        } else {
          // Fallback si no viene el usuario
          console.warn("⚠️ No se recibieron datos de usuario del backend");
          userData = {
            id: "google-user",
            name: "Usuario de Google (sin datos del backend)",
            email: "user@gmail.com",
            rol: "user",
            status: "Active",
          };
        }

        // Guardar usuario
        localStorage.setItem("providence_user", JSON.stringify(userData));
        console.log("💾 Usuario guardado en localStorage:", userData);

        console.log(
          "✅ Autenticación completada, redirigiendo al dashboard..."
        );
        console.log("==========================================");

        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 2000); // 2 segundos para ver los logs
      } catch (error: any) {
        console.error("❌ Error en OAuth callback:", error);
        router.push("/login?error=auth-failed");
      }
    };

    handleCallback();
  }, []);

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
        <p className="text-sm text-gray-500 bg-gray-100 p-4 rounded">
          ⚠️ MODO DEBUG: Abre la consola (F12) para ver detalles
        </p>
      </div>
    </div>
  );
}
