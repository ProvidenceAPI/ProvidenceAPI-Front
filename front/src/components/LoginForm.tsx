// src/components/LoginForm.tsx
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
  const { setLogin } = useAppContext(); // Ahora setLogin existe
  const router = useRouter();
  const [loginForm, setLoginForm] = useState<LoginFormState>(formInicialState);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginForm({
      ...loginForm,
      [name]: value,
    });

    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = { email: "", password: "" };
    let isValid = true;

    if (!loginForm.email) {
      newErrors.email = "Ingresa tu email";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(loginForm.email)) {
      newErrors.email = "Email inválido";
      isValid = false;
    }

    if (!loginForm.password) {
      newErrors.password = "Ingresa tu contraseña";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
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
      
      // Usa el tipo correcto para la respuesta
      const loginInfo = result.data;
      setLoginForm(formInicialState);
      
      // Ahora loginInfo tiene user y token definidos
      if (loginInfo.user && loginInfo.token) {
        // Llama a setLogin con los datos correctos
        setLogin(loginInfo.user, loginInfo.token);
        
        await Swal.fire({
          title: '¡Bienvenido!',
          text: 'Sesión iniciada correctamente',
          icon: 'success',
          confirmButtonText: 'Continuar'
        });
        
        router.push("/home");
      } else {
        await Swal.fire({
          title: 'Error',
          text: 'Usuario no encontrado en la respuesta',
          icon: 'error',
          confirmButtonText: 'Entendido'
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
        title: 'Error',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'Reintentar'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-sm">
        <h2 className="text-xl font-bold text-center mb-6">
          Iniciar Sesión
        </h2>

        <form onSubmit={submitHandler} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm mb-1 font-medium text-gray-700">Email</label>
            <input
              className={`w-full p-3 border rounded-md ${errors.email ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-[#DC2626] focus:border-transparent`}
              type="email"
              name="email"
              value={loginForm.email}
              onChange={changeHandler}
              placeholder="ejemplo@email.com"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-sm mb-1 font-medium text-gray-700">Contraseña</label>
            <input
              className={`w-full p-3 border rounded-md ${errors.password ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-[#DC2626] focus:border-transparent`}
              type="password"
              name="password"
              value={loginForm.password}
              onChange={changeHandler}
              placeholder="Tu contraseña"
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Botón */}
          <button
            type="submit"
            className={`w-full p-3 rounded-md font-medium transition-colors ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#DC2626] hover:bg-[#B01C1C] text-white'}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Procesando...
              </span>
            ) : 'Acceder'}
          </button>

          {/* Enlace a registro */}
          <div className="text-center pt-4">
            <p className="text-gray-600 text-sm">
              ¿No tienes cuenta?{" "}
              <Link 
                href="/register" 
                className="text-[#DC2626] font-medium hover:underline"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}