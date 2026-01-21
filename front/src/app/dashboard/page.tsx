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
    return null; // Ya se redirige en el useEffect
  }

  // CONDICIONAL: Solo usuarios NO admin/superAdmin ven DashboardStats
  const isAdminOrSuperAdmin = user?.rol === 'admin' || user?.rol === 'superAdmin';
  const showDashboardStats = !isAdminOrSuperAdmin;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* User Profile Section - MOSTRAR PARA TODOS los usuarios */}
        <UserProfileSection user={user} updateUser={updateUser} />
        
        {/* Dashboard Stats Section - SOLO para usuarios NO admin/superAdmin */}
        {showDashboardStats && (
          <div className="mt-8">
            <DashboardStats />
          </div>
        )}

        
      </div>
    </div>
  );
}