"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface DashboardStatsProps {
  // Props opcionales si quieres pasar datos desde el padre
}

interface Stats {
  reservasActivas: number;
  pagosPendientes: number;
  proximaClase: string | null;
}

export default function DashboardStats({ }: DashboardStatsProps) {
  const [stats, setStats] = useState<Stats>({
    reservasActivas: 0,
    pagosPendientes: 0,
    proximaClase: null,
  });
  const [loading, setLoading] = useState(true);

  // Cargar estadísticas reales del backend
  useEffect(() => {
    const loadStats = async () => {
      try {
        const token = localStorage.getItem('providence_token');
        if (!token) return;

        // Ejemplo: podrías cargar estadísticas reales aquí
        // const response = await fetch(`${API_URL}/api/reservations/stats`, {
        //   headers: { 'Authorization': `Bearer ${token}` }
        // });
        // const data = await response.json();
        
        // Por ahora, usamos datos de ejemplo
        setStats({
          reservasActivas: 3,
          pagosPendientes: 1,
          proximaClase: "2024-01-20 18:00 - CrossFit Avanzado",
        });
      } catch (error) {
        console.error("Error cargando estadísticas:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Reservas Activas */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Reservas Activas</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.reservasActivas}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="mt-6">
            <Link
              href="/mis-reservas"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              Ver todas las reservas
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Pagos Pendientes */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Pagos Pendientes</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.pagosPendientes}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-6">
            <Link
              href="/mis-pagos"
              className="inline-flex items-center text-green-600 hover:text-green-800 font-medium"
            >
              Gestionar pagos
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Próxima Clase */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Próxima Clase</h3>
              <p className="text-xl font-bold text-gray-900 mt-2">
                {stats.proximaClase || "No hay clases programadas"}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          {stats.proximaClase && (
            <div className="mt-6">
              <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300">
                Ver detalles
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Acciones Rápidas</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/activities"
            className="p-5 border border-gray-200 rounded-xl hover:border-red-300 hover:bg-red-50 transition-all duration-300 text-left group"
          >
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors duration-300">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="font-bold text-gray-900">Ver Actividades</h4>
                <p className="text-sm text-gray-600 mt-1">Explora clases disponibles</p>
              </div>
            </div>
          </Link>

          <Link
            href="/mis-reservas"
            className="p-5 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 text-left group"
          >
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors duration-300">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="font-bold text-gray-900">Mis Reservas</h4>
                <p className="text-sm text-gray-600 mt-1">Gestiona tus clases</p>
              </div>
            </div>
          </Link>

          <Link
            href="/mis-pagos"
            className="p-5 border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all duration-300 text-left group"
          >
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors duration-300">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="font-bold text-gray-900">Mis Pagos</h4>
                <p className="text-sm text-gray-600 mt-1">Historial de pagos</p>
              </div>
            </div>
          </Link>

          <button
            onClick={() => {
              if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
                localStorage.removeItem('providence_token');
                localStorage.removeItem('providence_user');
                window.location.href = '/login';
              }
            }}
            className="p-5 border border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 text-left group"
          >
            <div className="flex items-center">
              <div className="p-3 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors duration-300">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="font-bold text-gray-900">Cerrar Sesión</h4>
                <p className="text-sm text-gray-600 mt-1">Salir de tu cuenta</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}