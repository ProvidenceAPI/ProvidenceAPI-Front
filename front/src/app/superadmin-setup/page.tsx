"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check, AlertCircle } from "lucide-react";
import Swal from "sweetalert2";
import { apiClient } from "src/app/lib/apiClient";

export default function SuperAdminSetupPage() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "Super",
    lastname: "Administrador Providence",
    email: "superadmin.providence1@gmail.com",
    password: "SuperAdm123*",
    confirmPassword: "SuperAdm123*",
    birthdate: "1990-01-01",
    phone: "1122334455",
    dni: "30000000",
    genre: "Male" as "Female" | "Male" | "Nonbinary" | "Other",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await apiClient.post("/api/auth/signup", {
        name: formData.name,
        lastname: formData.lastname,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        birthdate: formData.birthdate,
        phone: formData.phone,
        dni: parseInt(formData.dni),
        genre: formData.genre,
      });
      const responseText = JSON.stringify(res.data || {});
      if (res.status >= 200 && res.status < 300) {
        const backendText = `👑 USUARIO SUPERADMIN CREADO
📌 DATOS COMPLETOS:
• Nombre: ${formData.name} ${formData.lastname}
• Email: ${formData.email}
• Password: ${formData.password}
• Fecha Nacimiento: ${formData.birthdate}
• Teléfono: ${formData.phone}
• DNI: ${formData.dni}
• Género: ${formData.genre}
• Rol actual: Usuario normal

📌 ACCIÓN REQUERIDA:
CONVERTIR A SUPERADMIN ejecutando:

UPDATE users SET role = 'superadmin' WHERE email = '${formData.email}';

📌 PARA LOGIN:
URL: https://providenceapi-back.onrender.com/api/auth/signin
JSON: {
  "email": "${formData.email}",
  "password": "${formData.password}"
}`;
        await navigator.clipboard.writeText(backendText);
        await Swal.fire({
          title: "✅ ¡Usuario creado!",
          html: `
            <div class="text-left">
              <p class="mb-4">El usuario ha sido registrado exitosamente como <strong>usuario normal</strong>.</p>
              
              <div class="bg-gray-100 p-4 rounded-lg mb-4">
                <p class="font-bold mb-2">📋 Datos registrados:</p>
                <p><strong>Nombre:</strong> ${formData.name} ${formData.lastname}</p>
                <p><strong>Email:</strong> ${formData.email}</p>
                <p><strong>DNI:</strong> ${formData.dni}</p>
                <p><strong>Teléfono:</strong> ${formData.phone}</p>
              </div>
              
              <p class="text-green-600 font-bold mb-2">📋 Los datos han sido copiados al portapapeles</p>
              <p class="text-sm text-gray-600">
                <strong>Envía estos datos al equipo backend</strong> para que ejecuten el comando SQL y conviertan el usuario a <strong>SuperAdmin</strong>.
              </p>
            </div>
          `,
          icon: "success",
          confirmButtonText: "Ir a Login Admin",
          width: 600,
        }).then(() => {
          router.push(
            `/login?admin=true&email=${encodeURIComponent(formData.email)}`,
          );
        });
      }
    } catch (err: any) {
      const status = err.response?.status;
      const responseText =
        typeof err.response?.data === "string"
          ? err.response.data
          : JSON.stringify(
              err.response?.data || err.message || "Error de conexión",
            );
      let errorMessage = "Error al crear usuario";
      try {
        const errorJson =
          typeof responseText === "string"
            ? JSON.parse(responseText)
            : responseText;
        if (errorJson.message) {
          errorMessage = errorJson.message;
          if (errorJson.message.includes("already exists")) {
            errorMessage =
              "✅ Este usuario YA EXISTE. Puedes usar las credenciales para iniciar sesión.";
            await Swal.fire({
              title: "Usuario existente",
              html: `
                  <div class="text-left">
                    <p>El usuario <strong>${formData.email}</strong> ya está registrado.</p>
                    <p class="mt-2">Puedes:</p>
                    <ol class="list-decimal pl-5 mt-2">
                      <li>Usar estas credenciales para iniciar sesión</li>
                      <li>Pedir al backend que lo convierta a SuperAdmin</li>
                    </ol>
                    <div class="bg-gray-100 p-3 rounded mt-3">
                      <p><strong>Email:</strong> ${formData.email}</p>
                      <p><strong>Password:</strong> ${formData.password}</p>
                    </div>
                  </div>
                `,
              icon: "info",
              confirmButtonText: "Ir a Login Admin",
            }).then(() => {
              router.push(
                `/login?admin=true&email=${encodeURIComponent(formData.email)}`,
              );
            });
            return;
          }
        }
      } catch (_) {}
      await Swal.fire({
        title: "Error",
        text: !err.response
          ? "No se pudo conectar con el servidor"
          : errorMessage,
        icon: "error",
        confirmButtonText: "Reintentar",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl mb-6">
            <span className="text-4xl">👑</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Configuración SuperAdmin
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Crea el primer usuario SuperAdmin para Providence Gym
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm mt-4">
            <AlertCircle className="w-4 h-4" />
            <span>Página temporal - Eliminar después de usar</span>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulario */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-6 pb-4 border-b">
              Crear SuperAdmin
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
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
                    className="w-full p-3 border rounded-lg"
                    required
                  />
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
                    className="w-full p-3 border rounded-lg"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg"
                  required
                />
              </div>
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
                    className="w-full p-3 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha Nacimiento *
                </label>
                <input
                  type="date"
                  name="birthdate"
                  value={formData.birthdate}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg"
                  required
                />
              </div>
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
                    className="w-full p-3 border rounded-lg"
                    required
                  />
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
                    className="w-full p-3 border rounded-lg"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Género *
                </label>
                <select
                  name="genre"
                  value={formData.genre}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg"
                  required
                >
                  <option value="Female">Femenino</option>
                  <option value="Male">Masculino</option>
                  <option value="Nonbinary">No binario</option>
                  <option value="Other">Otro</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold rounded-lg transition-all disabled:opacity-50"
              >
                {isLoading ? "Creando..." : "Crear SuperAdmin"}
              </button>
            </form>
          </div>
          {/* Instrucciones */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Pasos para el Backend
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-xl">
                  <h4 className="font-medium text-blue-800 mb-1">
                    1. Crear usuario
                  </h4>
                  <p className="text-blue-700 text-sm">
                    Usar el formulario o crear manualmente
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-xl">
                  <h4 className="font-medium text-green-800 mb-1">
                    2. Convertir a SuperAdmin
                  </h4>
                  <p className="text-green-700 text-sm">
                    Ejecutar SQL:{" "}
                    <code>
                      UPDATE users SET role = 'superadmin' WHERE email = '
                      {formData.email}'
                    </code>
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl">
                  <h4 className="font-medium text-purple-800 mb-1">
                    3. Verificar email
                  </h4>
                  <p className="text-purple-700 text-sm">
                    Marcar como verificado sin enviar correo
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Credenciales predeterminadas
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-2">
                    Email
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 p-3 bg-gray-50 border rounded-lg font-mono">
                      {formData.email}
                    </div>
                    <button
                      onClick={() => copyToClipboard(formData.email)}
                      className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg"
                    >
                      {copied ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-2">
                    Password
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 p-3 bg-gray-50 border rounded-lg font-mono">
                      {formData.password}
                    </div>
                    <button
                      onClick={() => copyToClipboard(formData.password)}
                      className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg"
                    >
                      {copied ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p className="text-red-600 font-medium">
            ⚠️ Esta página debe eliminarse después de configurar el superadmin
          </p>
          <p className="mt-1">
            Eliminar la carpeta: <code>app/admin/superadmin-setup/</code>
          </p>
        </div>
      </div>
    </div>
  );
}
