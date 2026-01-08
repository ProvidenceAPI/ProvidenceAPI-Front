"use client";

import RegisterDto from "@/interfaces/RegisterDto";
import RegisterFormState from "@/interfaces/RegisterFormState";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const formInicialState = {
  name: "",
  email: "",
  password: "",
  repeatPassword: "",
  address: "",
  phone: "",
};

export default function RegisterForm() {
  const router = useRouter();
  const [registerForm, setRegisterForm] =
    useState<RegisterFormState>(formInicialState);
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    repeatPassword: "",
    address: "",
    phone: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const property = e.target.name;
    const value = e.target.value;

    setRegisterForm({
      ...registerForm,
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
    const newErrors = {
      name: "",
      email: "",
      password: "",
      repeatPassword: "",
      address: "",
      phone: "",
    };
    let isValid = true;

    if (!registerForm.name.trim()) {
      newErrors.name = "Falta el nombre completo";
      isValid = false;
    }

    if (!registerForm.email) {
      newErrors.email = "Falta el correo electrónico";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(registerForm.email)) {
      newErrors.email = "El correo electrónico no es válido";
      isValid = false;
    }

    if (!registerForm.password) {
      newErrors.password = "Falta la contraseña";
      isValid = false;
    } else if (registerForm.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
      isValid = false;
    }

    if (!registerForm.repeatPassword) {
      newErrors.repeatPassword = "Confirma tu contraseña";
      isValid = false;
    } else if (registerForm.password !== registerForm.repeatPassword) {
      newErrors.repeatPassword = "Las contraseñas no coinciden";
      isValid = false;
    }

    if (!registerForm.address.trim()) {
      newErrors.address = "Falta la dirección";
      isValid = false;
    }

    if (!registerForm.phone.trim()) {
      newErrors.phone = "Falta el teléfono";
      isValid = false;
    } else if (!/^[0-9\-\+\(\)\s]+$/.test(registerForm.phone)) {
      newErrors.phone = "Formato de teléfono no válido";
      isValid = false;
    }

    if (!acceptTerms) {
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const postRegister = async (registerDto: RegisterDto) => {
    return await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/users/register`,
      registerDto
    );
  };

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validar el formulario antes de enviar
    if (!validateForm()) {
      if (!acceptTerms) {
        await Swal.fire({
          title: "Acepta los términos",
          text: "Debes aceptar los términos y condiciones para continuar",
          icon: "warning",
          confirmButtonText: "Entendido",
        });
      }
      return;
    }

    setIsLoading(true);

    try {
      await postRegister(registerForm);
      setRegisterForm(formInicialState);
      setAcceptTerms(false);

      await Swal.fire({
        title: "¡Usuario creado con éxito!",
        text: "Tu cuenta ha sido creada correctamente",
        icon: "success",
        confirmButtonText: "Ir al Login",
      });

      router.push("/login");
    } catch (error: any) {
      let errorMessage = "Error al crear el usuario";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
        if (errorMessage.includes("email") || errorMessage.includes("correo")) {
          setErrors({
            ...errors,
            email: "Este correo ya está registrado",
          });
        }
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
          COMIENZA TU
          <br />
          TRANSFORMACIÓN HOY
        </h2>

        <p className="text-gray-400 text-lg leading-relaxed mb-8">
          Únete a miles de miembros que ya han alcanzado sus metas fitness.
        </p>

        <div className="space-y-6">
          <div className="flex items-start space-x-3">
            <div className="bg-[#DC2626] p-2 rounded-full mt-1">
              <span className="text-white">💪</span>
            </div>
            <div>
              <h3 className="font-bold text-lg">Rutina Personalizada</h3>
              <p className="text-gray-400">
                Programa de entrenamiento adaptado a tus objetivos
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="bg-[#DC2626] p-2 rounded-full mt-1">
              <span className="text-white">👥</span>
            </div>
            <div>
              <h3 className="font-bold text-lg">Comunidad Activa</h3>
              <p className="text-gray-400">
                Conecta con personas que comparten tus mismos objetivos
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="bg-[#DC2626] p-2 rounded-full mt-1">
              <span className="text-white">⏰</span>
            </div>
            <div>
              <h3 className="font-bold text-lg">Horario Flexible</h3>
              <p className="text-gray-400">
                Entrena cuando quieras, sin restricciones de horario
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form section */}
      <div className="w-full md:w-1/2 bg-white flex flex-col justify-center px-8 md:px-12 py-20">
        <div className="max-w-md mx-auto w-full">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-black mb-2">
              CREAR CUENTA
            </h2>
            <p className="text-gray-600">
              Únete a Providence Fitness y continúa tu transformación.
            </p>
          </div>

          <form onSubmit={submitHandler} className="space-y-6" noValidate>
            {/* Nombre Completo */}
            <div>
              <label
                className={`block text-sm font-semibold mb-2 ${
                  errors.name ? "text-red-600" : "text-black"
                }`}
              >
                NOMBRE COMPLETO
              </label>
              <div className="relative">
                <span
                  className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
                    errors.name ? "text-red-500" : "text-gray-400"
                  }`}
                >
                  👤
                </span>
                <input
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DC2626] transition ${
                    errors.name
                      ? "border-red-500 bg-red-50 text-red-900 placeholder-red-300"
                      : "border-gray-300 bg-gray-50 text-gray-900 focus:bg-white"
                  }`}
                  type="text"
                  name="name"
                  value={registerForm.name}
                  onChange={changeHandler}
                  placeholder="Ingresa tu nombre"
                  disabled={isLoading}
                />
              </div>
              {errors.name && (
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
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                className={`block text-sm font-semibold mb-2 ${
                  errors.email ? "text-red-600" : "text-black"
                }`}
              >
                CORREO ELECTRÓNICO
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
                  value={registerForm.email}
                  onChange={changeHandler}
                  placeholder="ejemplo@correo.com"
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
                  value={registerForm.password}
                  onChange={changeHandler}
                  placeholder="********"
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

            {/* Repeat Password */}
            <div>
              <label
                className={`block text-sm font-semibold mb-2 ${
                  errors.repeatPassword ? "text-red-600" : "text-black"
                }`}
              >
                REPETIR CONTRASEÑA
              </label>
              <div className="relative">
                <span
                  className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
                    errors.repeatPassword ? "text-red-500" : "text-gray-400"
                  }`}
                >
                  🔒
                </span>
                <input
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DC2626] transition ${
                    errors.repeatPassword
                      ? "border-red-500 bg-red-50 text-red-900 placeholder-red-300"
                      : "border-gray-300 bg-gray-50 text-gray-900 focus:bg-white"
                  }`}
                  type="password"
                  name="repeatPassword"
                  value={registerForm.repeatPassword}
                  onChange={changeHandler}
                  placeholder="********"
                  disabled={isLoading}
                />
              </div>
              {errors.repeatPassword && (
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
                  {errors.repeatPassword}
                </p>
              )}
            </div>

            {/* Dirección */}
            <div>
              <label
                className={`block text-sm font-semibold mb-2 ${
                  errors.address ? "text-red-600" : "text-black"
                }`}
              >
                DIRECCIÓN
              </label>
              <div className="relative">
                <span
                  className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
                    errors.address ? "text-red-500" : "text-gray-400"
                  }`}
                >
                  🏠
                </span>
                <input
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DC2626] transition ${
                    errors.address
                      ? "border-red-500 bg-red-50 text-red-900 placeholder-red-300"
                      : "border-gray-300 bg-gray-50 text-gray-900 focus:bg-white"
                  }`}
                  type="text"
                  name="address"
                  value={registerForm.address}
                  onChange={changeHandler}
                  placeholder="Ingresa tu dirección"
                  disabled={isLoading}
                />
              </div>
              {errors.address && (
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
                  {errors.address}
                </p>
              )}
            </div>

            {/* Teléfono */}
            <div>
              <label
                className={`block text-sm font-semibold mb-2 ${
                  errors.phone ? "text-red-600" : "text-black"
                }`}
              >
                TELÉFONO
              </label>
              <div className="relative">
                <span
                  className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
                    errors.phone ? "text-red-500" : "text-gray-400"
                  }`}
                >
                  📱
                </span>
                <input
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DC2626] transition ${
                    errors.phone
                      ? "border-red-500 bg-red-50 text-red-900 placeholder-red-300"
                      : "border-gray-300 bg-gray-50 text-gray-900 focus:bg-white"
                  }`}
                  type="tel"
                  name="phone"
                  value={registerForm.phone}
                  onChange={changeHandler}
                  placeholder="011-1234-5678"
                  disabled={isLoading}
                />
              </div>
              {errors.phone && (
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
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Términos y Condiciones */}
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="terms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-gray-300 cursor-pointer"
                disabled={isLoading}
              />
              <label htmlFor="terms" className="text-sm text-gray-700">
                Acepto los términos y condiciones y la política de privacidad
              </label>
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
                  Creando cuenta...
                </span>
              ) : (
                <>
                  CREAR CUENTA <span className="ml-2">→</span>
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
                  O regístrate con
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className="flex items-center justify-center py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                disabled={isLoading}
              >
                <span className="mr-2">G</span>
                <span className="text-sm font-medium">Google</span>
              </button>
              <button
                type="button"
                className="flex items-center justify-center py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                disabled={isLoading}
              >
                <span className="mr-2">f</span>
                <span className="text-sm font-medium">Facebook</span>
              </button>
            </div>

            {/* Login Link */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-gray-700">
                ¿Ya tienes una cuenta?{" "}
                <Link
                  href="/login"
                  className="text-[#DC2626] font-bold hover:underline"
                >
                  Iniciar Sesión
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}