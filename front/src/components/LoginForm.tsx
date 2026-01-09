"use client";

import { useAppContext } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

// Tipos locales
type LoginFormState = {
  email: string;
  password: string;
};

// Tipo para la respuesta de la API
type ApiLoginResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role?: "user" | "admin";
  };
  token: string;
  message?: string;
};

const formInicialState: LoginFormState = {
  email: "",
  password: "",
};

export default function LoginForm() {
  const { setLogin } = useAppContext();
  const router = useRouter();
  const [loginForm, setLoginForm] = useState<LoginFormState>(formInicialState);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const property = e.target.name;
    const value = e.target.value;

    setLoginForm({
      ...loginForm,
      [property]: value,
    });

    // Limpiar error cuando el usuario empiece a escribir
    if (errors[property as keyof typeof errors]) {
      setErrors({
        ...errors,
        [property]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = { email: "", password: "" };
    let isValid = true;

    if (!loginForm.email) {
      newErrors.email = "Falta el correo electrónico";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(loginForm.email)) {
      newErrors.email = "El correo electrónico no es válido";
      isValid = false;
    }

    if (!loginForm.password) {
      newErrors.password = "Falta la contraseña";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Función para Google Auth
  const handleGoogleAuth = () => {
    Swal.fire({
      title: "Google Auth",
      text: "Esta funcionalidad estará disponible próximamente",
      icon: "info",
      confirmButtonText: "Entendido",
    });
    // router.push("/api/auth/google"); // Ejemplo de redirección
  };

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const result = await axios.post<ApiLoginResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/users/login`,
        loginForm
      );

      const loginInfo = result.data;
      setLoginForm(formInicialState);

      if (loginInfo.user && loginInfo.token) {
        setLogin(loginInfo.user, loginInfo.token);

        await Swal.fire({
          title: "¡Bienvenido!",
          text: "Sesión iniciada correctamente",
          icon: "success",
          confirmButtonText: "Continuar",
        });

        router.push("/home");
      } else {
        await Swal.fire({
          title: "Error",
          text: "Usuario no encontrado en la respuesta",
          icon: "error",
          confirmButtonText: "Entendido",
        });
      }
    } catch (error: any) {
      console.error("Login error:", error);

      let errorMessage = "Email o contraseña incorrectos";
      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.request) {
        errorMessage = "Error de conexión con el servidor";
      }

      await Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "Reintentar",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Black section */}
      <div className="hidden md:flex md:w-1/2 bg-black text-white flex-col justify-center px-12 py-20">
        <div className="text-2xl font-bold tracking-[0.2em]">
          <Link href="/" className="flex flex-col hover:no-underline">
            <img
              src="/logo.png"
              alt="Providence Fitness Logo"
              className="h-8 w-auto"
            />
          </Link>
        </div>
        <h2 className="text-5xl font-bold leading-tight mb-6">
          BIENVENIDO
          <br />
          DE VUELTA
        </h2>

        <p className="text-gray-400 text-lg leading-relaxed">
          Continúa tu transformación. Inicia sesión y accede a tu entrenamiento.
        </p>
      </div>

      {/* Right side - Form section */}
      <div className="w-full md:w-1/2 bg-white flex flex-col justify-center px-8 md:px-12 py-20">
        <div className="max-w-md mx-auto w-full">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-black mb-2">
              INICIAR SESIÓN
            </h2>
            <p className="text-gray-600">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          <form onSubmit={submitHandler} className="space-y-6" noValidate>
            {/* Email */}
            <div>
              <label
                className={`block text-sm font-semibold mb-2 ${
                  errors.email ? "text-red-600" : "text-black"
                }`}
              >
                EMAIL
              </label>
              <div className="relative">
                <span
                  className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
                    errors.email ? "text-red-500" : "text-gray-400"
                  }`}
                >
                  ✉️
                </span>
                <input
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DC2626] transition ${
                    errors.email
                      ? "border-red-500 bg-red-50 text-red-900 placeholder-red-300"
                      : "border-gray-300 bg-gray-50 text-gray-900 focus:bg-white"
                  }`}
                  type="email"
                  name="email"
                  value={loginForm.email}
                  onChange={changeHandler}
                  placeholder="tu@email.com"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                className={`block text-sm font-semibold mb-2 ${
                  errors.password ? "text-red-600" : "text-black"
                }`}
              >
                CONTRASEÑA
              </label>
              <div className="relative">
                <span
                  className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
                    errors.password ? "text-red-500" : "text-gray-400"
                  }`}
                >
                  🔒
                </span>
                <input
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DC2626] transition ${
                    errors.password
                      ? "border-red-500 bg-red-50 text-red-900 placeholder-red-300"
                      : "border-gray-300 bg-gray-50 text-gray-900 focus:bg-white"
                  }`}
                  type="password"
                  name="password"
                  value={loginForm.password}
                  onChange={changeHandler}
                  placeholder="•••••••"
                  disabled={isLoading}
                />
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember me and Forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                  disabled={isLoading}
                />
                <span className="text-sm text-gray-700">Recuérdame</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-[#DC2626] font-semibold hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full py-3 rounded-lg font-bold text-white text-lg transition-all uppercase tracking-wider ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#DC2626] hover:bg-[#B01C1C]"
              }`}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Procesando...
                </span>
              ) : (
                <>
                  INICIAR SESIÓN <span className="ml-2">→</span>
                </>
              )}
            </button>

            {/* Social Login */}
            <div className="relative py-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  O continúa con
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <button
                type="button"
                onClick={handleGoogleAuth}
                className="flex items-center justify-center py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                disabled={isLoading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-sm font-medium">Continuar con Google</span>
              </button>
            </div>

            {/* Register Link */}
            <div className="text-center pt-2">
              <p className="text-gray-700">
                ¿No tienes una cuenta?{" "}
                <Link
                  href="/register"
                  className="text-[#DC2626] font-bold hover:underline"
                >
                  Regístrate aquí
                </Link>
              </p>
            </div>

            {/* Back Link */}
            <div className="text-center pt-4 border-t border-gray-200">
              <Link
                href="/"
                className="text-sm text-gray-600 hover:text-gray-900 transition inline-flex items-center"
              >
                <span className="mr-1">←</span> Volver al sitio web
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}