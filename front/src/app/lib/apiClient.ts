import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      const url = error.config?.url;
      const data = error.response.data;

      // Solo loggear el error, sin mensajes adicionales para login/signup
      const isAuthEndpoint = url?.includes("/auth/signin") || url?.includes("/auth/signup");
      
      if (!isAuthEndpoint) {
        console.error(`❌ Error ${status} en ${url}:`, data);
      }

      if (status === 401) {
        if (typeof window !== "undefined") {
          const currentPath = window.location.pathname;
          const isAuthPage = [
            "/login",
            "/register",
            "/auth/callback",
            "/forgot-password",
          ].includes(currentPath);
          
          // Si es un intento de login/signup, marcar el error como manejado
          if (isAuthEndpoint) {
            // Marcar el error como manejado para evitar que Next.js lo muestre en la consola
            (error as any).isHandled = true;
            (error as any).isAuthError = true;
            // No limpiar token ni mostrar mensaje - es un error de credenciales, no de token
            return Promise.reject(error);
          }
          
          // Si NO es una página de auth ni un intento de login, entonces es un token inválido
          if (!isAuthPage) {
            console.error("🔒 No autorizado - Token inválido o expirado");
            localStorage.removeItem("providence_token");
            localStorage.removeItem("providence_user");
            setTimeout(() => {
              window.location.href = "/login";
            }, 1000);
          }
        }
      }
    } else if (error.request) {
      console.error("❌ No se recibió respuesta del servidor:", error.request);
    } else {
      console.error("❌ Error configurando request:", error.message);
    }
    return Promise.reject(error);
  },
);

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (config.data instanceof FormData && config.headers) {
      delete config.headers["Content-Type"];
    }
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("providence_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    console.error("❌ Error en request interceptor:", error);
    return Promise.reject(error);
  },
);

export const getAuthHeaders = () => {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("providence_token")
      : null;
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

export { API_URL };
