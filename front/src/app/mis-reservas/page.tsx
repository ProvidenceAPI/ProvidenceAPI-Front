"use client";

import { useAppContext } from "src/contexts/AppContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Reservation } from "src/interfaces/Reservation";
import { activityService, reservationService } from "src/app/lib";
import Swal from "sweetalert2";
import { Activity } from "src/interfaces/Activity";
import { Turn } from "src/interfaces/Turn";
import CalendarDatePicker from "src/components/CalendarDateSelector";
import { getTranslatedErrorMessage } from "src/app/lib/errorTranslations";

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
  const [filtroEstado, setFiltroEstado] = useState<string>("all");
  const [filtroActividad, setFiltroActividad] = useState<string>("all");
  const [filtroFecha, setFiltroFecha] = useState<string>("all");

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
      const sortedData = data.sort((a, b) => {
        const dateA = new Date(`${a.activityDate}T${a.startTime}`);
        const dateB = new Date(`${b.activityDate}T${b.startTime}`);
        return dateA.getTime() - dateB.getTime();
      });
      setReservas(sortedData);
    } catch (error: any) {
      setError(error.message || "Error al cargar tus reservas");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchActivities = async () => {
    const data = await activityService.getActiveActivities();
    setActivities(data);
  };

  const fetchDatesForActivity = async (activityId: string) => {
    try {
      setLoadingDates(true);
      const turns = await reservationService.getAvailableTurns(activityId);
      const allDates = [...new Set(turns.map((turn) => turn.date))];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const futureDates = allDates
        .filter((dateStr) => {
          const date = new Date(dateStr);
          date.setHours(0, 0, 0, 0);
          return date >= today;
        })
        .sort();
      setAvailableDates(futureDates);
    } catch (error) {
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
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

      const availableTurnsForDate = turnsForDate.filter((turn) => {
        const turnDateTime = new Date(`${turn.date}T${turn.startTime}`);
        return turnDateTime > oneHourFromNow && turn.availableSpots > 0;
      });
      setAvailableTurns(availableTurnsForDate);
      if (turnsForDate.length > 0 && availableTurnsForDate.length === 0) {
        const hasPastTurns = turnsForDate.some((turn) => {
          const turnDateTime = new Date(`${turn.date}T${turn.startTime}`);
          return turnDateTime < oneHourFromNow;
        });
        if (hasPastTurns) {
          Swal.fire({
            icon: "info",
            title: "Sin turnos disponibles",
            text: "Los turnos deben reservarse con al menos 1 hora de anticipación. Selecciona otra fecha u horario más tarde.",
            confirmButtonColor: "#dc2626",
          });
        } else {
          Swal.fire({
            icon: "info",
            title: "Sin cupos disponibles",
            text: "Todos los turnos de este día están llenos. Selecciona otra fecha.",
            confirmButtonColor: "#dc2626",
          });
        }
      }
    } catch (error) {
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
    const turn = availableTurns.find((t) => t.id === turnId);
    if (turn) {
      const turnDateTime = new Date(`${turn.date}T${turn.startTime}`);
      const now = new Date();
      if (turnDateTime < now) {
        Swal.fire({
          icon: "warning",
          title: "Turno no disponible",
          text: "No puedes reservar un turno que ya pasó",
          confirmButtonColor: "#dc2626",
        });
        return;
      }
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

      if (turnDateTime < oneHourFromNow) {
        const minutesRemaining = Math.floor(
          (turnDateTime.getTime() - now.getTime()) / (60 * 1000),
        );
        Swal.fire({
          icon: "warning",
          title: "Reserva muy próxima",
          html: `
          <p>Debes reservar con al menos <strong>1 hora de anticipación</strong>.</p>
          <p class="text-sm text-gray-600 mt-2">
            Este turno comienza en ${minutesRemaining} minutos.
          </p>
        `,
          confirmButtonColor: "#dc2626",
          confirmButtonText: "Entendido",
        });
        return;
      }
      if (turn.availableSpots <= 0) {
        Swal.fire({
          icon: "info",
          title: "Sin cupos disponibles",
          text: "Este turno ya está lleno. Por favor selecciona otro horario.",
          confirmButtonColor: "#dc2626",
        });
        return;
      }
    }
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
      const translatedMessage = getTranslatedErrorMessage(
        error,
        "Ocurrió un error al procesar tu reserva. Por favor intenta nuevamente."
      );
      
      Swal.fire({
        icon: "error",
        title: "Error al reservar",
        text: translatedMessage,
        confirmButtonColor: "#dc2626",
      });
      
      // Si es un error de disponibilidad, refrescar los turnos
      const errorMessage = error?.response?.data?.message || error?.message || "";
      const errorMessageLower = errorMessage.toLowerCase();
      if (
        errorMessageLower.includes("no available") ||
        errorMessageLower.includes("sin cupos") ||
        errorMessageLower.includes("full") ||
        errorMessageLower.includes("advance") ||
        errorMessageLower.includes("at least 1 hour")
      ) {
        if (selectedDate && selectedActivity) {
          await fetchTurnsForDate(selectedActivity, selectedDate);
        }
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
      Swal.fire({
        title: "Error",
        text: getTranslatedErrorMessage(error, "Error al cancelar la reserva"),
        icon: "error",
        confirmButtonColor: "#dc2626",
      });
    }
  };

  const formatearFecha = (fechaString: string) => {
    const [year, month, day] = fechaString.split("T")[0].split("-").map(Number);
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

  const getErrorMessage = (error: any): string => {
    if (typeof error === "string") return error;
    if (error?.message) return error.message;
    if (error?.response?.data?.message) return error.response.data.message;
    return "Error desconocido";
  };

  const isErrorType = (error: any, keyword: string): boolean => {
    const message = getErrorMessage(error).toLowerCase();
    return message.includes(keyword.toLowerCase());
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

  const reservasFiltradas = reservas.filter((reserva) => {
    if (filtroEstado !== "all" && reserva.status !== filtroEstado) {
      return false;
    }
    if (filtroActividad !== "all" && reserva.activityId !== filtroActividad) {
      return false;
    }
    if (filtroFecha !== "all") {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const fechaReserva = new Date(reserva.activityDate);
      fechaReserva.setHours(0, 0, 0, 0);
      switch (filtroFecha) {
        case "hoy":
          if (fechaReserva.getTime() !== hoy.getTime()) return false;
          break;
        case "proximas":
          if (fechaReserva < hoy) return false;
          break;
        case "pasadas":
          if (fechaReserva >= hoy) return false;
          break;
        case "esta_semana":
          const finSemana = new Date(hoy);
          finSemana.setDate(hoy.getDate() + 7);
          if (fechaReserva < hoy || fechaReserva > finSemana) return false;
          break;
        case "este_mes":
          if (
            fechaReserva.getMonth() !== hoy.getMonth() ||
            fechaReserva.getFullYear() !== hoy.getFullYear()
          )
            return false;
          break;
      }
    }
    return true;
  });

  const actividadesUnicas = Array.from(
    new Set(reservas.map((r) => r.activityId)),
  ).map((id) => {
    const reserva = reservas.find((r) => r.activityId === id);
    return {
      id,
      name: reserva?.activity?.name || "Sin nombre",
    };
  });

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
            <h1 className="text-3xl font-bold text-gray-900">
              📅 Mis Reservas
            </h1>
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
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-medium text-gray-700">
              🔍 Filtros:
            </span>
            {(filtroEstado !== "all" ||
              filtroActividad !== "all" ||
              filtroFecha !== "all") && (
              <button
                onClick={() => {
                  setFiltroEstado("all");
                  setFiltroActividad("all");
                  setFiltroFecha("all");
                }}
                className="text-xs text-red-600 hover:text-red-700 font-medium"
              >
                Limpiar filtros
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Actividad
              </label>
              <select
                value={filtroActividad}
                onChange={(e) => setFiltroActividad(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="all">Todas las actividades</option>
                {actividadesUnicas.map((actividad) => (
                  <option key={actividad.id} value={actividad.id}>
                    {actividad.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Fecha
              </label>
              <select
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="all">Todas las fechas</option>
                <option value="hoy">Hoy</option>
                <option value="esta_semana">Esta semana</option>
                <option value="este_mes">Este mes</option>
                <option value="proximas">Próximas</option>
                <option value="pasadas">Pasadas</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Estado
              </label>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="all">Todos los estados</option>
                <option value="confirmed">Confirmada</option>
                <option value="cancelled">Cancelada</option>
                <option value="completed">Completada</option>
              </select>
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-600">
            Mostrando{" "}
            <span className="font-semibold">{reservasFiltradas.length}</span> de{" "}
            <span className="font-semibold">{reservas.length}</span> reservas
          </div>
        </div>
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
                {reservasFiltradas.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      {reservas.length === 0
                        ? "No tienes reservas aún."
                        : "No se encontraron reservas con los filtros seleccionados."}
                      <button
                        onClick={() => setShowReservaModal(true)}
                        className="text-red-600 hover:text-red-700 font-medium ml-1"
                      >
                        {reservas.length === 0
                          ? "¡Reserva tu primera clase!"
                          : "Nueva reserva"}
                      </button>
                    </td>
                  </tr>
                ) : (
                  reservasFiltradas.map((reserva) => (
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
                        {reserva.isFreeTrial && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                            ✨ Clase Gratis
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
                    <CalendarDatePicker
                      availableDates={availableDates}
                      selectedDate={selectedDate}
                      onDateSelect={handleDateChange}
                    />
                  )}
                </div>
              )}
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
                      {availableTurns.map((turn) => {
                        const turnDateTime = new Date(
                          `${turn.date}T${turn.startTime}`,
                        );
                        const now = new Date();
                        const hoursRemaining = Math.floor(
                          (turnDateTime.getTime() - now.getTime()) /
                            (60 * 60 * 1000),
                        );
                        const isSoonToStart = hoursRemaining < 3;
                        return (
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
                                {/* 🔥 Indicador de tiempo restante */}
                                {isSoonToStart && (
                                  <div className="text-xs text-orange-600 font-medium mt-1">
                                    ⏰ Comienza en {hoursRemaining}h
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
                        );
                      })}
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
