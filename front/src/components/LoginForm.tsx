"use client";

import { useAuth } from "src/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
  const { login, clearError, loading: authLoading } = useAuth();
  const router = useRouter();

  const [loginForm, setLoginForm] =
    useState<LoginFormState>(formInicialState);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setLoginForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
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

  
  const handleGoogleAuth = () => {
    clearError();
    setGoogleLoading(true);

    const googleAuthUrl = `${
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
    }/api/auth/google/login`;

    localStorage.setItem("redirectAfterLogin", window.location.pathname);
    window.location.href = googleAuthUrl;
  };

  const submitHandler = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const result = await login(
        loginForm.email,
        loginForm.password
      );

      setLoginForm(formInicialState);

      if (result.success) {
        await Swal.fire({
          title: "¡Bienvenido!",
          text: result.message,
          icon: "success",
          confirmButtonText: "Continuar",
        });

        router.push("/dashboard");
      } else {
        await Swal.fire({
          title: "Error",
          text: result.message,
          icon: "error",
          confirmButtonText: "Entendido",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      await Swal.fire({
        title: "Error",
        text: "Error inesperado al iniciar sesión",
        icon: "error",
        confirmButtonText: "Reintentar",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isLoadingAny = isLoading || authLoading || googleLoading;

  return (
    <div className="min-h-screen flex">
     
      <div className="hidden md:flex md:w-1/2 bg-black text-white flex-col justify-center px-12 py-20">
        <Link href="/">
          <img src="/logo.png" alt="Logo" className="h-8 mb-10" />
        </Link>

        <h2 className="text-5xl font-bold mb-6">
          BIENVENIDO
          <br />
          DE VUELTA
        </h2>

        <p className="text-gray-400 text-lg">
          Continúa tu transformación. Inicia sesión.
        </p>
      </div>

    
      <div className="w-full md:w-1/2 bg-white flex justify-center items-center px-8">
        <div className="max-w-md w-full">
          <h2 className="text-3xl font-bold mb-2">
            INICIAR SESIÓN
          </h2>
          <p className="text-gray-600 mb-8">
            Ingresa tus credenciales
          </p>

          <form
            onSubmit={submitHandler}
            className="space-y-6"
            noValidate
          >
         
            <input
              type="email"
              name="email"
              value={loginForm.email}
              onChange={changeHandler}
              placeholder="Email"
              disabled={isLoadingAny}
              className="w-full p-3 border rounded-lg"
            />
            {errors.email && (
              <p className="text-red-600 text-sm">
                {errors.email}
              </p>
            )}

           
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={loginForm.password}
              onChange={changeHandler}
              placeholder="Contraseña"
              disabled={isLoadingAny}
              className="w-full p-3 border rounded-lg"
            />
            {errors.password && (
              <p className="text-red-600 text-sm">
                {errors.password}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoadingAny}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-bold disabled:bg-gray-400"
            >
              {isLoadingAny ? "Procesando..." : "Iniciar sesión"}
            </button>

            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isLoadingAny}
              className="w-full border py-3 rounded-lg flex justify-center items-center gap-2"
            >
              Continuar con Google
            </button>

            <p className="text-center text-gray-700">
              ¿No tienes cuenta?{" "}
              <Link
                href="/register"
                className="text-red-600 font-bold"
              >
                Regístrate
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
