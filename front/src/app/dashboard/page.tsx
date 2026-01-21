"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import UserProfileSection from "src/components/UserProfileSection"; 
import DashboardStats from "src/components/DashboardStats";
import { useAppContext } from "src/contexts/AppContext";

export default function DashboardPage() {
  const { user, isAuthenticated, loading, updateUser } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600 mx-auto"></div>
          <p className="mt-6 text-gray-700 text-lg font-medium">Cargando tu dashboard...</p>
          <p className="mt-2 text-gray-500">Preparando tu experiencia personalizada</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // NO mostrar DashboardStats si es admin o superAdmin
  const isAdminOrSuperAdmin = user?.rol === 'admin' || user?.rol === 'superAdmin';
  const showDashboardStats = !isAdminOrSuperAdmin;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* User Profile Section */}
        <UserProfileSection user={user} updateUser={updateUser} />
        
        {/* Dashboard Stats Section */}
        {showDashboardStats && (
          <div className="mt-8">
            <DashboardStats />
          </div>
        )}

        {/* Panel para admins */}
        {(user?.rol === 'admin' || user?.rol === 'superAdmin') && (
          <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {user?.rol === 'superAdmin' ? 'Panel de Super Administrador' : 'Panel de Administrador'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800">Gestión de Usuarios</h3>
                <p className="text-sm text-blue-600 mt-1">Administra todos los usuarios del sistema</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-800">Reportes</h3>
                <p className="text-sm text-green-600 mt-1">Visualiza reportes y estadísticas</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-purple-800">Configuración</h3>
                <p className="text-sm text-purple-600 mt-1">Configuración del sistema</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}