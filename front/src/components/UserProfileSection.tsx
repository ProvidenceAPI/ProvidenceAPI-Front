"use client";

import { useState, useRef } from "react";

interface UserProfileSectionProps {
  user: any;
  updateUser: (data: any) => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://providenceapi-back.onrender.com';

export default function UserProfileSection({ user, updateUser }: UserProfileSectionProps) {
  const [editMode, setEditMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

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

      const token = localStorage.getItem('providence_token');
      if (!token) {
        alert("No hay sesión activa");
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append("file", file);

      // Usar fetch directamente
      const response = await fetch(`${API_URL}/api/users/profile/image`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status} al subir imagen`);
      }

      const data = await response.json();
      const imageUrl = data.profileImage || data.url || data.imageUrl;

      if (user && imageUrl) {
        updateUser({ ...user, profileImage: imageUrl });
      }
      alert("✅ Foto de perfil actualizada exitosamente");
    } catch (error: any) {
      console.error("Error actualizando foto:", error);
      alert("❌ Error al actualizar la foto de perfil: " + error.message);
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
      const token = localStorage.getItem('providence_token');
      if (!token) {
        alert("No hay sesión activa");
        return;
      }

      const response = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status} al actualizar perfil`);
      }

      const data = await response.json();

      if (user && data) {
        updateUser({
          ...user,
          name: data.name || formData.name,
          phone: data.phone || formData.phone,
        });
      }
      setEditMode(false);
      alert("✅ Perfil actualizado exitosamente");
    } catch (error: any) {
      console.error("Error guardando perfil:", error);
      alert("❌ Error al actualizar el perfil: " + error.message);
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setFormData({
      name: user?.name || "",
      phone: user?.phone || "",
    });
  };

  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return "No disponible";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-8">
      {/* Header con foto de perfil grande */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="flex flex-col lg:flex-row items-start gap-10">
          
          {/* Imagen de perfil GRANDE */}
          <div className="lg:w-2/5">
            <div className="relative group">
              <div className="w-72 h-72 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 border-8 border-white shadow-2xl mx-auto">
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt="Foto de perfil"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-500 to-red-600">
                            <span class="text-6xl font-bold text-white">
                              ${user?.name?.charAt(0) || 'U'}${user?.lastname?.charAt(0) || ''}
                            </span>
                          </div>
                        `;
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-500 to-red-600">
                    <span className="text-6xl font-bold text-white">
                      {user?.name?.charAt(0) || 'U'}{user?.lastname?.charAt(0) || ''}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Botón para cambiar foto */}
              <div className="mt-6 text-center">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Cambiar foto
                    </>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/png,image/jpg,image/jpeg,image/webp"
                  onChange={handleImageChange}
                />
                <p className="text-xs text-gray-500 mt-2">
                  PNG, JPG, JPEG o WEBP • Máximo 2MB
                </p>
              </div>
            </div>
          </div>

          {/* Información del usuario */}
          <div className="lg:w-3/5">
            <div className="flex flex-col h-full">
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                  <div>
                    {editMode ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="text-4xl font-bold text-gray-900 bg-transparent border-b-2 border-gray-300 focus:border-red-600 focus:outline-none w-full"
                        placeholder="Tu nombre"
                      />
                    ) : (
                      <h1 className="text-4xl font-bold text-gray-900">
                        ¡Hola, {user?.name || "Usuario"}!
                      </h1>
                    )}
                    
                    <div className="flex items-center mt-4 space-x-4">
                      <div className="flex items-center text-gray-600">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        <span className="font-medium">{user?.email}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Botón de editar/guardar */}
                  <div className="flex flex-col items-end space-y-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-500 mb-1">Teléfono</p>
                      {editMode ? (
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-right w-full max-w-xs"
                          placeholder="Ej: 3001234567"
                        />
                      ) : (
                        <p className="text-lg font-medium">
                          {user?.phone || "No registrado"}
                        </p>
                      )}
                    </div>
                    
                    {editMode ? (
                      <div className="flex gap-3">
                        <button
                          onClick={handleSaveProfile}
                          className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-md"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-5 py-2.5 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-all duration-300"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditMode(true)}
                        className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-md"
                      >
                        Editar Perfil
                      </button>
                    )}
                  </div>
                </div>

                {/* Información completa */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b">
                    Información Personal Completa
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Nombre completo</p>
                        <p className="font-medium text-lg">
                          {user?.name} {user?.lastname || ""}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{user?.email}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">DNI</p>
                        <p className="font-medium">{user?.dni || "No registrado"}</p>
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

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Fecha de Nacimiento</p>
                        <p className="font-medium">
                          {user?.birthdate
                            ? formatDate(user.birthdate)
                            : "No registrada"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Miembro desde</p>
                        <p className="font-medium">
                          {new Date().toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}