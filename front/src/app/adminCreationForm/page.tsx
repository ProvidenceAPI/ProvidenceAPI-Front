// app/adminCreationForm/page.tsx
"use client";

import React, { useState, useEffect } from "react";
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

export default function AdminCreationFormPage() {
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

  // Obtener el ID del usuario actual (para notificaciones)
  useEffect(() => {
    const userData = localStorage.getItem("providence_user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUserId(user.id);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    // Formateo especial para teléfono y DNI
    if (name === "phone") {
      const formatted = value.replace(/\D/g, "").substring(0, 15);
      setFormData((prev) => ({ ...prev, [name]: formatted }));
    } else if (name === "dni") {
      const formatted = value.replace(/\D/g, "").substring(0, 10);
      setFormData((prev) => ({ ...prev, [name]: formatted }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Limpiar error al escribir
    if (errors[name as keyof AdminFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<AdminFormData> = {};

    // Validaciones
    if (!formData.name.trim() || formData.name.length < 3) {
      newErrors.name = "Nombre mínimo 3 caracteres";
    }

    if (!formData.lastname.trim() || formData.lastname.length < 3) {
      newErrors.lastname = "Apellido mínimo 3 caracteres";
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 8) {
      newErrors.password = "Mínimo 8 caracteres";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    if (!formData.birthdate) {
      newErrors.birthdate = "Fecha de nacimiento requerida";
    }

    if (!formData.phone || formData.phone.length < 10) {
      newErrors.phone = "Teléfono mínimo 10 dígitos";
    }

    if (!formData.dni || formData.dni.length < 7) {
      newErrors.dni = "DNI mínimo 7 dígitos";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Función para crear usuario normal (signup)
  const createUser = async (userData: any) => {
    const { data } = await apiClient.post("/api/auth/signup", userData);
    return data;
  };

  // Función para convertir usuario a admin (update role)
  const convertToAdmin = async (userId: string, role: string) => {
    const { data } = await apiClient.put(`/api/users/${userId}/role`, { role });
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
      // PASO 1: Crear usuario normal
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

      console.log("PASO 1: Creando usuario normal...", userData);

      const userResponse = await createUser(userData);
      console.log("Usuario creado:", userResponse);

      if (!userResponse.user || !userResponse.user.id) {
        throw new Error("No se recibió ID de usuario en la respuesta");
      }

      const userId = userResponse.user.id;

      await new Promise((resolve) => setTimeout(resolve, 1000)); // Pequeña pausa

      // PASO 3: Mostrar éxito
      await Swal.fire({
        title: "✅ ¡Usuario creado!",
        html: `
          <div class="text-left">
            <div class="mt-4 p-3 bg-gray-100 rounded-lg">
              <p><strong>Nombre:</strong> ${formData.name} ${
                formData.lastname
              }</p>
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

      // Limpiar formulario
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

      // Opcional: Redirigir a lista de usuarios
      // router.push('/admin/users');
    } catch (error: any) {
      console.error("Error completo:", error);

      let errorMessage = "No se pudo crear el administrador.";

      if (
        error.message.includes("already exists") ||
        error.message.includes("ya existe")
      ) {
        errorMessage =
          "❌ Este email ya está registrado. Intenta con otro email.";
      } else if (
        error.message.includes("Unauthorized") ||
        error.message.includes("token")
      ) {
        errorMessage =
          "❌ No tienes permisos para crear administradores. Debes ser SuperAdmin.";
      } else if (error.message.includes("network")) {
        errorMessage = "❌ Error de conexión. Verifica tu internet.";
      }

      await Swal.fire({
        title: "Error",
        html: `
          <div class="text-left">
            <p class="mb-3">${errorMessage}</p>
            <div class="p-3 bg-red-50 rounded-lg">
              <p class="text-sm text-red-700">Detalles técnicos:</p>
              <p class="text-xs text-red-600 font-mono">${error.message}</p>
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

  // Formatear fecha para input date (mínimo 18 años)
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
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Ej: Juan"
                  disabled={loading}
                />
                {errors.name && (
                  <p className="text-red-600 text-sm mt-1">{errors.name}</p>
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
                    errors.lastname ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Ej: Pérez"
                  disabled={loading}
                />
                {errors.lastname && (
                  <p className="text-red-600 text-sm mt-1">{errors.lastname}</p>
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
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="ejemplo@email.com"
                disabled={loading}
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Contraseñas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Mínimo 8 caracteres"
                  disabled={loading}
                />
                {errors.password && (
                  <p className="text-red-600 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar contraseña *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Repite la contraseña"
                  disabled={loading}
                />
                {errors.confirmPassword && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.confirmPassword}
                  </p>
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
                  errors.birthdate ? "border-red-500" : "border-gray-300"
                }`}
                disabled={loading}
              />
              {errors.birthdate && (
                <p className="text-red-600 text-sm mt-1">{errors.birthdate}</p>
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
                    errors.phone ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="10-15 dígitos"
                  disabled={loading}
                />
                {errors.phone && (
                  <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
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
                    errors.dni ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="7-10 dígitos"
                  disabled={loading}
                />
                {errors.dni && (
                  <p className="text-red-600 text-sm mt-1">{errors.dni}</p>
                )}
              </div>
            </div>

            {/* Género y Rol */}
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
                <li>Se actualiza su rol a Administrador/SuperAdmin</li>
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
                    Creando administrador...
                  </>
                ) : (
                  "Crear Usuario"
                )}
              </button>

              <button
                type="button"
                onClick={() => router.push("/admin/dashboard")}
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
