"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAppContext } from "src/contexts/AppContext";
import Swal from "sweetalert2";

type LoginFormState = {
  email: string;
  password: string;
};

const formInicialState: LoginFormState = {
  email: "",
  password: "",
};

export default function LoginForm() {
  const { login, loginLoading, authLoading } = useAppContext();
  const router = useRouter();
  const [loginForm, setLoginForm] = useState<LoginFormState>(formInicialState);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string>("");
  const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setLoginForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (apiError) {
      setApiError("");
    }
  };

  const validateForm = () => {
    const newErrors = { email: "", password: "" };
    let isValid = true;
    if (!loginForm.email.trim()) {
      newErrors.email = "Falta el correo electrónico";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(loginForm.email)) {
      newErrors.email = "El correo electrónico no es válido";
      isValid = false;
    }
    if (!loginForm.password.trim()) {
      newErrors.password = "Falta la contraseña";
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };

  const handleGoogleAuth = () => {
    setGoogleLoading(true);
    setApiError("");
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const googleAuthUrl = `${base}/api/auth/google/login`;
    localStorage.setItem("redirectAfterLogin", window.location.pathname);
    window.location.href = googleAuthUrl;
  };

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setApiError("");
    if (!validateForm()) return;
    try {
      const result = await login(loginForm.email, loginForm.password);
      if (result.success) {
        setLoginForm(formInicialState);
        await Swal.fire({
          title: "¡Bienvenido!",
          text: "Inicio de sesión exitoso",
          icon: "success",
          confirmButtonText: "Continuar",
        });
        router.push("/dashboard");
      } else {
        // Manejar error cuando login retorna success: false
        const errorMessage = result.message || "Email o contraseña incorrectos";
        setApiError(errorMessage);
        await Swal.fire({
          title: "Error",
          text: errorMessage,
          icon: "error",
          confirmButtonText: "Reintentar",
        });
      }
    } catch (error: any) {
      // No loggear errores 401 de autenticación (son esperados)
      if (error.response?.status !== 401 && !error.isAuthError) {
        console.error("Login error:", error);
      }
      
      let errorMessage = "Error al iniciar sesión";
      if (error.response?.status === 401 || error.isAuthError) {
        errorMessage = "Email o contraseña incorrectos";
      } else if (error.message?.includes("Credenciales")) {
        errorMessage = "Email o contraseña incorrectos";
      } else if (
        error.message?.includes("NetworkError") ||
        error.message?.includes("Failed to fetch")
      ) {
        errorMessage = "Error de conexión. Verifica tu internet";
      } else if (error.message?.includes("No se recibió token")) {
        errorMessage = "Error del servidor. Contacta al administrador";
      } else if (error.message) {
        errorMessage = error.message;
      }
      setApiError(errorMessage);
      await Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "Reintentar",
      });
    }
  };
  const isLoadingAny = loginLoading || googleLoading || authLoading;

  return (
    <div className="min-h-screen flex">
      <div className="hidden md:flex md:w-1/2 bg-black text-white flex-col justify-center items-center px-12 py-20">
        <div className="w-full max-w-lg mx-auto text-center">
          <div className="text-2xl font-bold tracking-[0.2em] mb-8">
            <Link
              href="/"
              className="inline-flex flex-col items-center hover:no-underline"
            >
              <Image
                src="/logo.png"
                alt="Providence Fitness Logo"
                width={400}
                height={100}
                className="w-90h-auto"
              />
            </Link>
          </div>
          <h2 className="text-5xl font-bold leading-tight mb-6">
            BIENVENIDO
            <br />
            DE VUELTA
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            Continúa tu transformación. Inicia sesión y accede a tu
            entrenamiento.
          </p>
        </div>
      </div>
      {/* Right Panel - Form */}
      <div className="w-full md:w-1/2 bg-white flex justify-center items-center px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="max-w-md w-full">
          {/* Logo para mobile */}
          <div className="md:hidden mb-6 text-center">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="Logo"
                width={120}
                height={40}
                className="h-8 w-auto mx-auto"
              />
            </Link>
            <h1 className="text-2xl font-bold mt-2">PROVIDENCE FITNESS</h1>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-center">
            INICIAR SESIÓN
          </h2>
          <p className="text-gray-600 mb-6 sm:mb-8 text-center">
            Ingresa tus credenciales
          </p>
          {/* Mostrar error de API si existe */}
          {apiError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg animate-fadeIn">
              <div className="flex items-center">
                <span className="text-red-500 mr-2">⚠️</span>
                <p className="text-red-600 text-sm">{apiError}</p>
              </div>
            </div>
          )}
          <form
            onSubmit={submitHandler}
            className="space-y-5 sm:space-y-6"
            noValidate
          >
            {/* Email */}
            <div>
              <input
                type="email"
                name="email"
                value={loginForm.email}
                onChange={changeHandler}
                placeholder="Email"
                disabled={isLoadingAny}
                className={`w-full p-3 border rounded-lg text-sm sm:text-base ${
                  errors.email ? "border-red-500 bg-red-50" : "border-gray-300"
                } ${isLoadingAny ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
              />
              {errors.email && (
                <p className="text-red-600 text-xs sm:text-sm mt-1 pl-1 animate-fadeIn">
                  {errors.email}
                </p>
              )}
            </div>
            {/* Password */}
            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={loginForm.password}
                  onChange={changeHandler}
                  placeholder="Contraseña"
                  disabled={isLoadingAny}
                  className={`w-full p-3 border rounded-lg pr-10 text-sm sm:text-base ${
                    errors.password
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  } ${isLoadingAny ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoadingAny}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed text-lg"
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-600 text-xs sm:text-sm mt-1 pl-1 animate-fadeIn">
                  {errors.password}
                </p>
              )}
            </div>
            {/* Recordar contraseña */}
            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm sm:text-base">
                <input type="checkbox" className="h-4 w-4 text-red-600 mr-2" />
                <span className="text-gray-700">Recordarme</span>
              </label>
              <button
                type="button"
                onClick={() => router.push("/forgot-password")}
                className="text-sm text-red-600 hover:text-red-700 disabled:text-gray-400"
                disabled={isLoadingAny}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            {/* Botón de inicio de sesión */}
            <button
              type="submit"
              disabled={isLoadingAny}
              className={`w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center text-sm sm:text-base ${
                isLoadingAny ? "opacity-80" : ""
              }`}
            >
              {loginLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Iniciando sesión...
                </>
              ) : googleLoading ? (
                "Redirigiendo a Google..."
              ) : authLoading ? (
                "Cargando..."
              ) : (
                "Iniciar sesión"
              )}
            </button>
            {/* Separador */}
            <div className="relative my-4 sm:my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-500">
                  O continúa con
                </span>
              </div>
            </div>
            {/* Botón Google */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isLoadingAny}
              className="flex items-center justify-center w-full py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {googleLoading ? (
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
                  Conectando con Google...
                </span>
              ) : (
                <>
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
                  <span className="text-sm font-medium">
                    Continuar con Google
                  </span>
                </>
              )}
            </button>
            <p className="text-center text-gray-700">
              ¿No tienes cuenta?{" "}
              <Link href="/register" className="text-red-600 font-bold">
                Regístrate
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
