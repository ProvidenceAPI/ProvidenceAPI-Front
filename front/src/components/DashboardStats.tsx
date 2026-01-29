"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAppContext } from "src/contexts/AppContext";
import { reservationService } from "src/app/lib/ReservationService";
import { Reservation } from "src/interfaces/Reservation";
import { reservationChannel } from "src/utils/broadcastChannel";
import Swal from "sweetalert2";
import { getTranslatedErrorMessage } from "src/app/lib/errorTranslations";

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
      setReservations(userReservations);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) loadUserReservations();
  }, [user?.id, loadUserReservations]);

  const handleCancelReservation = async (reservationId: string) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "¿Deseas cancelar esta reserva?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "No",
    });

    if (!result.isConfirmed) return;

    setCancellingId(reservationId);
    try {
      await reservationService.cancelReservation(reservationId);
      await Swal.fire("¡Éxito!", "Reserva cancelada", "success");
      loadUserReservations();
    } catch (error: any) {
      Swal.fire(
        "Error",
        getTranslatedErrorMessage(error, "Error al cancelar"),
        "error",
      );
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: any = {
      active: "bg-green-100 text-green-800",
      confirmed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      completed: "bg-blue-100 text-blue-800",
      cancelled: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-3 py-1 text-xs font-semibold rounded-full ${styles[status]}`}
      >
        {status}
      </span>
    );
  };

  useEffect(() => {
    const handler = () => loadUserReservations();
    reservationChannel.addEventListener("message", handler);
    return () => reservationChannel.removeEventListener("message", handler);
  }, [loadUserReservations]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin h-12 w-12 border-4 border-t-[#DC2626] rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: "Reservas Activas", value: reservations.length },
          { label: "Clases Completadas", value: reservations.filter(r => r.status === "completed").length },
          { label: "Total Reservas", value: reservations.length },
        ].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow">
            <p className="text-sm text-gray-500">{item.label}</p>
            <p className="text-3xl font-bold mt-2">{item.value}</p>
          </div>
        ))}
      </div>

      {/* MOBILE CARDS */}
      <div className="space-y-4 md:hidden">
        {reservations.map((r) => (
          <div key={r.id} className="bg-white rounded-xl shadow p-4 space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">{r.activity.name}</h3>
              {getStatusBadge(r.status)}
            </div>

            <p className="text-sm text-gray-600">
              {r.activityDate ? formatDate(r.activityDate) : "Sin fecha"} ·{" "}
              {r.startTime || "Sin hora"}
            </p>

            <div className="flex justify-between items-center pt-2">
              <span className="text-sm font-medium text-green-600">
                {(r as any).isPaid ? "✓ Pagado" : "Gratis"}
              </span>

              {(r.status === "active" ||
                r.status === "pending" ||
                r.status === "confirmed") && (
                <button
                  onClick={() => handleCancelReservation(r.id)}
                  disabled={cancellingId === r.id}
                  className="text-red-600 text-sm"
                >
                  {cancellingId === r.id ? "Cancelando..." : "Cancelar"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              {["Actividad", "Fecha", "Estado", "Pago", "Acciones"].map(h => (
                <th key={h} className="px-6 py-3 text-left text-xs text-gray-500">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reservations.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-6 py-4 font-medium">{r.activity.name}</td>
                <td className="px-6 py-4">
                  {r.activityDate ? formatDate(r.activityDate) : "-"}
                </td>
                <td className="px-6 py-4">{getStatusBadge(r.status)}</td>
                <td className="px-6 py-4">
                  {(r as any).isPaid ? "Pagado" : "Gratis"}
                </td>
                <td className="px-6 py-4">
                  {(r.status === "active" ||
                    r.status === "pending" ||
                    r.status === "confirmed") && (
                    <button
                      onClick={() => handleCancelReservation(r.id)}
                      className="text-red-600"
                    >
                      Cancelar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
