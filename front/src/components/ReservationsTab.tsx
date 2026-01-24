"use client";

import { useState, useEffect } from "react";
import { apiClient } from "src/app/lib/apiClient";
import Swal from "sweetalert2";
import ManualReservationForm from "./ManualReservationForm";
import { Reservation } from "src/interfaces/Reservation";
import { IUser } from "src/interfaces/IUser";
import { Turn } from "src/interfaces/Turn";
import { Activity } from "src/interfaces/Activity";
import { StatusMap } from "src/interfaces/StatusBadge";
import CalendarDatePicker from "./CalendarDateSelector";

export default function ReservationsTab() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTurns, setLoadingTurns] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);
  const [selectedActivityId, setSelectedActivityId] = useState<string>("");
  const [filterActivity, setFilterActivity] = useState<string>("");
  const [filterDate, setFilterDate] = useState<string>("");
  const [filterTime, setFilterTime] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [availableDatesForActivity, setAvailableDatesForActivity] = useState<
    string[]
  >([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reservationsRes, activitiesRes, usersRes] = await Promise.all([
        apiClient.get("/api/reservations"),
        apiClient.get("/api/activities"),
        apiClient.get("/api/users"),
      ]);

      const reservationsData = reservationsRes.data;
      const reservationsList = Array.isArray(reservationsData)
        ? reservationsData
        : reservationsData?.data || reservationsData?.reservations || [];

      const activitiesData = activitiesRes.data;
      const activitiesList = Array.isArray(activitiesData)
        ? activitiesData
        : activitiesData?.data || activitiesData?.activities || [];

      const usersData = usersRes.data;
      const usersList = Array.isArray(usersData)
        ? usersData
        : usersData?.data || usersData?.users || [];

      setReservations(reservationsList);
      setActivities(activitiesList);
      setUsers(usersList);
    } catch (error: any) {
      console.error("Error loading data:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los datos",
      });
      setReservations([]);
      setActivities([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadTurnsForActivity = async (activityId: string, date?: string) => {
    if (!activityId) {
      setTurns([]);
      setAvailableDatesForActivity([]);
      return;
    }

    setLoadingTurns(true);
    try {
      const params: any = { activityId };
      if (date) {
        params.startDate = date;
        params.endDate = date;
      } else {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 90);
        params.startDate = startDate.toISOString().split("T")[0];
        params.endDate = endDate.toISOString().split("T")[0];
      }

      const { data } = await apiClient.get("/api/turns", { params });
      const turnsList = Array.isArray(data)
        ? data
        : data?.data || data?.turns || [];

      const availableTurns = turnsList.filter(
        (turn: Turn) =>
          turn.status !== "cancelled" &&
          turn.status !== "completed" &&
          turn.availableSpots > 0,
      );
      const uniqueDates = Array.from(
        new Set(availableTurns.map((turn: Turn) => turn.date)),
      ) as string[];
      setAvailableDatesForActivity(uniqueDates);
      if (date) {
        setTurns(availableTurns.filter((turn: Turn) => turn.date === date));
      } else {
        setTurns(availableTurns);
      }
    } catch (error: any) {
      console.error("Error loading turns:", error);
      setAvailableDatesForActivity([]);
      setTurns([]);
    } finally {
      setLoadingTurns(false);
    }
  };

  const handleChangeReservationTurn = async (turnId: string) => {
    if (!selectedReservation) return;

    try {
      await apiClient.patch(
        `/api/reservations/${selectedReservation.id}/turn`,
        {
          turnId,
        },
      );

      await Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: "Reserva reasignada a otra actividad correctamente",
      });

      closeAssignModal();
      loadData();
    } catch (error: any) {
      console.error("Error changing reservation turn:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message || "No se pudo reasignar la reserva",
      });
    }
  };

  const handleCancelReservation = async (reservationId: string) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción cancelará la reserva",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "No",
    });

    if (!result.isConfirmed) return;

    try {
      await apiClient.put(`/api/reservations/${reservationId}/cancel`);
      await Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: "Reserva cancelada correctamente",
      });
      loadData();
    } catch (error: any) {
      console.error("Error canceling reservation:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "No se pudo cancelar la reserva",
      });
    }
  };
  const openAssignModal = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setShowAssignModal(true);
  };

  const closeAssignModal = () => {
    setShowAssignModal(false);
    setSelectedReservation(null);
    setSelectedActivityId("");
    setSelectedDate("");
    setAvailableDatesForActivity([]);
    setTurns([]);
  };

  const handleAssignSubmit = () => {
    const select = document.getElementById("turn-select") as HTMLSelectElement;
    if (select && select.value) {
      handleChangeReservationTurn(select.value);
    } else {
      Swal.fire({
        icon: "warning",
        title: "Selecciona un turno",
        text: "Debes seleccionar una actividad y un turno para reasignar la reserva",
      });
    }
  };

  const clearFilters = () => {
    setFilterActivity("");
    setFilterDate("");
    setFilterTime("");
    setFilterStatus("");
  };

  const filteredReservations = reservations.filter((reservation) => {
    const activityName =
      reservation.activity?.name || reservation.turn?.activity?.name || "";
    const reservationDate = reservation.activityDate.split("T")[0];
    const reservationTime = reservation.startTime.substring(0, 5);

    if (
      filterActivity &&
      activityName.toLowerCase() !== filterActivity.toLowerCase()
    ) {
      return false;
    }
    if (filterDate && reservationDate !== filterDate) {
      return false;
    }
    if (filterTime && reservationTime !== filterTime) {
      return false;
    }
    if (filterStatus && reservation.status !== filterStatus) {
      return false;
    }
    return true;
  });

  const hasActiveFilters =
    filterActivity || filterDate || filterTime || filterStatus;

  const getStatusBadge = (status: string) => {
    const statusMap: StatusMap = {
      confirmed: { color: "bg-green-100 text-green-800", text: "Confirmada" },
      cancelled: { color: "bg-red-100 text-red-800", text: "Cancelada" },
      completed: { color: "bg-blue-100 text-blue-800", text: "Completada" },
    };

    const statusInfo = statusMap[status] || {
      color: "bg-gray-100 text-gray-800",
      text: status,
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
      >
        {statusInfo.text}
      </span>
    );
  };
  const formatReservationDate = (date: string): string => {
    const [year, month, day] = date.split("T")[0].split("-");
    const dateObj = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
    );
    return dateObj.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTurnDate = (date: string): string => {
    return new Date(date).toLocaleDateString("es-ES", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getActivityName = (reservation: Reservation): string => {
    return (
      reservation.activity?.name || reservation.turn?.activity?.name || "N/A"
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con botón de crear */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Gestión de Reservas
        </h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-red-600 text-white text-lg px-12 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
        >
          + Crear Reserva
        </button>
      </div>
      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Actividad
            </label>
            <select
              value={filterActivity}
              onChange={(e) => setFilterActivity(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">Todas</option>
              {activities.map((activity) => (
                <option key={activity.id} value={activity.name}>
                  {activity.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha
            </label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hora
            </label>
            <input
              type="time"
              value={filterTime}
              onChange={(e) => setFilterTime(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">Todos</option>
              <option value="confirmed">Confirmada</option>
              <option value="cancelled">Cancelada</option>
              <option value="completed">Completada</option>
            </select>
          </div>
        </div>
        {/* Botón limpiar filtros */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="mt-4 text-sm text-red-600 hover:text-red-700"
          >
            Limpiar filtros
          </button>
        )}
      </div>
      {/* ========== TABLA DE RESERVAS ========== */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actividad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hora
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
              {filteredReservations.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No hay reservas que coincidan con los filtros
                  </td>
                </tr>
              ) : (
                filteredReservations.map((reservation) => (
                  <tr key={reservation.id} className="hover:bg-gray-50">
                    {/* Usuario */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {reservation.user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {reservation.user.email}
                        </div>
                      </div>
                    </td>
                    {/* Actividad */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getActivityName(reservation)}
                    </td>
                    {/* Fecha */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatReservationDate(reservation.activityDate)}
                    </td>
                    {/* Hora */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {reservation.startTime}
                      {reservation.endTime && ` - ${reservation.endTime}`}
                    </td>
                    {/* Estado */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(reservation.status)}
                    </td>
                    {/* Acciones */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {reservation.status === "confirmed" && (
                        <>
                          <button
                            onClick={() => openAssignModal(reservation)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Reasignar
                          </button>
                          <button
                            onClick={() =>
                              handleCancelReservation(reservation.id)
                            }
                            className="text-red-600 hover:text-red-900"
                          >
                            Cancelar
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* ========== MODAL DE REASIGNACIÓN ========== */}
      {showAssignModal && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header del modal */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Reasignar Reserva
                </h3>
                <button
                  onClick={closeAssignModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Información actual */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">
                  📋 Reserva Actual
                </h4>
                <div className="space-y-1 text-sm text-blue-800">
                  <p>
                    <strong>Usuario:</strong> {selectedReservation.user.name} (
                    {selectedReservation.user.email})
                  </p>
                  <p>
                    <strong>Actividad:</strong>{" "}
                    {getActivityName(selectedReservation)}
                  </p>
                  <p>
                    <strong>Fecha:</strong>{" "}
                    {formatReservationDate(selectedReservation.activityDate)}
                  </p>
                  <p>
                    <strong>Horario:</strong> {selectedReservation.startTime}
                    {selectedReservation.endTime &&
                      ` - ${selectedReservation.endTime}`}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Columna izquierda: Selección de actividad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    1️⃣ Seleccionar actividad
                  </label>
                  <select
                    value={selectedActivityId}
                    onChange={(e) => {
                      setSelectedActivityId(e.target.value);
                      setSelectedDate("");
                      setTurns([]);
                      loadTurnsForActivity(e.target.value);
                    }}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Seleccionar actividad...</option>
                    {activities.map((activity) => {
                      const isCurrent =
                        activity.id ===
                        (selectedReservation?.activity?.id ||
                          selectedReservation?.turn?.activityId);
                      return (
                        <option key={activity.id} value={activity.id}>
                          {activity.name} {isCurrent && "(Actual)"}
                        </option>
                      );
                    })}
                  </select>

                  {selectedActivityId && !loadingTurns && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600">
                        <strong>Capacidad:</strong>{" "}
                        {activities.find((a) => a.id === selectedActivityId)
                          ?.capacity || "N/A"}{" "}
                        personas
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        <strong>Fechas disponibles:</strong>{" "}
                        {availableDatesForActivity.length}
                      </p>
                    </div>
                  )}
                </div>

                {/* Columna derecha: Calendario */}
                <div>
                  {selectedActivityId && (
                    <>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        2️⃣ Seleccionar fecha
                      </label>
                      {loadingTurns ? (
                        <div className="flex items-center justify-center py-12 bg-gray-50 rounded-lg">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                            <p className="text-sm text-gray-500">
                              Cargando fechas disponibles...
                            </p>
                          </div>
                        </div>
                      ) : availableDatesForActivity.length === 0 ? (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            ⚠️ No hay fechas disponibles para esta actividad en
                            los próximos 90 días.
                          </p>
                        </div>
                      ) : (
                        <CalendarDatePicker
                          availableDates={availableDatesForActivity}
                          selectedDate={selectedDate}
                          onDateSelect={(date) => {
                            setSelectedDate(date);
                            loadTurnsForActivity(selectedActivityId, date);
                          }}
                        />
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Lista de turnos del día seleccionado */}
              {selectedDate && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    3️⃣ Seleccionar horario
                  </label>
                  {loadingTurns ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-sm text-gray-500 mt-2">
                        Cargando horarios...
                      </p>
                    </div>
                  ) : turns.length === 0 ? (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        No hay turnos disponibles para esta fecha.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-2">
                      {turns.map((turn) => (
                        <button
                          key={turn.id}
                          type="button"
                          onClick={() => {
                            const turnSelect = document.getElementById(
                              "turn-select",
                            ) as HTMLInputElement;
                            if (turnSelect) turnSelect.value = turn.id;
                            // Marcar visualmente el seleccionado
                            document
                              .querySelectorAll(".turn-option")
                              .forEach((el) =>
                                el.classList.remove(
                                  "ring-2",
                                  "ring-blue-500",
                                  "bg-blue-50",
                                ),
                              );
                            (
                              document.activeElement as HTMLElement
                            )?.classList.add(
                              "ring-2",
                              "ring-blue-500",
                              "bg-blue-50",
                            );
                          }}
                          className="turn-option p-4 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-semibold text-gray-900">
                                {turn.startTime} - {turn.endTime}
                              </div>
                              <div className="text-xs text-gray-600 mt-1">
                                {formatTurnDate(turn.date)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div
                                className={`text-sm font-medium ${
                                  turn.availableSpots > 3
                                    ? "text-green-600"
                                    : turn.availableSpots > 0
                                      ? "text-orange-600"
                                      : "text-red-600"
                                }`}
                              >
                                {turn.availableSpots} cupos
                              </div>
                              <div className="text-xs text-gray-500">
                                disponibles
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {/* Input hidden para guardar el turnId seleccionado */}
                  <input type="hidden" id="turn-select" />
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex gap-3 mt-6 pt-6 border-t">
                <button
                  onClick={handleAssignSubmit}
                  disabled={
                    !selectedActivityId || !selectedDate || turns.length === 0
                  }
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ✅ Confirmar Reasignación
                </button>
                <button
                  onClick={closeAssignModal}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ========== FORMULARIO DE CREAR RESERVA ========== */}
      {showCreateForm && (
        <ManualReservationForm
          users={users}
          activities={activities}
          onClose={() => {
            setShowCreateForm(false);
          }}
          onSuccess={() => {
            loadData();
          }}
        />
      )}
    </div>
  );
}
