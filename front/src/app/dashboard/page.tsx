"use client";

import { useAppContext } from "src/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Navbar } from "src/components/Navbar";
import TransformacionCTA from "src/components/TransformacionCTA";
import { Footer } from "src/components/Footer"; 
import Link from "next/link";
import api from "../../services/api";

export default function DashboardPage() {
  const { user, isAuthenticated, loading, updateUser } = useAppContext();
  const router = useRouter();
  const [stats, setStats] = useState({
    reservasActivas: 0,
    pagosPendientes: 0,
    proximaClase: null as string | null,
  });

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    profileImage: "",
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (
      !loading &&
      !isAuthenticated &&
      !localStorage.getItem("providence_token")
    ) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (isAuthenticated && user) {
      setStats({
        reservasActivas: 3,
        pagosPendientes: 1,
        proximaClase: "2024-01-20 18:00 - CrossFit",
      });

      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        profileImage: user.profileImage || "",
      });
    }
  }, [isAuthenticated, user]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = ["image/png", "image/jpg", "image/jpeg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      alert("Solo se permiten imágenes PNG, JPG, JPEG o WEBP");
      return;
    }
    if (file.size > 2000000) {
      alert("La imagen debe ser menor a 2MB");
      return;
    }
    try {
      setUploading(true);

      const formDataToSend = new FormData();
      formDataToSend.append("file", file);

      const response: any = await api.put(
        "/users/profile/image",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const imageUrl = response.profileImage;

      setFormData((prev) => ({ ...prev, profileImage: imageUrl }));
      if (user && imageUrl) {
        updateUser({ ...user, profileImage: imageUrl });
      }
      alert("Foto de perfil actualizada exitosamente");
    } catch (error) {
      console.error("Error actualizando foto:", error);
      alert("Error al actualizar la foto de perfil");
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      const { profileImage, ...dataToUpdate } = formData;
      const response: any = await api.put("/users/profile", dataToUpdate);
      if (user && response) {
        updateUser({
          ...user,
          name: response.name || dataToUpdate.name,
          phone: response.phone || dataToUpdate.phone,
        });
      }
      setEditMode(false);
      alert("Perfil actualizado exitosamente");
    } catch (error) {
      console.error("Error guardando perfil:", error);
      alert("Error al actualizar el perfil");
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setFormData({
      name: user?.name || "",
      phone: user?.phone || "",
      profileImage: user?.profileImage || "",
    });
  };

  // Formatear fecha para mostrarla mejor
  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return "No disponible";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">Cargando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header con foto de perfil */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              {/* Foto de perfil editable */}
              <div className="relative group">
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  {formData.profileImage ? (
                    <img
                      src={formData.profileImage}
                      alt="Foto de perfil"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-red-100 flex items-center justify-center">
                      <span className="text-red-600 text-2xl font-bold">
                        {user?.name?.charAt(0) || "U"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Botón para cambiar foto */}
                <label className="absolute bottom-0 right-0 bg-red-600 text-white p-2 rounded-full cursor-pointer hover:bg-red-700 transition group-hover:block hidden">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/png,image/jpg,image/jpeg,image/webp"
                    onChange={handleImageChange}
                    disabled={uploading}
                  />
                </label>

                {uploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
              </div>

              <div>
                {editMode ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="text-3xl font-bold text-gray-900 bg-transparent border-b border-gray-300 focus:border-red-600 focus:outline-none"
                    placeholder="Tu nombre"
                  />
                ) : (
                  <h1 className="text-3xl font-bold text-gray-900">
                    ¡Hola, {user?.name || "Usuario"}!
                  </h1>
                )}
                <p className="text-gray-600 mt-1">{user?.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {user?.rol === "admin" ? "Administrador" : "Usuario"}
                  </span>
                  {user?.lastname && (
                    <span className="text-gray-600 text-sm">
                      {user.lastname}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Teléfono</p>
                {editMode ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="px-2 py-1 border rounded text-gray-900 text-right w-full"
                    placeholder="Ingresa tu teléfono"
                  />
                ) : (
                  <p className="font-medium">
                    {user?.phone || "No registrado"}
                  </p>
                )}
              </div>

              {editMode ? (
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveProfile}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                >
                  Editar Perfil
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Información completa del usuario */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">
              Información Personal
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Detalles completos de tu cuenta
            </p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Información básica */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 mb-4 pb-2 border-b">
                  Información Básica
                </h3>
                
                <div>
                  <p className="text-sm text-gray-500">Nombre completo</p>
                  <p className="font-medium">
                    {user?.name} {user?.lastname || ""}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Rol</p>
                  <p className="font-medium">
                    {user?.rol === "admin" ? "Administrador" : "Usuario"}
                  </p>
                </div>
              </div>

              {/* Información de contacto */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 mb-4 pb-2 border-b">
                  Información de Contacto
                </h3>

                <div>
                  <p className="text-sm text-gray-500">Teléfono</p>
                  <p className="font-medium">{user?.phone || "No registrado"}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Género</p>
                  <p className="font-medium">
                    {user?.genre === "Male"
                      ? "Masculino"
                      : user?.genre === "Female"
                      ? "Femenino"
                      : user?.genre === "Other"
                      ? "Otro"
                      : "No especificado"}
                  </p>
                </div>
              </div>

              {/* Información adicional */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 mb-4 pb-2 border-b">
                  Información Adicional
                </h3>

                <div>
                  <p className="text-sm text-gray-500">DNI</p>
                  <p className="font-medium">{user?.dni || "No registrado"}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Fecha de Nacimiento</p>
                  <p className="font-medium">
                    {user?.birthdate
                      ? formatDate(user.birthdate)
                      : "No registrada"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Reservas Activas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.reservasActivas}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <span className="text-blue-600">📅</span>
              </div>
            </div>
            <div className="mt-4">
              <Link
                href="/mis-reservas"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Ver todas →
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pagos Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pagosPendientes}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <span className="text-green-600">💰</span>
              </div>
            </div>
            <div className="mt-4">
              <Link
                href="/mis-pagos"
                className="text-green-600 hover:text-green-800 text-sm font-medium"
              >
                Gestionar pagos →
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Próxima Clase</p>
                <p className="text-lg font-bold text-gray-900">
                  {stats.proximaClase || "No hay clases"}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <span className="text-purple-600">⏰</span>
              </div>
            </div>
            <div className="mt-4">
              {stats.proximaClase && (
                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition">
                  Ver detalles
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sección de Transformación CTA */}
      <TransformacionCTA />

      {/* Footer */}
      <Footer />
    </div>
  );
}