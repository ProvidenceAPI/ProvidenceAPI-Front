"use client";

import { useState, useEffect } from "react";

import { useCalendar } from "src/contexts/CalendarContext";
import { reservationService } from "src/app/lib";
import { Turn } from "src/interfaces/Turn";
import CalendarView from "src/components/CalendarView";
import Swal from "sweetalert2";
import { format, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { useAppContext } from "src/contexts/AppContext";

export default function TurnsManagementPage() {
  const { isSuperAdmin } = useAppContext();
  const {
    activities,
    turns,
    loading,
    selectedDate,
    setSelectedDate,
    fetchTurns,
    refetchAll,
  } = useCalendar();

  const [selectedActivity, setSelectedActivity] = useState<string>("");
  const [filterActivity, setFilterActivity] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  // Recargar turnos cuando cambia la fecha o filtros
  useEffect(() => {
    const startDate = new Date(selectedDate);
    startDate.setDate(1);
    const endDate = new Date(selectedDate);
    endDate.setMonth(endDate.getMonth() + 1, 0);

    fetchTurns({
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
      ...(filterActivity && { activityId: filterActivity }),
      ...(filterStatus && { status: filterStatus }),
    });
  }, [selectedDate, filterActivity, filterStatus, fetchTurns]);

  // Obtener turnos de un día específico
  const getTurnsForDay = (day: Date) => {
    return turns.filter((turn) => isSameDay(new Date(turn.date), day));
  };

  // Ver detalles de un día
  const handleDayClick = (day: Date) => {
    const dayTurns = getTurnsForDay(day);

    if (dayTurns.length === 0) {
      Swal.fire(
        "📭 Sin turnos",
        "No hay turnos programados para este día",
        "info"
      );
      return;
    }

    Swal.fire({
      title: `📅 ${format(day, "EEEE d 'de' MMMM", { locale: es })}`,
      html: `
        <div class="text-left space-y-3">
          <p class="text-gray-600 mb-4">Total de turnos: ${dayTurns.length}</p>
          ${dayTurns
            .map(
              (turn) => `
            <div class="p-4 rounded-lg ${
              turn.status === "available"
                ? "bg-green-50 border border-green-200"
                : turn.status === "full"
                ? "bg-yellow-50 border border-yellow-200"
                : "bg-red-50 border border-red-200"
            }">
              <div class="flex justify-between items-start mb-2">
                <div>
                  <div class="font-bold text-gray-900">${
                    (turn as any).activityName || turn.activity?.name || 'Actividad'
                  }</div>
                  <div class="text-sm text-gray-600">${turn.startTime} - ${
                turn.endTime
              }</div>
                </div>
                <span class="px-2 py-1 rounded text-xs font-medium ${
                  turn.status === "available"
                    ? "bg-green-100 text-green-800"
                    : turn.status === "full"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }">
                  ${
                    turn.status === "available"
                      ? "✅ Disponible"
                      : turn.status === "full"
                      ? "⚠️ Lleno"
                      : "❌ Cancelado"
                  }
                </span>
              </div>
              <div class="flex gap-4 text-sm">
                <span class="text-gray-600">
                  👥 ${turn.availableSpots}/${(turn as any).capacity ?? '-'} disponibles
                </span>
                ${
                  (turn as any).reservations
                    ? `
                  <span class="text-blue-600">
                    📋 ${(turn as any).reservations.length} reservas
                  </span>
                `
                    : ""
                }
              </div>
              <div class="mt-3 flex gap-2">
                <button
                  onclick="window.editTurn('${turn.id}')"
                  class="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                >
                  ✏️ Editar
                </button>
                <button
                  onclick="window.cancelTurn('${turn.id}')"
                  class="px-3 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-700"
                  ${turn.status === "cancelled" ? "disabled" : ""}
                >
                  ⏸️ Cancelar
                </button>
                ${
                  turn.availableSpots === (turn as any).capacity && isSuperAdmin
                    ? `
                  <button
                    onclick="window.deleteTurn('${turn.id}')"
                    class="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                  >
                    🗑️ Eliminar
                  </button>
                `
                    : ""
                }
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      `,
      width: 700,
      confirmButtonText: "Cerrar",
      confirmButtonColor: "#6b7280",
    });

    // Funciones globales para los botones
    (window as any).editTurn = (turnId: string) => {
      Swal.close();
      handleEditTurn(turnId);
    };

    (window as any).cancelTurn = (turnId: string) => {
      Swal.close();
      handleCancelTurn(turnId);
    };

    (window as any).deleteTurn = (turnId: string) => {
      Swal.close();
      handleDeleteTurn(turnId);
    };
  };

  // Generar turnos automáticamente
  const handleGenerateTurns = async () => {
    if (!selectedActivity) {
      Swal.fire(
        "⚠️ Selecciona actividad",
        "Primero selecciona una actividad",
        "warning"
      );
      return;
    }

    const activity = activities.find((a) => a.id === selectedActivity);

    const { value: dates } = await Swal.fire({
      title: `📅 Generar Turnos - ${activity?.name}`,
      html: `
        <div class="space-y-4 text-left">
          <p class="text-sm text-gray-600 mb-4">
            Los turnos se generarán según el horario configurado de la actividad
          </p>
          <div>
            <label class="block text-sm font-medium mb-2">Fecha inicio</label>
            <input 
              type="date" 
              id="startDate" 
              class="w-full p-2 border rounded"
              min="${new Date().toISOString().split("T")[0]}"
            >
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Fecha fin</label>
            <input 
              type="date" 
              id="endDate" 
              class="w-full p-2 border rounded"
              min="${new Date().toISOString().split("T")[0]}"
            >
          </div>
        </div>
      `,
      confirmButtonText: "⚡ Generar",
      confirmButtonColor: "#ef4444",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        const start = (document.getElementById("startDate") as HTMLInputElement)
          .value;
        const end = (document.getElementById("endDate") as HTMLInputElement)
          .value;
        if (!start || !end) {
          Swal.showValidationMessage("Completa ambas fechas");
          return null;
        }
        if (new Date(start) > new Date(end)) {
          Swal.showValidationMessage(
            "La fecha de inicio debe ser anterior a la fecha fin"
          );
          return null;
        }
        return { start, end };
      },
    });

    if (!dates) return;

    try {
      Swal.fire({
        title: "Generando turnos...",
        text: "Por favor espera",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const generated = await reservationService.generateTurns({
        activityId: selectedActivity,
        startDate: dates.start,
        endDate: dates.end,
      });

      await refetchAll();

      Swal.fire({
        icon: "success",
        title: "✅ Turnos Generados",
        html: `
          <p>Se generaron <strong>${generated.length} turnos</strong></p>
          <p class="text-sm text-gray-600 mt-2">Del ${format(
            new Date(dates.start),
            "dd/MM/yyyy"
          )} al ${format(new Date(dates.end), "dd/MM/yyyy")}</p>
        `,
        confirmButtonColor: "#10b981",
      });
    } catch (error: any) {
      Swal.fire("❌ Error", error.message, "error");
    }
  };

  // Crear turno manual
  const handleCreateManualTurn = async () => {
    if (!selectedActivity) {
      Swal.fire(
        "⚠️ Selecciona actividad",
        "Primero selecciona una actividad",
        "warning"
      );
      return;
    }

    const activity = activities.find((a) => a.id === selectedActivity);

    const { value: formData } = await Swal.fire({
      title: `➕ Crear Turno - ${activity?.name}`,
      html: `
        <div class="space-y-4 text-left">
          <div>
            <label class="block text-sm font-medium mb-2">Fecha</label>
            <input 
              type="date" 
              id="date" 
              class="w-full p-2 border rounded"
              min="${new Date().toISOString().split("T")[0]}"
            >
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium mb-2">Hora inicio</label>
              <input type="time" id="startTime" class="w-full p-2 border rounded">
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Hora fin</label>
              <input type="time" id="endTime" class="w-full p-2 border rounded">
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Capacidad</label>
            <input 
              type="number" 
              id="capacity" 
              class="w-full p-2 border rounded"
              value="${activity?.capacity || 20}"
              min="1"
            >
          </div>
        </div>
      `,
      confirmButtonText: "➕ Crear",
      confirmButtonColor: "#ef4444",
      showCancelButton: true,
      preConfirm: () => {
        const date = (document.getElementById("date") as HTMLInputElement)
          .value;
        const startTime = (
          document.getElementById("startTime") as HTMLInputElement
        ).value;
        const endTime = (document.getElementById("endTime") as HTMLInputElement)
          .value;
        const capacity = parseInt(
          (document.getElementById("capacity") as HTMLInputElement).value
        );

        if (!date || !startTime || !endTime || !capacity) {
          Swal.showValidationMessage("Completa todos los campos");
          return null;
        }
        return { date, startTime, endTime, capacity };
      },
    });

    if (!formData) return;

    try {
      await reservationService.createTurn({
        activityId: selectedActivity,
        ...formData,
      });

      await refetchAll();

      Swal.fire({
        icon: "success",
        title: "✅ Turno Creado",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error: any) {
      Swal.fire("❌ Error", error.message, "error");
    }
  };

  // Editar turno
  const handleEditTurn = async (turnId: string) => {
    const turn = turns.find((t) => t.id === turnId);
    if (!turn) return;

    const { value: formData } = await Swal.fire({
      title: "✏️ Editar Turno",
      html: `
        <div class="space-y-4 text-left">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium mb-2">Hora inicio</label>
              <input type="time" id="startTime" class="w-full p-2 border rounded" value="${turn.startTime}">
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Hora fin</label>
              <input type="time" id="endTime" class="w-full p-2 border rounded" value="${turn.endTime}">
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Capacidad</label>
            <input type="number" id="capacity" class="w-full p-2 border rounded" value="${(turn as any).capacity ?? turn.availableSpots ?? 20}" min="1">
          </div>
        </div>
      `,
      confirmButtonText: "💾 Guardar",
      showCancelButton: true,
      preConfirm: () => {
        const startTime = (
          document.getElementById("startTime") as HTMLInputElement
        ).value;
        const endTime = (document.getElementById("endTime") as HTMLInputElement)
          .value;
        const capacity = parseInt(
          (document.getElementById("capacity") as HTMLInputElement).value
        );
        return { startTime, endTime, capacity };
      },
    });

    if (!formData) return;

    try {
      await reservationService.updateTurn(turnId, formData);
      await refetchAll();
      Swal.fire("✅ Actualizado", "Turno actualizado correctamente", "success");
    } catch (error: any) {
      Swal.fire("❌ Error", error.message, "error");
    }
  };

  // Cancelar turno
  const handleCancelTurn = async (turnId: string) => {
    const turn = turns.find((t) => t.id === turnId);
    if (!turn) return;

    const result = await Swal.fire({
      title: "⚠️ Cancelar Turno",
      html: `
        <p>¿Estás seguro de cancelar este turno?</p>
        <div class="mt-4 p-3 bg-yellow-50 rounded text-left">
          <p class="text-sm"><strong>Actividad:</strong> ${
            (turn as any).activityName || turn.activity?.name || 'Actividad'
          }</p>
          <p class="text-sm"><strong>Fecha:</strong> ${format(
            new Date(turn.date),
            "dd/MM/yyyy"
          )}</p>
          <p class="text-sm"><strong>Horario:</strong> ${turn.startTime} - ${
        turn.endTime
      }</p>
          ${
            (turn as any).reservations?.length
              ? `
            <p class="text-sm text-red-600 mt-2">
              ⚠️ Hay ${(turn as any).reservations.length} reserva(s) que serán canceladas y los usuarios serán notificados
            </p>
          `
              : ""
          }
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "No",
    });

    if (!result.isConfirmed) return;

    try {
      await reservationService.cancelTurn(turnId);
      await refetchAll();
      Swal.fire("✅ Cancelado", "El turno ha sido cancelado", "success");
    } catch (error: any) {
      Swal.fire("❌ Error", error.message, "error");
    }
  };

  // Eliminar turno (solo si no tiene reservas)
  const handleDeleteTurn = async (turnId: string) => {
    const turn = turns.find((t) => t.id === turnId);
    if (!turn) return;

    const result = await Swal.fire({
      title: "🗑️ Eliminar Turno",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      await reservationService.deleteTurn(turnId);
      await refetchAll();
      Swal.fire("✅ Eliminado", "El turno ha sido eliminado", "success");
    } catch (error: any) {
      Swal.fire("❌ Error", error.message, "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🗓️ Gestión de Turnos
              </h1>
              <p className="text-gray-600 mt-2">
                Administra los turnos y horarios de actividades
              </p>
            </div>
          </div>

          {/* Controles */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {/* Panel de creación */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                ➕ Crear Turnos
              </h3>
              <div className="space-y-3">
                <select
                  value={selectedActivity}
                  onChange={(e) => setSelectedActivity(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Seleccionar actividad</option>
                  {activities.map((activity) => (
                    <option
                      key={activity.id}
                      value={activity.id}
                    >
                      {activity.name}
                    </option>
                  ))}
                </select>

                <div className="flex gap-2">
                  <button
                    onClick={handleGenerateTurns}
                    disabled={!selectedActivity}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ⚡ Generar Automático
                  </button>
                  <button
                    onClick={handleCreateManualTurn}
                    disabled={!selectedActivity}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ➕ Crear Manual
                  </button>
                </div>
              </div>
            </div>

            {/* Panel de filtros */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-gray-900 mb-3">🔍 Filtros</h3>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={filterActivity}
                  onChange={(e) => setFilterActivity(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Todas las actividades</option>
                  {activities.map((activity) => (
                    <option
                      key={activity.id}
                      value={activity.id}
                    >
                      {activity.name}
                    </option>
                  ))}
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Todos los estados</option>
                  <option value="available">Disponibles</option>
                  <option value="full">Llenos</option>
                  <option value="cancelled">Cancelados</option>
                </select>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600">Total Turnos</div>
              <div className="text-2xl font-bold text-gray-900">
                {turns.length}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600">Disponibles</div>
              <div className="text-2xl font-bold text-green-600">
                {turns.filter((t) => t.status === "available").length}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600">Llenos</div>
              <div className="text-2xl font-bold text-yellow-600">
                {turns.filter((t) => t.status === "full").length}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600">Cancelados</div>
              <div className="text-2xl font-bold text-red-600">
                {turns.filter((t) => t.status === "cancelled").length}
              </div>
            </div>
          </div>
        </div>

        {/* Calendario */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-lg p-12 flex justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 font-medium">
                Cargando turnos...
              </p>
            </div>
          </div>
        ) : (
          <CalendarView
            reservations={turns.map((t) => ({
              id: t.id,
              date: t.date,
              activityName: (t as any).activityName || t.activity?.name || 'Actividad',
              status: t.status,
            }))}
            onDayClick={handleDayClick}
          />
        )}
      </div>
    </div>
  );
}
