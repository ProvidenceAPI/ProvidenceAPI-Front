"use client";

import { useAuth } from "src/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Navbar } from "src/components/Navbar";
import TransformacionCTA from "src/components/TransformacionCTA";
import { Footer } from "src/components/Footer"; 
import UserProfileSection from "src/components/UserProfileSection";
import DashboardStats from "src/components/DashboardStats"

export default function DashboardPage() {
  const { user, isAuthenticated, loading, updateUser } = useAuth();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* User Profile Section */}
        <UserProfileSection user={user} updateUser={updateUser} />
        
        {/* Dashboard Stats Section */}
        <div className="mt-8">
          <DashboardStats />
        </div>
      </div>

      {/* Sección de Transformación CTA */}
      <TransformacionCTA />

      {/* Footer */}
      <Footer />
    </div>
  );
}