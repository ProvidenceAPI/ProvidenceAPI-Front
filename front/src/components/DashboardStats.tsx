"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAppContext } from "src/contexts/AppContext";
import { reservationService } from "src/app/lib/ReservationService";
import { Reservation } from "src/interfaces/Reservation";

export default function DashboardStats() {
  const { user } = useAppContext();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const loadUserReservations = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const userReservations = await reservationService.getUserReservations();
      console.log("Reservations loaded:", userReservations);
      setReservations(userReservations);
    } catch (error) {
      console.error("Error loading reservations:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      loadUserReservations();
    }
  }, [user?.id, loadUserReservations]);

  const handleCancelReservation = async (reservationId: string) => {
    const confirmed = window.confirm(
      "¿Estás seguro de que deseas cancelar esta reserva?"
    );

    if (!confirmed) return;

    setCancellingId(reservationId);
    try {
      await reservationService.cancelReservation(reservationId);
      alert("Reserva cancelada exitosamente");
      await loadUserReservations();
    } catch (error: any) {
      console.error("Error cancelling reservation:", error);
      alert(error.message || "Error al cancelar la reserva");
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];
    const months = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];

    return `${days[date.getDay()]} ${date.getDate()} de ${
      months[date.getMonth()]
    }`;
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "Activa",
      },
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "Pendiente",
      },
      confirmed: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "Confirmada",
      },
      completed: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        label: "Completada",
      },
      cancelled: {
        bg: "bg-red-100",
        text: "text-red-800",
        label: "Cancelada",
      },
    };

    const badge = badges[status as keyof typeof badges] || badges.pending;

    return (
      <span
        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${badge.bg} ${badge.text}`}
      >
        {badge.label}
      </span>
    );
  };


  const activeReservations = reservations.filter(
    (r) => r.status === "active" || r.status === "confirmed" || r.status === "pending"
  );
  const completedReservations = reservations.filter(
    (r) => r.status === "completed"
  );
  const cancelledReservations = reservations.filter(
    (r) => r.status === "cancelled"
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#DC2626]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
   
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Reservas Activas
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {activeReservations.length}
              </p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Clases Completadas
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {completedReservations.length}
              </p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reservas</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {reservations.length}
              </p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <svg
                className="w-8 h-8 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

 
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Mis Reservas</h2>
        </div>

        {reservations.length === 0 ? (
          <div className="p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No tienes reservas
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Comienza reservando tu primera clase
            </p>
            <div className="mt-6">
              <a
                href="/home"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#DC2626] hover:bg-[#B01C1C]"
              >
                Ver Actividades
              </a>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actividad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha y Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pago
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reservations.map((reservation) => (
                  <tr key={reservation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {reservation.activity.name || 'Actividad'}
                      </div>
                      {(reservation || reservation) && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                          🎉 Clase Gratis
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {reservation.activityDate ? formatDate(reservation.activityDate) : 'Sin fecha'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {reservation.startTime || 'Sin hora'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(reservation.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(reservation as any).isPaid ? (
                        <span className="text-green-600 text-sm font-medium">
                          ✓ Pagado
                        </span>
                      ) : reservation? (
                        <span className="text-blue-600 text-sm font-medium">
                          Gratis
                        </span>
                      ) : (
                        <span className="text-yellow-600 text-sm font-medium">
                          Pendiente
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {(reservation.status === "active" || 
                        reservation.status === "pending" || 
                        reservation.status === "confirmed") && (
                        <button
                          onClick={() => handleCancelReservation(reservation.id)}
                          disabled={cancellingId === reservation.id}
                          className={`text-red-600 hover:text-red-900 ${
                            cancellingId === reservation.id
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          {cancellingId === reservation.id
                            ? "Cancelando..."
                            : "Cancelar"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}