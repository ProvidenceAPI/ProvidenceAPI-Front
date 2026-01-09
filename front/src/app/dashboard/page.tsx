"use client";

import { useAppContext } from "src/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Navbar } from "src/components/Navbar";
import Link from "next/link";
import axios from "axios";

export default function DashboardPage() {
  const { user, isAuthenticated, loading, logout, updateUser } = useAppContext();
  const router = useRouter();
  const [stats, setStats] = useState({
    reservasActivas: 0,
    pagosPendientes: 0,
    proximaClase: null as string | null,
  });
  
  // Estados para edición de perfil
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    phone: "",
    profileImage: "",
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Aquí cargarías datos reales del backend
      setStats({
        reservasActivas: 3,
        pagosPendientes: 1,
        proximaClase: "2024-01-20 18:00 - CrossFit",
      });
      
      // Inicializar formulario con datos del usuario
      setFormData({
        phone: user.phone || "",
        profileImage: user.profileImage || "",
      });
    }
  }, [isAuthenticated, user]);

  // Función para subir imagen a Cloudinary
  const uploadToCloudinary = async (file: File) => {
    try {
      setUploading(true);
      
      // 1. Obtener signature y timestamp del backend
      const response = await axios.get('http://localhost:3000/cloudinary/signature');
      const { signature, timestamp, api_key, cloud_name } = response.data;
      
      // 2. Crear FormData para Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', api_key);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      formData.append('folder', 'providence/profiles'); // Carpeta en Cloudinary
      
      // 3. Subir a Cloudinary
      const cloudinaryResponse = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      return cloudinaryResponse.data.secure_url; // URL de la imagen
      
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Subir imagen a Cloudinary
      const imageUrl = await uploadToCloudinary(file);
      
      // Actualizar estado local
      setFormData({ ...formData, profileImage: imageUrl });
      
      // Actualizar en el backend
      await updateProfile({ profileImage: imageUrl });
      
      alert("Foto de perfil actualizada exitosamente");
    } catch (error) {
      console.error("Error actualizando foto:", error);
      alert("Error al actualizar la foto de perfil");
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, phone: e.target.value });
  };

  const updateProfile = async (data: Partial<typeof formData>) => {
    try {
      const token = localStorage.getItem('providence_token');
      
      // Actualizar en backend
      const response = await axios.put(
        'http://localhost:3000/users/profile',
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Actualizar en contexto
      updateUser(response.data.user);
      
      return response.data;
    } catch (error) {
      console.error("Error actualizando perfil:", error);
      throw error;
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile(formData);
      setEditMode(false);
      alert("Perfil actualizado exitosamente");
    } catch (error) {
      console.error("Error guardando perfil:", error);
      alert("Error al actualizar el perfil");
    }
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
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input 
                    type="file" 
                    className="hidden"
                    accept="image/*"
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
                <h1 className="text-3xl font-bold text-gray-900">
                  ¡Hola, {user?.name || "Usuario"}!
                </h1>
                <p className="text-gray-600 mt-1">
                  {user?.email}
                </p>
                
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Teléfono</p>
                {editMode ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    className="px-2 py-1 border rounded text-gray-900"
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
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setFormData({
                        phone: user?.phone || "",
                        profileImage: user?.profileImage || "",
                      });
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Editar Perfil
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Resto del dashboard (igual que antes) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Reservas Activas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.reservasActivas}</p>
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
                <p className="text-2xl font-bold text-gray-900">{stats.pagosPendientes}</p>
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
                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700">
                  Ver detalles
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ... resto del dashboard igual ... */}
      </div>
    </div>
  );
}