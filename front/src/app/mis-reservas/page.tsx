"use client";

import { useAppContext } from "src/contexts/AppContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Reservation } from "src/interfaces/Reservation";
import { activityService, reservationService } from "src/app/lib";
import Swal from "sweetalert2";
import { Activity } from "src/interfaces/Activity";
import { Turn } from "src/interfaces/Turn";

export default function MisReservasPage() {
  const { user, isAuthenticated, loading } = useAppContext();
  const router = useRouter();
  const [reservas, setReservas] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showReservaModal, setShowReservaModal] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableTurns, setAvailableTurns] = useState<Turn[]>([]);
  const [loadingDates, setLoadingDates] = useState(false);
  const [loadingTurns, setLoadingTurns] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchMisReservas();
      fetchActivities();
    }
  }, [isAuthenticated, user]);

  const fetchMisReservas = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await reservationService.getUserReservations();
      setReservas(data);
    } catch (error: any) {
      console.error("Error cargando reservas:", error);
      setError(error.message || "Error al cargar tus reservas");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const data = await activityService.getActiveActivities();
      setActivities(data);
    } catch (error) {
      console.error("Error cargando actividades:", error);
    }
  };

  const fetchDatesForActivity = async (activityId: string) => {
    try {
      setLoadingDates(true);
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + 30);
      const turns = await reservationService.getAvailableTurns(activityId);
      const uniqueDates = [...new Set(turns.map((turn) => turn.date))].sort();
      setAvailableDates(uniqueDates);
    } catch (error) {
      console.error("❌ Error cargando fechas:", error);
      setAvailableDates([]);
    } finally {
      setLoadingDates(false);
    }
  };

  const fetchTurnsForDate = async (activityId: string, date: string) => {
    try {
      setLoadingTurns(true);
      const allTurns = await reservationService.getAvailableTurns(activityId);
      const turnsForDate = allTurns.filter((turn) => turn.date === date);
      setAvailableTurns(turnsForDate);
    } catch (error) {
      console.error("❌ Error cargando turnos:", error);
      setAvailableTurns([]);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los turnos disponibles",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setLoadingTurns(false);
    }
  };

  const handleActivityChange = (activityId: string) => {
    setSelectedActivity(activityId);
    setSelectedDate("");
    setAvailableDates([]);
    setAvailableTurns([]);

    if (activityId) {
      fetchDatesForActivity(activityId);
    }
  };
  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setAvailableTurns([]);
    if (date && selectedActivity) {
      fetchTurnsForDate(selectedActivity, date);
    }
  };

  const handleReservarTurno = async (turnId: string) => {
    try {
      await reservationService.createReservation({ turnId });
      Swal.fire({
        icon: "success",
        title: "¡Reserva exitosa!",
        text: "Tu turno ha sido reservado correctamente",
        confirmButtonColor: "#dc2626",
      });
      setShowReservaModal(false);
      setSelectedActivity("");
      setSelectedDate("");
      setAvailableDates([]);
      setAvailableTurns([]);
      await fetchMisReservas();
    } catch (error: any) {
      const isFreeTrialError = error.message
        ?.toLowerCase()
        .includes("free trial");
      const isSubscriptionError = error.statusCode === 403;
      if (isFreeTrialError) {
        Swal.fire({
          icon: "warning",
          title: "Clase gratis ya utilizada",
          text: "Ya has usado tu clase de prueba gratis. Suscríbete para continuar reservando clases.",
          confirmButtonColor: "#dc2626",
        });
      } else if (isSubscriptionError) {
        Swal.fire({
          icon: "info",
          title: "Suscripción requerida",
          text: "Para reservar esta actividad necesitas una suscripción activa.",
          confirmButtonColor: "#dc2626",
          confirmButtonText: "Entendido",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error al reservar",
          text: error.message || "No se pudo completar la reserva",
          confirmButtonColor: "#dc2626",
        });
      }
    }
  };

  const cancelarReserva = async (id: string) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "¿Deseas cancelar esta reserva?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "No, volver",
    });
    if (!result.isConfirmed) {
      return;
    }
    try {
      await reservationService.cancelReservation(id);
      await fetchMisReservas();
      Swal.fire({
        title: "¡Cancelada!",
        text: "Reserva cancelada exitosamente",
        icon: "success",
        confirmButtonColor: "#dc2626",
      });
    } catch (error: any) {
      console.error("Error cancelando reserva:", error);
      Swal.fire({
        title: "Error",
        text: error.message || "Error al cancelar la reserva",
        icon: "error",
        confirmButtonColor: "#dc2626",
      });
    }
  };

  const formatearFecha = (fechaString: string) => {
    const [year, month, day] = fechaString.split("-").map(Number);
    const fecha = new Date(year, month - 1, day);

    const dias = [
      "domingo",
      "lunes",
      "martes",
      "miércoles",
      "jueves",
      "viernes",
      "sábado",
    ];
    const meses = [
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "octubre",
      "noviembre",
      "diciembre",
    ];
    return `${dias[fecha.getDay()]}, ${fecha.getDate()} de ${meses[fecha.getMonth()]} de ${fecha.getFullYear()}`;
  };

  const formatearHora = (horaString: string) => {
    if (!horaString) return "-";
    const [horas, minutos] = horaString.split(":");
    return `${horas}:${minutos}`;
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "confirmed":
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEstadoTexto = (estado: string) => {
    const estados: Record<string, string> = {
      active: "Activa",
      pending: "Pendiente",
      confirmed: "Confirmada",
      cancelled: "Cancelada",
      completed: "Completada",
    };
    return estados[estado] || estado;
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8 flex justify-between items-center px-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mis Reservas</h1>
            <p className="text-gray-600 mt-2">
              Gestiona todas tus reservas de actividades
            </p>
          </div>

          <button
            onClick={() => setShowReservaModal(true)}
            className="px-16 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg font-medium hover:from-red-700 hover:to-orange-700 transition whitespace-nowrap"
          >
            ➕ Nueva Reserva
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha y Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actividad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Detalles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reservas.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No tienes reservas aún.
                      <button
                        onClick={() => setShowReservaModal(true)}
                        className="text-red-600 hover:text-red-700 font-medium ml-1"
                      >
                        ¡Reserva tu primera clase!
                      </button>
                    </td>
                  </tr>
                ) : (
                  reservas.map((reserva) => (
                    <tr key={reserva.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 capitalize">
                          {formatearFecha(reserva.activityDate)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatearHora(reserva.startTime)}
                          {reserva.endTime &&
                            ` - ${formatearHora(reserva.endTime)}`}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {reserva.activity.name}
                        </div>
                        {reserva.turn?.isFreeTrial && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                            Clase Gratis
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          Capacidad: {reserva.activity.capacity || "-"}
                        </div>
                        <div className="text-sm text-gray-500">
                          Cupos disponibles:{" "}
                          {reserva.turn?.availableSpots ?? "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoColor(reserva.status)}`}
                        >
                          {getEstadoTexto(reserva.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                        {(reserva.status === "pending" ||
                          reserva.status === "active" ||
                          reserva.status === "confirmed") && (
                          <button
                            onClick={() => cancelarReserva(reserva.id)}
                            className="text-red-600 hover:text-red-900 font-medium"
                          >
                            Cancelar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL DE NUEVA RESERVA */}
      {showReservaModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold">Nueva Reserva</h2>
              <button
                onClick={() => {
                  setShowReservaModal(false);
                  setSelectedActivity("");
                  setSelectedDate("");
                  setAvailableDates([]);
                  setAvailableTurns([]);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* PASO 1: Selector de actividad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  1️⃣ Selecciona una actividad
                </label>
                <select
                  value={selectedActivity}
                  onChange={(e) => handleActivityChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">Seleccionar actividad...</option>
                  {activities.map((activity) => (
                    <option key={activity.id} value={activity.id}>
                      {activity.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* PASO 2: Selector de fecha */}
              {selectedActivity && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    2️⃣ Selecciona una fecha
                  </label>
                  {loadingDates ? (
                    <div className="text-center py-4">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                      <p className="mt-2 text-sm text-gray-600">
                        Cargando fechas disponibles...
                      </p>
                    </div>
                  ) : availableDates.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      No hay fechas disponibles para esta actividad
                    </div>
                  ) : (
                    <select
                      value={selectedDate}
                      onChange={(e) => handleDateChange(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="">Seleccionar fecha...</option>
                      {availableDates.map((date) => (
                        <option key={date} value={date}>
                          {formatearFecha(date)}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* PASO 3: Lista de turnos disponibles */}
              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    3️⃣ Selecciona un horario
                  </label>
                  {loadingTurns ? (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                      <p className="mt-2 text-gray-600">Cargando horarios...</p>
                    </div>
                  ) : availableTurns.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No hay turnos disponibles para esta fecha
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {availableTurns.map((turn) => (
                        <div
                          key={turn.id}
                          className="border border-gray-200 rounded-lg p-4 hover:border-red-500 hover:shadow-md transition"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="font-semibold text-gray-900">
                                {formatearHora(turn.startTime)} -{" "}
                                {formatearHora(turn.endTime)}
                              </div>
                              {turn.activity?.duration && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {turn.activity.duration} minutos
                                </div>
                              )}
                            </div>
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                              {turn.availableSpots} cupos
                            </span>
                          </div>
                          {turn.isFreeTrial && (
                            <div className="mb-3">
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                ✨ Clase Gratis
                              </span>
                            </div>
                          )}
                          <button
                            onClick={() => handleReservarTurno(turn.id)}
                            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
                          >
                            Reservar
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
