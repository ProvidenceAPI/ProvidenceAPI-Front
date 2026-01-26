"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { apiClient } from "src/app/lib/apiClient";

interface AdminFormData {
  name: string;
  lastname: string;
  email: string;
  password: string;
  confirmPassword: string;
  birthdate: string;
  phone: string;
  dni: string;
  genre: "Female" | "Male" | "Nonbinary" | "Other";
}

export default function AdminCreationFormTab() {
  const router = useRouter();
  const [formData, setFormData] = useState<AdminFormData>({
    name: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthdate: "",
    phone: "",
    dni: "",
    genre: "Male",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<AdminFormData>>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [validations, setValidations] = useState({
    name: false,
    lastname: false,
    email: false,
    password: false,
    confirmPassword: false,
    phone: false,
    dni: false,
    genre: true,
    birthdate: false,
  });

  useEffect(() => {
    const userData = localStorage.getItem("providence_user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUserId(user.id);
      } catch (error) {
        localStorage.removeItem("providence_user");
        localStorage.removeItem("providence_token");
      }
    }
  }, []);

  const getMaxBirthdate = () => {
    const today = new Date();
    const maxDate = new Date(today.setFullYear(today.getFullYear() - 18));
    return maxDate.toISOString().split("T")[0];
  };

  const getMinBirthdate = () => {
    const today = new Date();
    const minDate = new Date(today.setFullYear(today.getFullYear() - 100));
    return minDate.toISOString().split("T")[0];
  };

  const validateRealTime = useCallback(() => {
    const newValidations = {
      name: formData.name.length >= 3 && formData.name.length <= 80,
      lastname: formData.lastname.length >= 3 && formData.lastname.length <= 80,
      email: formData.email ? /\S+@\S+\.\S+/.test(formData.email) : false,
      password: formData.password ? 
        formData.password.length >= 8 && formData.password.length <= 15 : false,
      confirmPassword: formData.password === formData.confirmPassword && 
        formData.confirmPassword.length > 0,
      phone: formData.phone ? /^\d{10,15}$/.test(formData.phone) : false,
      dni: formData.dni ? 
        (formData.dni.length >= 7 && 
         formData.dni.length <= 10) : false,
      genre: true,
      birthdate: formData.birthdate ? 
        (() => {
          const birthDate = new Date(formData.birthdate);
          if (isNaN(birthDate.getTime())) return false;
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          return age >= 18;
        })() : false,
    };
    
    setValidations(newValidations);
  }, [formData]);

  useEffect(() => {
    validateRealTime();
  }, [validateRealTime]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const formatted = value.replace(/\D/g, "").substring(0, 15);
      setFormData((prev) => ({ ...prev, [name]: formatted }));
    } else if (name === "dni") {
      const formatted = value.replace(/\D/g, "").substring(0, 10);
      setFormData((prev) => ({ ...prev, [name]: formatted }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name as keyof AdminFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<AdminFormData> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido";
    } else if (formData.name.length < 3) {
      newErrors.name = "Nombre mínimo 3 caracteres";
    } else if (formData.name.length > 80) {
      newErrors.name = "El nombre no debe exceder 80 caracteres";
    }
    
    if (!formData.lastname.trim()) {
      newErrors.lastname = "El apellido es requerido";
    } else if (formData.lastname.length < 3) {
      newErrors.lastname = "Apellido mínimo 3 caracteres";
    } else if (formData.lastname.length > 80) {
      newErrors.lastname = "El apellido no debe exceder 80 caracteres";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido";
    } else if (emailExists) {
      newErrors.email = "Este email ya está registrado";
    }
    
    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 8) {
      newErrors.password = "Mínimo 8 caracteres";
    } else if (formData.password.length > 15) {
      newErrors.password = "Máximo 15 caracteres";
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }
    
    if (!formData.birthdate) {
      newErrors.birthdate = "Fecha de nacimiento requerida";
    } else {
      const birthDate = new Date(formData.birthdate);
      if (isNaN(birthDate.getTime())) {
        newErrors.birthdate = "Fecha inválida";
      } else {
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 18) {
          newErrors.birthdate = "Debe ser mayor de 18 años";
        }
      }
    }
    
    if (!formData.phone) {
      newErrors.phone = "Teléfono requerido";
    } else if (formData.phone.length < 10) {
      newErrors.phone = "Teléfono mínimo 10 dígitos";
    } else if (formData.phone.length > 15) {
      newErrors.phone = "Teléfono máximo 15 dígitos";
    }
    
    if (!formData.dni) {
      newErrors.dni = "DNI requerido";
    } else if (formData.dni.length < 7) {
      newErrors.dni = "DNI mínimo 7 dígitos";
    } else if (formData.dni.length > 10) {
      newErrors.dni = "DNI máximo 10 dígitos";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createUser = async (userData: any) => {
    const { data } = await apiClient.post("/api/auth/signup", userData);
    return data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      Swal.fire({
        title: "❌ Error de validación",
        text: "Por favor corrige los errores en el formulario",
        icon: "error",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#DC2626",
      });
      return;
    }

    setLoading(true);

    try {
      const userData = {
        name: formData.name,
        lastname: formData.lastname,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        birthdate: formData.birthdate,
        phone: formData.phone,
        dni: parseInt(formData.dni),
        genre: formData.genre,
      };
      const userResponse = await createUser(userData);
      if (!userResponse.user || !userResponse.user.id) {
        throw new Error("No se recibió ID de usuario en la respuesta");
      }
      
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await Swal.fire({
        title: "✅ ¡Usuario creado!",
        html: `
          <div class="text-left">
            <div class="mt-4 p-3 bg-gray-100 rounded-lg">
              <p><strong>Nombre:</strong> ${formData.name} ${formData.lastname}</p>
              <p><strong>Email:</strong> ${formData.email}</p>
            </div>
            <p class="mt-4 text-sm text-gray-600">
              El nuevo usuario puede iniciar sesión inmediatamente.
            </p>
          </div>
        `,
        icon: "success",
        confirmButtonText: "Continuar",
        confirmButtonColor: "#DC2626",
      });

      setFormData({
        name: "",
        lastname: "",
        email: "",
        password: "",
        confirmPassword: "",
        birthdate: "",
        phone: "",
        dni: "",
        genre: "Male",
      });
    } catch (error: any) {      
      let errorMessage = "No se pudo crear el administrador.";
      if (
        error.message.includes("already exists") ||
        error.message.includes("ya existe")
      ) {
        errorMessage = "❌ Este email ya está registrado. Intenta con otro email.";
        setEmailExists(true);
      } else if (
        error.message.includes("Unauthorized") ||
        error.message.includes("token")
      ) {
        errorMessage = "❌ No tienes permisos para crear administradores. Debes ser SuperAdmin.";
      } else if (error.message.includes("network")) {
        errorMessage = "❌ Error de conexión. Verifica tu internet.";
      } else if (error.response?.data?.message) {
        errorMessage = `❌ ${error.response.data.message}`;
      }
      
      await Swal.fire({
        title: "Error",
        html: `
          <div class="text-left">
            <p class="mb-3">${errorMessage}</p>
            <div class="p-3 bg-red-50 rounded-lg">
              <p class="text-sm text-red-700">Detalles técnicos:</p>
              <p class="text-xs text-red-600 font-mono">${error.message || "Error desconocido"}</p>
            </div>
          </div>
        `,
        icon: "error",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#DC2626",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { text: "Sin contraseña", color: "text-gray-400" };
    if (password.length < 8) return { text: "Muy débil", color: "text-red-500" };
    if (password.length < 10) return { text: "Débil", color: "text-yellow-500" };
    if (password.length < 12) return { text: "Moderada", color: "text-green-500" };
    return { text: "Fuerte", color: "text-green-600" };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl mb-6">
            <span className="text-3xl">👑</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Crear Nuevo Usuario
          </h1>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm mt-4">
            <span>⚠️</span>
            <span>Solo SuperAdmins pueden crear usuarios</span>
          </div>
        </div>
        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre y Apellido */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors ${
                    errors.name ? "border-red-500" : 
                    validations.name ? "border-green-500" : "border-gray-300"
                  }`}
                  placeholder="Ej: Juan"
                  disabled={loading}
                />
                {errors.name ? (
                  <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                ) : (
                  formData.name.length > 0 && !validations.name && (
                    <p className="text-yellow-600 text-sm mt-1">
                      Mínimo 3 caracteres
                    </p>
                  )
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apellido *
                </label>
                <input
                  type="text"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors ${
                    errors.lastname ? "border-red-500" : 
                    validations.lastname ? "border-green-500" : "border-gray-300"
                  }`}
                  placeholder="Ej: Pérez"
                  disabled={loading}
                />
                {errors.lastname ? (
                  <p className="text-red-600 text-sm mt-1">{errors.lastname}</p>
                ) : (
                  formData.lastname.length > 0 && !validations.lastname && (
                    <p className="text-yellow-600 text-sm mt-1">
                      Mínimo 3 caracteres
                    </p>
                  )
                )}
              </div>
            </div>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors ${
                  errors.email ? "border-red-500" : 
                  emailExists ? "border-yellow-500" :
                  validations.email ? "border-green-500" : "border-gray-300"
                }`}
                placeholder="ejemplo@email.com"
                disabled={loading}
              />
              {errors.email ? (
                <p className="text-red-600 text-sm mt-1">{errors.email}</p>
              ) : emailExists ? (
                <p className="text-yellow-600 text-sm mt-1">
                  ⚠️ Este email ya está registrado
                </p>
              ) : (
                formData.email.length > 0 && !validations.email && (
                  <p className="text-yellow-600 text-sm mt-1">
                    Introduce un email válido
                  </p>
                )
              )}
            </div>
            {/* Contraseñas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full p-3 pr-10 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors ${
                      errors.password ? "border-red-500" : 
                      validations.password ? "border-green-500" : "border-gray-300"
                    }`}
                    placeholder="Mínimo 8 caracteres"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <svg
                        className="w-5 h-5 text-gray-500 hover:text-gray-700 transition-colors"
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
                        className="w-5 h-5 text-gray-500 hover:text-gray-700 transition-colors"
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
                {errors.password ? (
                  <p className="text-red-600 text-sm mt-1">{errors.password}</p>
                ) : formData.password.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${getPasswordStrength(formData.password).color}`}>
                        Seguridad: {getPasswordStrength(formData.password).text}
                      </span>
                      <span className={`text-sm ${
                        formData.password.length < 8 ? "text-red-500" : 
                        formData.password.length > 15 ? "text-red-500" : 
                        "text-green-600"
                      }`}>
                        {formData.password.length}/15
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar contraseña *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full p-3 pr-10 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors ${
                      errors.confirmPassword ? "border-red-500" : 
                      validations.confirmPassword ? "border-green-500" : "border-gray-300"
                    }`}
                    placeholder="Repite la contraseña"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                  >
                    {showConfirmPassword ? (
                      <svg
                        className="w-5 h-5 text-gray-500 hover:text-gray-700 transition-colors"
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
                        className="w-5 h-5 text-gray-500 hover:text-gray-700 transition-colors"
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
                {errors.confirmPassword ? (
                  <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>
                ) : (
                  formData.confirmPassword.length > 0 && !validations.confirmPassword && (
                    <p className="text-yellow-600 text-sm mt-1">
                      Las contraseñas no coinciden
                    </p>
                  )
                )}
              </div>
            </div>
            {/* Fecha de nacimiento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de nacimiento *
              </label>
              <input
                type="date"
                name="birthdate"
                value={formData.birthdate}
                onChange={handleChange}
                max={getMaxBirthdate()}
                min={getMinBirthdate()}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors ${
                  errors.birthdate ? "border-red-500" : 
                  validations.birthdate ? "border-green-500" : "border-gray-300"
                }`}
                disabled={loading}
              />
              {errors.birthdate ? (
                <p className="text-red-600 text-sm mt-1">{errors.birthdate}</p>
              ) : (
                formData.birthdate && !validations.birthdate && (
                  <p className="text-yellow-600 text-sm mt-1">
                    Debe ser mayor de 18 años
                  </p>
                )
              )}
              <p className="text-sm text-gray-500 mt-1">
                Debe ser mayor de 18 años
              </p>
            </div>
            {/* Teléfono y DNI */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors ${
                    errors.phone ? "border-red-500" : 
                    validations.phone ? "border-green-500" : "border-gray-300"
                  }`}
                  placeholder="10-15 dígitos"
                  disabled={loading}
                />
                {errors.phone ? (
                  <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
                ) : (
                  formData.phone.length > 0 && !validations.phone && (
                    <p className="text-yellow-600 text-sm mt-1">
                      Debe tener entre 10 y 15 dígitos
                    </p>
                  )
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  DNI *
                </label>
                <input
                  type="text"
                  name="dni"
                  value={formData.dni}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors ${
                    errors.dni ? "border-red-500" : 
                    validations.dni ? "border-green-500" : "border-gray-300"
                  }`}
                  placeholder="7-10 dígitos"
                  disabled={loading}
                />
                {errors.dni ? (
                  <p className="text-red-600 text-sm mt-1">{errors.dni}</p>
                ) : (
                  formData.dni.length > 0 && !validations.dni && (
                    <p className="text-yellow-600 text-sm mt-1">
                      Debe tener entre 7 y 10 dígitos
                    </p>
                  )
                )}
              </div>
            </div>
            {/* Género */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Género *
                </label>
                <select
                  name="genre"
                  value={formData.genre}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
                  disabled={loading}
                >
                  <option value="Female">Femenino</option>
                  <option value="Male">Masculino</option>
                  <option value="Nonbinary">No binario</option>
                  <option value="Other">Otro</option>
                </select>
              </div>
            </div>
            {/* Info de privacidad */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-bold text-blue-800 mb-2">
                🔒 Proceso de creación
              </h4>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal pl-5">
                <li>Se crea un usuario normal en el sistema</li>
                <li>El nuevo admin puede iniciar sesión inmediatamente</li>
                <li>Se recomienda cambiar la contraseña en el primer login</li>
              </ol>
            </div>
            {/* Botones */}
            <div className="pt-6 flex flex-col gap-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creando Usuario...
                  </>
                ) : (
                  "Crear Usuario"
                )}
              </button>
              <button
                type="button"
                onClick={() => router.push("/admin-dashboard")}
                className="w-full py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                ← Volver al panel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}