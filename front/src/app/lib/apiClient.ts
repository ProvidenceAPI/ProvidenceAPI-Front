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
      if (status === 401) {
        if (typeof window !== "undefined") {
          const currentPath = window.location.pathname;
          const isAuthPage = [
            "/login",
            "/register",
            "/auth/callback",
            "/forgot-password",
          ].includes(currentPath);
          const isLoginAttempt =
            url?.includes("/auth/signin") || url?.includes("/auth/signup");
          if (!isAuthPage && !isLoginAttempt) {
            localStorage.removeItem("providence_token");
            localStorage.removeItem("providence_user");
            setTimeout(() => {
              window.location.href = "/login";
            }, 1000);
          }
          if (isLoginAttempt) {
            localStorage.removeItem("providence_token");
            localStorage.removeItem("providence_user");
          }
        }
      }
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
