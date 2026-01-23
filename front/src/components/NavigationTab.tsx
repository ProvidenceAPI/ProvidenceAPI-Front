// app/admin-dashboard/page.tsx - PÁGINA DE PRUEBA
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppContext } from "src/contexts/AppContext";
import ActivityTab from "./ActivityTab";
import TurnsTab from "./TurnsTab";
import AdminCreationFormTab from "./AdminCreationFormTab";
import UsersTab from "./UsersTab";
import Swal from "sweetalert2";
import ReservationsTab from "./ReservationsTab";

export default function NavigationTab() {
  const { user, isAuthenticated, isAdmin, isSuperAdmin, loading, logout } =
    useAppContext();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "users"
    | "activities"
    | "reservations"
    | "turns"
    | "AdminCreationForm"
  >("overview");
  const [users, setUsers] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [loadingReports, setLoadingReports] = useState(false);
  const [stats, setStats] = useState({
    users: { total: 0, active: 0 },
    revenue: { total: 0, count: 0 },
    peakHour: { hour: "Cargando...", reservations: 0 },
    cancellationRates: {
      reservations: 0,
      subscriptions: 0,
    },
    attendance: [],
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (activeTab !== "overview") return;
      try {
        const token = localStorage.getItem("providence_token");
        const headers = { Authorization: `Bearer ${token}` };
        const [
          userStats,
          revenue,
          peakHours,
          resCancellation,
          subCancellation,
          attendance,
        ] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/stats`, {
            headers,
          }).then((r) => r.json()),
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/payments/stats/monthly-revenue`,
            { headers },
          ).then((r) => r.json()),
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/reservations/stats/peak-hours`,
            { headers },
          ).then((r) => r.json()),
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/reservations/stats/cancellation-rate`,
            { headers },
          ).then((r) => r.json()),
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/admin/cancellation-rate`,
            { headers },
          ).then((r) => r.json()),
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/reservations/stats/attendance`,
            { headers },
          ).then((r) => r.json()),
        ]);
        setStats({
          users: userStats,
          revenue: revenue,
          peakHour: peakHours[0] || { hour: "N/A", reservations: 0 },
          cancellationRates: {
            reservations: resCancellation.cancellationRate,
            subscriptions: subCancellation.cancellationRate,
          },
          attendance: attendance,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchDashboardStats();
  }, [activeTab]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login?admin=true");
      return;
    }
    if (!loading && isAuthenticated && !isAdmin) {
      router.push("/dashboard");
      return;
    }
  }, [isAuthenticated, isAdmin, loading, router]);

  useEffect(() => {
    if (activeTab === "users" && (isAdmin || isSuperAdmin)) {
      loadUsers();
    }
  }, [activeTab, isAdmin, isSuperAdmin]);

  const handleOpenReports = async () => {
    setLoadingReports(true);
    try {
      const token = localStorage.getItem("providence_token");
      const headers = { Authorization: `Bearer ${token}` };
      const [
        subscriptionStats,
        reservationCancellation,
        subscriptionMetrics,
        attendanceStats,
      ] = await Promise.all([
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/admin/stats`,
          { headers },
        ).then((r) => r.json()),
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/reservations/stats/cancellation-rate`,
          { headers },
        ).then((r) => r.json()),
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/admin/metrics`,
          { headers },
        ).then((r) => r.json()),
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/reservations/stats/attendance`,
          { headers },
        ).then((r) => r.json()),
      ]);
      setReportData({
        subscriptionStats,
        reservationCancellation,
        subscriptionMetrics,
        attendanceStats,
      });
      setShowReportsModal(true);
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar las estadísticas",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setLoadingReports(false);
    }
  };

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
      setUsers([]);
      Swal.fire({
        icon: "error",
        title: "Error al cargar usuarios",
        text: "No se pudieron cargar los usuarios. Por favor intenta nuevamente.",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setLoadingData(false);
    }
  };
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
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Redirigiendo a login...</p>
        </div>
      </div>
    );
  }
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ⬅️ AGREGAR PESTAÑAS AQUÍ */}
      <div className="bg-white flex items-center justify-center rounded-xl shadow-lg mb-8">
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
            {isSuperAdmin && (
              <button
                onClick={() => setActiveTab("AdminCreationForm")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "AdminCreationForm"
                    ? "border-red-600 text-red-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                👥 Crear Usuario
              </button>
            )}
          </nav>
        </div>
      </div>
      {/* Main Content */}
      <main className="w-full mx-auto px-20 py-8">
        {activeTab === "overview" && (
          <>
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
                      <dd className="text-3xl font-semibold text-gray-900">
                        {stats.users.total}
                      </dd>
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
                      <dd className="text-3xl font-semibold text-gray-900">
                        {stats.users.active}
                      </dd>
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
                        ${stats.revenue.total.toLocaleString("es-AR")}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            {/* Quick Actions */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                onClick={() => setActiveTab("users")}
                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition text-left"
              >
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
                    <p className="text-sm text-gray-500">
                      Ver y editar usuarios
                    </p>
                  </div>
                </div>
              </button>
              <button
                onClick={handleOpenReports}
                disabled={loadingReports}
                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition text-left"
              >
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
                    <h3 className="text-lg font-medium text-gray-900">
                      {loadingReports ? "Cargando..." : "Reportes"}
                    </h3>
                    <p className="text-sm text-gray-500">Ver estadísticas</p>
                  </div>
                </div>
              </button>
              <button className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition text-left">
                <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
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
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        ⏰ Horario Pico
                      </h3>
                      <p className="text-sm text-gray-500">
                        {stats.peakHour.hour} - {stats.peakHour.reservations}{" "}
                        reservas
                      </p>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </>
        )}
        {activeTab === "turns" && <TurnsTab />}
        {activeTab === "activities" && <ActivityTab />}
        {activeTab === "users" && <UsersTab />}
        {activeTab === "reservations" && <ReservationsTab />}
        {activeTab === "AdminCreationForm" && <AdminCreationFormTab />}
      </main>
      {/* MODAL DE REPORTES */}
      {showReportsModal && reportData && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header del Modal */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                📊 Reportes y Estadísticas
              </h2>
              <button
                onClick={() => setShowReportsModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="p-6 space-y-6">
              {/* Sección 2: Tasas de Cancelación */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tasa de Cancelación de Reservas */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    📅 Reservas - Tasa de Cancelación
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Reservas:</span>
                      <span className="font-bold text-gray-900">
                        {reportData.reservationCancellation.total}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Canceladas:</span>
                      <span className="font-bold text-red-600">
                        {reportData.reservationCancellation.cancelled}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Completadas:</span>
                      <span className="font-bold text-green-600">
                        {reportData.reservationCancellation.completed}
                      </span>
                    </div>
                    <div className="pt-3 border-t">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold">
                          Tasa de Cancelación:
                        </span>
                        <span className="text-2xl font-bold text-red-600">
                          {reportData.reservationCancellation.cancellationRate}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">
                          Tasa de Completitud:
                        </span>
                        <span className="text-2xl font-bold text-green-600">
                          {reportData.reservationCancellation.completionRate}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Métricas de Suscripciones */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    💳 Métricas de Suscripciones
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total:</span>
                      <span className="font-bold text-gray-900">
                        {reportData.subscriptionMetrics.total}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Activas:</span>
                      <span className="font-bold text-green-600">
                        {reportData.subscriptionMetrics.active}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        ⚠️ Por vencer (7 días):
                      </span>
                      <span className="font-bold text-yellow-600">
                        {reportData.subscriptionMetrics.expiringSoon}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        Expiradas (último mes):
                      </span>
                      <span className="font-bold text-red-600">
                        {reportData.subscriptionMetrics.expiredRecently}
                      </span>
                    </div>
                    <div className="pt-3 border-t">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold">
                          Tasa de Retención:
                        </span>
                        <span className="text-2xl font-bold text-green-600">
                          {reportData.subscriptionMetrics.retentionRate}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">
                          Tasa de Expiración:
                        </span>
                        <span className="text-2xl font-bold text-orange-600">
                          {reportData.subscriptionMetrics.expirationRate}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Sección 3: Promedio de Asistencia por Actividad */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  🎯 Promedio de Asistencia por Actividad
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Actividad
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                          Total Reservas
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                          Completadas
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                          Canceladas
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                          Tasa de Asistencia
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {reportData.attendanceStats.map(
                        (activity: any, index: number) => (
                          <tr key={index} className="hover:bg-white/50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {activity.activityName}
                            </td>
                            <td className="px-4 py-3 text-sm text-center text-gray-600">
                              {activity.totalReservations}
                            </td>
                            <td className="px-4 py-3 text-sm text-center text-green-600 font-semibold">
                              {activity.completed}
                            </td>
                            <td className="px-4 py-3 text-sm text-center text-red-600 font-semibold">
                              {activity.cancelled}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-bold ${
                                  activity.attendanceRate >= 80
                                    ? "bg-green-100 text-green-800"
                                    : activity.attendanceRate >= 60
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                }`}
                              >
                                {activity.attendanceRate}%
                              </span>
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
