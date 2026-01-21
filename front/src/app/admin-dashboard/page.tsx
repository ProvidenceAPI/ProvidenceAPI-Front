// app/admin-dashboard/page.tsx - PÁGINA DE PRUEBA
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppContext } from "src/contexts/AppContext";

export default function AdminDashboard() {
  const { user, isAuthenticated, isAdmin, isSuperAdmin, loading, logout } =
    useAppContext();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "overview" | "users" | "activities" | "reservations" | "turns"
  >("overview");
  const [users, setUsers] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    console.log(`
╔═══════════════════════════════════════════════════════
║ 🔍 DEBUG ADMIN DASHBOARD
╠═══════════════════════════════════════════════════════
║ 🔐 isAuthenticated: ${isAuthenticated}
║ 👤 user: ${user ? JSON.stringify(user, null, 2) : 'null'}
║ 🎭 user.role: ${user?.rol}
║ 👔 isAdmin: ${isAdmin}
║ 👑 isSuperAdmin: ${isSuperAdmin}
║ 🔄 loading: ${loading}
╠═══════════════════════════════════════════════════════
║ 📦 LOCALSTORAGE:
║ - providence_user: ${localStorage.getItem("providence_user")?.substring(0, 50)}...
║ - providence_token: ${localStorage.getItem("providence_token")?.substring(0, 30)}...
╚═══════════════════════════════════════════════════════
    `);

    // Si no está autenticado y ya terminó de cargar, redirigir
    if (!loading && !isAuthenticated) {
      console.log("❌ No autenticado, redirigiendo a login");
      router.push("/login?admin=true");
      return;
    }

    // Si está autenticado pero no es admin
    if (!loading && isAuthenticated && !isAdmin) {
      console.log("❌ No es admin, redirigiendo a dashboard");
      router.push("/dashboard");
      return;
    }
    console.log("✅ Usuario admin verificado, mostrando dashboard");
  }, [isAuthenticated, isAdmin, isSuperAdmin, loading, user, router]);

  useEffect(() => {
    if (activeTab === "users" && (isAdmin || isSuperAdmin)) {
      loadUsers();
    }
  }, [activeTab, isAdmin, isSuperAdmin]);

  const loadUsers = async () => {
    setLoadingData(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("providence_token")}`,
          },
        },
      );
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : data.users || []);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoadingData(false);
    }
  };

  // Mientras carga
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Redirigiendo a login...</p>
        </div>
      </div>
    );
  }

  // Si no es admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600 text-lg">
            Sin permisos de administrador...
          </p>
        </div>
      </div>
    );
  }

  // DASHBOARD ADMIN
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isSuperAdmin ? "👑 Panel SuperAdmin" : "👔 Panel Admin"}
            </h1>
          </div>
        </div>
      </header>
      {/* ⬅️ AGREGAR PESTAÑAS AQUÍ */}
      <div className="bg-white rounded-xl shadow-lg mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "overview"
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              📊 Resumen
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "users"
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              👥 Usuarios
            </button>
            <button
              onClick={() => setActiveTab("activities")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "activities"
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              🏋️ Actividades
            </button>
            <button
              onClick={() => setActiveTab("reservations")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "reservations"
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              📅 Reservas
            </button>
            <button
              onClick={() => setActiveTab("turns")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "turns"
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              🗓️ Turnos
            </button>
          </nav>
        </div>
      </div>
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Usuarios
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">152</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Usuarios Activos
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">143</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Ingresos del Mes
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    $12,450
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-red-600 to-orange-600">
            <h2 className="text-xl font-bold text-white">
              Información de la Sesión
            </h2>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Nombre</p>
                <p className="mt-1 text-sm text-gray-900">{user.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="mt-1 text-sm text-gray-900">{user.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Rol</p>
                <p className="mt-1">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      isSuperAdmin
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {isSuperAdmin ? "👑 SuperAdmin" : "👔 Admin"}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">ID</p>
                <p className="mt-1 text-sm text-gray-900 font-mono">
                  {user.id}
                </p>
              </div>
              {user.phone && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Teléfono</p>
                  <p className="mt-1 text-sm text-gray-900">{user.phone}</p>
                </div>
              )}
              {user.dni && (
                <div>
                  <p className="text-sm font-medium text-gray-500">DNI</p>
                  <p className="mt-1 text-sm text-gray-900">{user.dni}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <button className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition text-left">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Gestionar Usuarios
                </h3>
                <p className="text-sm text-gray-500">Ver y editar usuarios</p>
              </div>
            </div>
          </button>

          <button className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition text-left">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Reportes</h3>
                <p className="text-sm text-gray-500">Ver estadísticas</p>
              </div>
            </div>
          </button>

          <button className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition text-left">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Configuración
                </h3>
                <p className="text-sm text-gray-500">Ajustes del sistema</p>
              </div>
            </div>
          </button>
        </div>
      </main>
    </div>
  );
}
