"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

import RegisterDto from "@/interfaces/RegisterDto";
import RegisterFormState from "@/interfaces/RegisterFormState";

// Definir interfaces actualizadas
interface FormErrors {
  name: string;
  lastName: string;
  email: string;
  password: string;
  repeatPassword: string;
  address: string;
  phone: string;
  dni: string;
  gender: string;
  birthDate: string;
}

const formInicialState: RegisterFormState = {
  name: "",
  lastName: "",
  email: "",
  password: "",
  repeatPassword: "",
  address: "",
  phone: "",
  dni: "",
  gender: "",
  birthDate: "",
};

const initialErrors: FormErrors = {
  name: "",
  lastName: "",
  email: "",
  password: "",
  repeatPassword: "",
  address: "",
  phone: "",
  dni: "",
  gender: "",
  birthDate: "",
};

export default function RegisterForm() {
  const router = useRouter();
  const [registerForm, setRegisterForm] = useState<RegisterFormState>(formInicialState);
  const [errors, setErrors] = useState<FormErrors>(initialErrors);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailExists, setEmailExists] = useState(false);

  const changeHandler = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const property = e.target.name;
    const value = e.target.value;

    setRegisterForm({
      ...registerForm,
      [property]: value,
    });

    // Limpiar error cuando el usuario empiece a escribir
    if (errors[property as keyof FormErrors]) {
      setErrors({
        ...errors,
        [property]: "",
      });
    }

    // Si es email, verificar si ya existe después de un delay
    if (property === "email" && value.includes("@")) {
      checkEmailAvailability(value);
    }
  };

  const checkEmailAvailability = async (email: string) => {
    setEmailChecking(true);
    try {
      // Simulación de verificación (remover en producción)
      setTimeout(() => {
        setEmailChecking(false);
        setEmailExists(false);
      }, 500);
    } catch (error) {
      setEmailChecking(false);
    }
  };

  const validateForm = () => {
    const newErrors = { ...initialErrors };
    let isValid = true;

    // Validación de nombre
    if (!registerForm.name.trim()) {
      newErrors.name = "Falta el nombre";
      isValid = false;
    }

    // Validación de apellido
    if (!registerForm.lastName.trim()) {
      newErrors.lastName = "Falta el apellido";
      isValid = false;
    }

    // Validación de email
    if (!registerForm.email) {
      newErrors.email = "Falta el correo electrónico";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(registerForm.email)) {
      newErrors.email = "El correo electrónico no es válido";
      isValid = false;
    } else if (emailExists) {
      newErrors.email = "Este correo ya está registrado";
      isValid = false;
    }

    // Validación de contraseña (8-12 caracteres)
    if (!registerForm.password) {
      newErrors.password = "Falta la contraseña";
      isValid = false;
    } else if (registerForm.password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres";
      isValid = false;
    } else if (registerForm.password.length > 12) {
      newErrors.password = "La contraseña no debe exceder 12 caracteres";
      isValid = false;
    }

    // Validación de confirmación de contraseña
    if (!registerForm.repeatPassword) {
      newErrors.repeatPassword = "Confirma tu contraseña";
      isValid = false;
    } else if (registerForm.password !== registerForm.repeatPassword) {
      newErrors.repeatPassword = "Las contraseñas no coinciden";
      isValid = false;
    }

    // Validación de dirección
    if (!registerForm.address.trim()) {
      newErrors.address = "Falta la dirección";
      isValid = false;
    }

    // Validación de teléfono
    if (!registerForm.phone.trim()) {
      newErrors.phone = "Falta el teléfono";
      isValid = false;
    } else if (!/^[0-9\-\+\(\)\s]+$/.test(registerForm.phone)) {
      newErrors.phone = "Formato de teléfono no válido";
      isValid = false;
    }

    // Validación de DNI
    if (!registerForm.dni.trim()) {
      newErrors.dni = "Falta el DNI";
      isValid = false;
    } else if (!/^\d{7,8}$/.test(registerForm.dni.replace(/\D/g, ''))) {
      newErrors.dni = "DNI no válido (7-8 dígitos)";
      isValid = false;
    }

    // Validación de género
    if (!registerForm.gender) {
      newErrors.gender = "Selecciona tu género";
      isValid = false;
    }

    // Validación de fecha de nacimiento
    if (!registerForm.birthDate) {
      newErrors.birthDate = "Falta la fecha de nacimiento";
      isValid = false;
    } else {
      const birthDate = new Date(registerForm.birthDate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 16) {
        newErrors.birthDate = "Debes tener al menos 16 años";
        isValid = false;
      } else if (age > 100) {
        newErrors.birthDate = "Fecha de nacimiento no válida";
        isValid = false;
      }
    }

    // Validación de términos y condiciones
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

  const handleGoogleAuth = () => {
    Swal.fire({
      title: "Google Auth",
      text: "Esta funcionalidad estará disponible próximamente",
      icon: "info",
      confirmButtonText: "Entendido",
    });
  };

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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
      const registerDto: RegisterDto = {
        name: registerForm.name,
        lastName: registerForm.lastName,
        email: registerForm.email,
        password: registerForm.password,
        address: registerForm.address,
        phone: registerForm.phone,
        dni: registerForm.dni,
        gender: registerForm.gender,
        birthDate: registerForm.birthDate,
      };

      await postRegister(registerDto);
      setRegisterForm(formInicialState);
      setAcceptTerms(false);

      await Swal.fire({
        title: "¡Usuario creado con éxito!",
        text: "Te hemos enviado un email de confirmación. Por favor, revisa tu bandeja de entrada.",
        icon: "success",
        confirmButtonText: "Ir al Login",
      });

      setTimeout(() => {
        router.push("/login");
      }, 2000);

    } catch (error: any) {
      let errorMessage = "Error al crear el usuario";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
        if (errorMessage.includes("email") || errorMessage.includes("correo")) {
          setErrors({
            ...errors,
            email: "Este correo ya está registrado",
          });
          setEmailExists(true);
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
      <div className="w-full md:w-1/2 bg-white flex flex-col justify-center px-8 md:px-12 py-20 overflow-y-auto">
        <div className="max-w-md mx-auto w-full">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-black mb-2">
              CREAR CUENTA
            </h2>
            <p className="text-gray-600">
              Completa todos los campos para unirte a Providence Fitness.
            </p>
          </div>

          <form onSubmit={submitHandler} className="space-y-6" noValidate>
            {/* Nombre y Apellido en una fila */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre */}
              <div>
                <label
                  className={`block text-sm font-semibold mb-2 ${
                    errors.name ? "text-red-600" : "text-black"
                  }`}
                >
                  NOMBRE
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
                    placeholder="Nombre"
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

              {/* Apellido */}
              <div>
                <label
                  className={`block text-sm font-semibold mb-2 ${
                    errors.lastName ? "text-red-600" : "text-black"
                  }`}
                >
                  APELLIDO
                </label>
                <div className="relative">
                  <span
                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
                      errors.lastName ? "text-red-500" : "text-gray-400"
                    }`}
                  >
                    👤
                  </span>
                  <input
                    className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DC2626] transition ${
                      errors.lastName
                        ? "border-red-500 bg-red-50 text-red-900 placeholder-red-300"
                        : "border-gray-300 bg-gray-50 text-gray-900 focus:bg-white"
                    }`}
                    type="text"
                    name="lastName"
                    value={registerForm.lastName}
                    onChange={changeHandler}
                    placeholder="Apellido"
                    disabled={isLoading}
                  />
                </div>
                {errors.lastName && (
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
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                className={`block text-sm font-semibold mb-2 ${
                  errors.email ? "text-red-600" : "text-black"
                }`}
              >
                CORREO ELECTRÓNICO
                {emailChecking && (
                  <span className="ml-2 text-xs text-blue-500">(verificando...)</span>
                )}
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
                      : emailExists
                      ? "border-yellow-500 bg-yellow-50"
                      : "border-gray-300 bg-gray-50 text-gray-900 focus:bg-white"
                  }`}
                  type="email"
                  name="email"
                  value={registerForm.email}
                  onChange={changeHandler}
                  placeholder="ejemplo@correo.com"
                  disabled={isLoading || emailChecking}
                />
                {emailExists && !errors.email && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <span className="text-yellow-600 text-sm">⚠️ Email registrado</span>
                  </div>
                )}
              </div>
              {errors.email ? (
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
              ) : (
                <p className="mt-2 text-sm text-gray-500">
                  Te enviaremos un email de confirmación
                </p>
              )}
            </div>

            {/* DNI y Teléfono en una fila */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* DNI */}
              <div>
                <label
                  className={`block text-sm font-semibold mb-2 ${
                    errors.dni ? "text-red-600" : "text-black"
                  }`}
                >
                  DNI
                </label>
                <div className="relative">
                  <span
                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
                      errors.dni ? "text-red-500" : "text-gray-400"
                    }`}
                  >
                    🆔
                  </span>
                  <input
                    className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DC2626] transition ${
                      errors.dni
                        ? "border-red-500 bg-red-50 text-red-900 placeholder-red-300"
                        : "border-gray-300 bg-gray-50 text-gray-900 focus:bg-white"
                    }`}
                    type="text"
                    name="dni"
                    value={registerForm.dni}
                    onChange={changeHandler}
                    placeholder="12345678"
                    maxLength={8}
                    disabled={isLoading}
                  />
                </div>
                {errors.dni && (
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
                    {errors.dni}
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
            </div>

            {/* Género y Fecha de Nacimiento en una fila */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Género */}
              <div>
                <label
                  className={`block text-sm font-semibold mb-2 ${
                    errors.gender ? "text-red-600" : "text-black"
                  }`}
                >
                  GÉNERO
                </label>
                <div className="relative">
                  <span
                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
                      errors.gender ? "text-red-500" : "text-gray-400"
                    }`}
                  >
                    ⚤
                  </span>
                  <select
                    className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DC2626] transition appearance-none ${
                      errors.gender
                        ? "border-red-500 bg-red-50 text-red-900"
                        : "border-gray-300 bg-gray-50 text-gray-900 focus:bg-white"
                    }`}
                    name="gender"
                    value={registerForm.gender}
                    onChange={changeHandler}
                    disabled={isLoading}
                  >
                    <option value="">Seleccionar género</option>
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                    <option value="otro">Otro</option>
                    <option value="prefiero-no-decir">Prefiero no decir</option>
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {errors.gender && (
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
                    {errors.gender}
                  </p>
                )}
              </div>

              {/* Fecha de Nacimiento */}
              <div>
                <label
                  className={`block text-sm font-semibold mb-2 ${
                    errors.birthDate ? "text-red-600" : "text-black"
                  }`}
                >
                  FECHA DE NACIMIENTO
                </label>
                <div className="relative">
                  <span
                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
                      errors.birthDate ? "text-red-500" : "text-gray-400"
                    }`}
                  >
                    🎂
                  </span>
                  <input
                    className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DC2626] transition ${
                      errors.birthDate
                        ? "border-red-500 bg-red-50 text-red-900"
                        : "border-gray-300 bg-gray-50 text-gray-900 focus:bg-white"
                    }`}
                    type="date"
                    name="birthDate"
                    value={registerForm.birthDate}
                    onChange={changeHandler}
                    max={new Date().toISOString().split('T')[0]}
                    disabled={isLoading}
                  />
                </div>
                {errors.birthDate && (
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
                    {errors.birthDate}
                  </p>
                )}
              </div>
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
                  placeholder="Calle, número, ciudad"
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

            {/* Contraseña y Confirmar Contraseña en una fila */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contraseña */}
              <div>
                <label
                  className={`block text-sm font-semibold mb-2 ${
                    errors.password ? "text-red-600" : "text-black"
                  }`}
                >
                  CONTRASEÑA (8-12 caracteres)
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
                    placeholder="Mínimo 8 caracteres"
                    minLength={8}
                    maxLength={12}
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
                {registerForm.password.length > 0 && !errors.password && (
                  <p className={`mt-2 text-sm ${
                    registerForm.password.length < 8 ? 'text-yellow-600' : 
                    registerForm.password.length > 12 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {registerForm.password.length}/12 caracteres
                  </p>
                )}
              </div>

              {/* Confirmar Contraseña */}
              <div>
                <label
                  className={`block text-sm font-semibold mb-2 ${
                    errors.repeatPassword ? "text-red-600" : "text-black"
                  }`}
                >
                  CONFIRMAR CONTRASEÑA
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
                    placeholder="Repite tu contraseña"
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