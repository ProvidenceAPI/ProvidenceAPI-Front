"use client";

import { useState, useEffect, useMemo } from "react";
import { useCalendar } from "src/contexts/CalendarContext";
import { reservationService } from "src/app/lib";
import CalendarView from "src/components/CalendarView";
import Swal from "sweetalert2";
import { endOfMonth, format, isSameDay, startOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { useAppContext } from "src/contexts/AppContext";
import {
  activityChannel,
  broadcastTurnUpdate,
  turnChannel,
} from "src/utils/broadcastChannel";
import {
  Calendar,
  Filter,
  Plus,
  Zap,
  Users,
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader2,
  Clock,
} from "lucide-react";

const parseLocalDate = (dateString: string): Date => {
  const datePart = dateString.split("T")[0];
  const [year, month, day] = datePart.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
};

export default function TurnsTab() {
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

  useEffect(() => {
    const handleActivityChange = (event: MessageEvent) => {
      refetchAll();
    };
    activityChannel.addEventListener("message", handleActivityChange);
    return () => {
      activityChannel.removeEventListener("message", handleActivityChange);
    };
  }, [refetchAll]);

  const handleApiError = (
    error: any,
    defaultMessage: string = "Ocurrió un error",
  ) => {
    let title = "❌ Error";
    let message = defaultMessage;
    let icon: "error" | "warning" | "info" = "error";
    const statusCode = error.statusCode || error.response?.status;
    const errorMessage = error.message || error.response?.data?.message || "";

    if (errorMessage.includes("already exists")) {
      Swal.fire({
        icon: "warning",
        title: "⚠️ Turno Duplicado",
        text: "Ya existe un turno para esta actividad en esta fecha y horario. Por favor elige otra fecha u horario.",
        confirmButtonColor: "#ef4444",
      });
      return;
    }

    if (errorMessage.includes("inactive activities")) {
      Swal.fire({
        icon: "warning",
        title: "⚠️ Actividad Inactiva",
        text: "No se pueden crear turnos para actividades inactivas. Activa la actividad primero.",
        confirmButtonColor: "#ef4444",
      });
      return;
    }

    if (errorMessage.includes("existing reservations")) {
      Swal.fire({
        icon: "warning",
        title: "⚠️ No se Puede Eliminar",
        text: "No se puede eliminar un turno con reservas activas. Cancela el turno en su lugar.",
        confirmButtonColor: "#ef4444",
      });
      return;
    }

    switch (statusCode) {
      case 400:
        title = "❌ Datos Inválidos";
        message = errorMessage || "Los datos ingresados no son válidos";
        break;

      case 401:
        title = "🔒 No Autorizado";
        message = "Tu sesión ha expirado. Por favor inicia sesión nuevamente.";
        break;

      case 403:
        title = "🚫 Acceso Denegado";
        message =
          errorMessage || "No tienes permisos para realizar esta acción";
        icon = "warning";
        break;

      case 404:
        title = "🔍 No Encontrado";
        message = errorMessage || "El recurso solicitado no existe";
        break;

      case 409:
        title = "⚠️ Conflicto";
        message = errorMessage || "Ya existe un recurso con estos datos";
        icon = "warning";
        break;

      case 500:
        title = "💥 Error del Servidor";
        message =
          "Ocurrió un error en el servidor. Por favor intenta más tarde.";
        break;

      default:
        message = errorMessage || defaultMessage;
    }

    Swal.fire({
      icon,
      title,
      text: message,
      confirmButtonColor: "#ef4444",
    });
  };

  useEffect(() => {
    if (!filterActivity && !filterStatus) {
      return;
    }
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const filters: any = {
      startDate: format(monthStart, "yyyy-MM-dd"),
      endDate: format(monthEnd, "yyyy-MM-dd"),
    };
    if (filterActivity) {
      filters.activityId = filterActivity;
    }
    if (filterStatus) {
      filters.status = filterStatus;
    }
    fetchTurns(filters);
  }, [filterActivity, filterStatus]);

  const getTurnsForDay = (day: Date) => {
    const dayTurns = turns.filter((turn) => {
      const turnDate = parseLocalDate(turn.date);
      return isSameDay(turnDate, day);
    });
    return dayTurns;
  };

  const handleDayClick = (day: Date) => {
    const dayTurns = getTurnsForDay(day);
    if (dayTurns.length === 0) {
      Swal.fire(
        "🔭 Sin turnos",
        "No hay turnos programados para este día",
        "info",
      );
      return;
    }

    Swal.fire({
      title: `📅 ${format(day, "EEEE d 'de' MMMM", { locale: es })}`,
      html: `
      <div class="text-left space-y-3">
        <p class="text-gray-600 mb-4">Total de turnos: ${dayTurns.length}</p>
        ${dayTurns
          .map((turn) => {
            const status = (turn.status || "").toLowerCase();
            const isActive = status === "available" || status === "active";
            const isFull = status === "full";
            const isCancelled = status === "cancelled" || status === "canceled";
            const bgColor = isActive
              ? "bg-green-50 border-green-200"
              : isFull
                ? "bg-yellow-50 border-yellow-200"
                : "bg-red-50 border-red-200";
            const badgeColor = isActive
              ? "bg-green-100 text-green-800"
              : isFull
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800";
            const statusText = isActive
              ? "✅ Disponible"
              : isFull
                ? "⚠️ Lleno"
                : "❌ Cancelado";
            return `
            <div class="p-4 rounded-lg border ${bgColor}">
              <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                <div class="flex-1 min-w-0">
                  <div class="font-bold text-gray-900 truncate">${
                    (turn as any).activityName ||
                    turn.activity?.name ||
                    "Actividad"
                  }</div>
                  <div class="text-sm text-gray-600 mt-1">${turn.startTime} - ${turn.endTime}</div>
                </div>
                <span class="self-start sm:self-center px-2 py-1 rounded text-xs font-medium ${badgeColor} whitespace-nowrap">
                  ${statusText}
                </span>
              </div>
              <div class="flex flex-col xs:flex-row xs:gap-4 gap-2 text-sm">
                <span class="text-gray-600 whitespace-nowrap">
                  👥 ${turn.availableSpots}/${(turn as any).capacity ?? "-"} disponibles
                </span>
                ${
                  (turn as any).reservations
                    ? `<span class="text-blue-600 whitespace-nowrap">📋 ${(turn as any).reservations.length} reservas</span>`
                    : ""
                }
              </div>
              <div class="mt-3 flex flex-wrap gap-2">
                <button
                  onclick="window.editTurn('${turn.id}')"
                  class="px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 whitespace-nowrap"
                >
                  ✏️ Editar
                </button>
                <button
                  onclick="window.cancelTurn('${turn.id}')"
                  class="px-3 py-1.5 bg-orange-600 text-white text-xs rounded hover:bg-orange-700 whitespace-nowrap"
                  ${isCancelled ? "disabled style='opacity:0.5;cursor:not-allowed;'" : ""}
                >
                  ⏸️ Cancelar
                </button>
                ${
                  turn.availableSpots === (turn as any).capacity && isSuperAdmin
                    ? `
                  <button
                    onclick="window.deleteTurn('${turn.id}')"
                    class="px-3 py-1.5 bg-red-600 text-white text-xs rounded hover:bg-red-700 whitespace-nowrap"
                  >
                    🗑️ Eliminar
                  </button>`
                    : ""
                }
              </div>
            </div>
          `;
          })
          .join("")}
      </div>
    `,
      width: window.innerWidth < 640 ? "90%" : 700,
      confirmButtonText: "Cerrar",
      confirmButtonColor: "#6b7280",
    });

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

  const handleGenerateTurns = async () => {
    if (!selectedActivity) {
      Swal.fire(
        "⚠️ Selecciona actividad",
        "Primero selecciona una actividad",
        "warning",
      );
      return;
    }

    const activity = activities.find((a) => a.id === selectedActivity);
    const availableDays: string[] = [];
    const availableHours: { [key: string]: string[] } = {};
    const dayMapping: { [key: string]: string } = {
      Monday: "Lunes",
      Tuesday: "Martes",
      Wednesday: "Miércoles",
      Thursday: "Jueves",
      Friday: "Viernes",
      Saturday: "Sábado",
      Sunday: "Domingo",
      Lunes: "Lunes",
      Martes: "Martes",
      Miércoles: "Miércoles",
      Jueves: "Jueves",
      Viernes: "Viernes",
      Sábado: "Sábado",
      Domingo: "Domingo",
    };

    if (activity?.schedule && Array.isArray(activity.schedule)) {
      activity.schedule.forEach((scheduleItem: string) => {
        const [day, time] = scheduleItem.split(" ");
        if (day && time) {
          const normalizedDay = dayMapping[day] || day;
          if (!availableDays.includes(normalizedDay)) {
            availableDays.push(normalizedDay);
          }
          if (!availableHours[normalizedDay]) {
            availableHours[normalizedDay] = [];
          }
          availableHours[normalizedDay].push(time);
        }
      });
    }

    const { value: dates } = await Swal.fire({
      title: `📅 Generar Turnos - ${activity?.name}`,
      html: `
      <div class="space-y-4 text-left">
      <!-- Horarios configurados -->
      <div class="bg-blue-50 border border-blue-200 p-3 rounded">
        <p class="font-semibold text-blue-900 text-sm mb-2">📅 Horarios configurados:</p>
        <div class="bg-white rounded p-2 text-xs space-y-1">
          ${
            availableDays.length > 0
              ? availableDays
                  .map((day) => {
                    const hours = availableHours[day] || [];
                    return `<div class="flex justify-between flex-col xs:flex-row gap-1"><span class="font-medium">${day}</span><span class="text-gray-600 truncate">${hours.join(", ")}</span></div>`;
                  })
                  .join("")
              : '<p class="text-gray-500 text-center">No hay horarios configurados</p>'
          }
        </div>
        <p class="text-xs text-gray-600 mt-2">⏱️ Duración: ${activity?.duration || 60} minutos</p>
        <p class="text-xs text-blue-800 mt-2">ℹ️ Se generarán turnos automáticamente según estos horarios</p>
      </div>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-sm font-medium mb-2">Fecha inicio</label>
          <input 
            type="date" 
            id="startDate" 
            class="w-full p-2 border rounded text-sm"
            min="${new Date().toISOString().split("T")[0]}"
          >
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">Fecha fin</label>
          <input 
            type="date" 
            id="endDate" 
            class="w-full p-2 border rounded text-sm"
            min="${new Date().toISOString().split("T")[0]}"
          >
        </div>
      </div>
    </div>
  `,
      confirmButtonText: "⚡ Generar",
      confirmButtonColor: "#ef4444",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      width: window.innerWidth < 640 ? "90%" : "650px",
      preConfirm: () => {
        const start = (document.getElementById("startDate") as HTMLInputElement)
          .value;
        const end = (document.getElementById("endDate") as HTMLInputElement)
          .value;
        if (!start || !end) {
          Swal.showValidationMessage("Completa ambas fechas");
          return null;
        }
        if (start > end) {
          Swal.showValidationMessage(
            "La fecha de inicio debe ser anterior a la fecha fin",
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
      broadcastTurnUpdate("created");
      await refetchAll();

      Swal.fire({
        icon: "success",
        title: "✅ Turnos Generados",
        html: `
        <div class="text-center">
          <p class="text-lg font-semibold mb-2">Se generaron <strong class="text-green-600">${generated.length} turnos</strong></p>
          <p class="text-sm text-gray-600">Del ${format(
            new Date(dates.start),
            "dd/MM/yyyy",
          )} al ${format(new Date(dates.end), "dd/MM/yyyy")}</p>
        </div>
      `,
        confirmButtonColor: "#10b981",
      });
    } catch (error: any) {
      handleApiError(error, "No se pudieron generar los turnos");
    }
  };

  const handleCreateManualTurn = async () => {
    if (!selectedActivity) {
      Swal.fire(
        "⚠️ Selecciona actividad",
        "Primero selecciona una actividad",
        "warning",
      );
      return;
    }

    const activity = activities.find((a) => a.id === selectedActivity);
    const availableDays: string[] = [];
    const availableHours: { [key: string]: string[] } = {};
    const dayMapping: { [key: string]: string } = {
      Monday: "Lunes",
      Tuesday: "Martes",
      Wednesday: "Miércoles",
      Thursday: "Jueves",
      Friday: "Viernes",
      Saturday: "Sábado",
      Sunday: "Domingo",
      Lunes: "Lunes",
      Martes: "Martes",
      Miércoles: "Miércoles",
      Jueves: "Jueves",
      Viernes: "Viernes",
      Sábado: "Sábado",
      Domingo: "Domingo",
    };

    if (activity?.schedule && Array.isArray(activity.schedule)) {
      activity.schedule.forEach((scheduleItem: string) => {
        const [day, time] = scheduleItem.split(" ");
        if (day && time) {
          const normalizedDay = dayMapping[day] || day;
          if (!availableDays.includes(normalizedDay)) {
            availableDays.push(normalizedDay);
          }
          if (!availableHours[normalizedDay]) {
            availableHours[normalizedDay] = [];
          }
          availableHours[normalizedDay].push(time);
        }
      });
    }

    const { value: formData } = await Swal.fire({
      title: `➕ Crear Turno - ${activity?.name}`,
      html: `
    <div class="space-y-3 text-left">
      <!-- Horarios disponibles -->
      <div class="bg-blue-50 border border-blue-200 p-3 rounded">
        <p class="font-semibold text-blue-900 text-sm mb-2">📅 Horarios configurados:</p>
        <div class="bg-white rounded p-2 text-xs space-y-1">
          ${availableDays
            .map((day) => {
              const hours = availableHours[day] || [];
              return `<div class="flex flex-col xs:flex-row xs:justify-between gap-1"><span class="font-medium">${day}</span><span class="text-gray-600 truncate">${hours.join(", ")}</span></div>`;
            })
            .join("")}
        </div>
        <p class="text-xs text-gray-600 mt-2">⏱️ Duración: ${activity?.duration || 60} minutos</p>
      </div>
      
      <!-- Campos responsivos -->
      <div class="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3">
        <div class="xs:col-span-2 lg:col-span-1">
          <label class="block text-sm font-medium mb-1">Fecha *</label>
          <input 
            type="date" 
            id="date" 
            class="w-full p-2 border rounded text-sm"
            min="${new Date().toISOString().split("T")[0]}"
          >
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-1">Hora inicio *</label>
          <select id="startTime" class="w-full p-2 border rounded text-sm">
            <option value="">Seleccionar...</option>
            ${Array.from(new Set(Object.values(availableHours).flat()))
              .sort()
              .map((time) => `<option value="${time}">${time}</option>`)
              .join("")}
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-1">Capacidad *</label>
          <input 
            type="number" 
            id="capacity" 
            class="w-full p-2 border rounded text-sm" 
            value="${activity?.capacity || 20}" 
            min="1"
          >
        </div>
      </div>
    </div>
    `,
      confirmButtonText: "➕ Crear",
      confirmButtonColor: "#ef4444",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      width: window.innerWidth < 640 ? "90%" : "650px",
      preConfirm: () => {
        const date = (document.getElementById("date") as HTMLInputElement)
          .value;
        const startTime = (
          document.getElementById("startTime") as HTMLSelectElement
        ).value;
        const capacity = parseInt(
          (document.getElementById("capacity") as HTMLInputElement).value,
        );
        if (!date || !startTime || !capacity) {
          Swal.showValidationMessage("Completa todos los campos");
          return null;
        }

        const duration = activity?.duration || 60;
        const [hours, minutes] = startTime.split(":").map(Number);
        const endDate = new Date(2000, 0, 1, hours, minutes);
        endDate.setMinutes(endDate.getMinutes() + duration);
        const endTime = `${String(endDate.getHours()).padStart(2, "0")}:${String(endDate.getMinutes()).padStart(2, "0")}`;
        const [startHour] = startTime.split(":").map(Number);
        const endHour = endDate.getHours();

        if (startHour < 6 || endHour > 22) {
          Swal.showValidationMessage("El gimnasio abre de 6:00 AM a 10:00 PM");
          return null;
        }
        const [year, month, day] = date.split("-").map(Number);
        const selectedDate = new Date(year, month - 1, day);
        const dayNamesEs = [
          "Domingo",
          "Lunes",
          "Martes",
          "Miércoles",
          "Jueves",
          "Viernes",
          "Sábado",
        ];
        const selectedDayEs = dayNamesEs[selectedDate.getDay()];
        if (
          availableDays.length > 0 &&
          !availableDays.includes(selectedDayEs)
        ) {
          Swal.showValidationMessage(
            `❌ Esta actividad no está disponible los ${selectedDayEs}. Solo: ${availableDays.join(", ")}`,
          );
          return null;
        }

        const dayHours = availableHours[selectedDayEs] || [];
        if (dayHours.length > 0 && !dayHours.includes(startTime)) {
          Swal.showValidationMessage(
            `❌ El horario ${startTime} no está disponible para ${selectedDayEs}. Horarios: ${dayHours.join(", ")}`,
          );
          return null;
        }
        return { date, startTime, endTime, capacity };
      },
    });

    if (!formData) return;

    try {
      const createdTurn = await reservationService.createTurn({
        activityId: selectedActivity,
        ...formData,
      });
      broadcastTurnUpdate("created", createdTurn?.id);
      await refetchAll();
      Swal.fire({
        icon: "success",
        title: "✅ Turno Creado",
        text: "El turno ha sido creado exitosamente",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error: any) {
      handleApiError(error, "No se pudo crear el turno");
    }
  };

  const handleEditTurn = async (turnId: string) => {
    const turn = turns.find((t) => t.id === turnId);
    if (!turn) return;

    const { value: formData } = await Swal.fire({
      title: "✏️ Editar Turno",
      html: `
      <div class="space-y-4 text-left">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium mb-2">Hora inicio</label>
            <input type="time" id="startTime" class="w-full p-2 border rounded text-sm" value="${turn.startTime}">
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Hora fin</label>
            <input type="time" id="endTime" class="w-full p-2 border rounded text-sm" value="${turn.endTime}">
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">Capacidad</label>
          <input type="number" id="capacity" class="w-full p-2 border rounded text-sm" value="${(turn as any).capacity ?? turn.availableSpots ?? 20}" min="1">
        </div>
      </div>
    `,
      confirmButtonText: "💾 Guardar",
      showCancelButton: true,
      width: window.innerWidth < 640 ? "90%" : "500px",
      preConfirm: () => {
        const startTime = (
          document.getElementById("startTime") as HTMLInputElement
        ).value;
        const endTime = (document.getElementById("endTime") as HTMLInputElement)
          .value;
        const capacity = parseInt(
          (document.getElementById("capacity") as HTMLInputElement).value,
        );
        return { startTime, endTime, capacity };
      },
    });

    if (!formData) return;

    try {
      await reservationService.updateTurn(turnId, formData);
      broadcastTurnUpdate("updated", turnId);
      await refetchAll();
      Swal.fire("✅ Actualizado", "Turno actualizado correctamente", "success");
    } catch (error: any) {
      handleApiError(error, "No se pudo actualizar el turno");
    }
  };

  const handleCancelTurn = async (turnId: string) => {
    const turn = turns.find((t) => t.id === turnId);
    if (!turn) return;

    const result = await Swal.fire({
      title: "⚠️ Cancelar Turno",
      html: `
      <div class="text-left">
        <p>¿Estás seguro de cancelar este turno?</p>
        <div class="mt-4 p-3 bg-yellow-50 rounded">
          <p class="text-sm mb-1"><strong>Actividad:</strong> ${
            (turn as any).activityName || turn.activity?.name || "Actividad"
          }</p>
          <p class="text-sm mb-1"><strong>Fecha:</strong> ${format(
            parseLocalDate(turn.date),
            "dd/MM/yyyy",
          )}</p>
          <p class="text-sm mb-1"><strong>Horario:</strong> ${turn.startTime} - ${turn.endTime}</p>
          ${
            (turn as any).reservations?.length
              ? `
            <p class="text-sm text-red-600 mt-2">
              ⚠️ Hay ${(turn as any).reservations.length} reserva(s) que serán canceladas
            </p>
          `
              : ""
          }
        </div>
      </div>
    `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "No",
      width: window.innerWidth < 640 ? "90%" : "500px",
    });

    if (!result.isConfirmed) return;

    try {
      await reservationService.cancelTurn(turnId);
      broadcastTurnUpdate("cancelled", turnId);
      await refetchAll();
      Swal.fire("✅ Cancelado", "El turno ha sido cancelado", "success");
    } catch (error: any) {
      handleApiError(error, "No se pudo cancelar el turno");
    }
  };

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
      width: window.innerWidth < 640 ? "90%" : "400px",
    });

    if (!result.isConfirmed) return;

    try {
      await reservationService.deleteTurn(turnId);
      broadcastTurnUpdate("deleted", turnId);
      await refetchAll();
      Swal.fire("✅ Eliminado", "El turno ha sido eliminado", "success");
    } catch (error: any) {
      handleApiError(error, "No se pudo eliminar el turno");
    }
  };

  useEffect(() => {
    const handleTurnChange = (event: MessageEvent) => {
      refetchAll();
    };
    turnChannel.addEventListener("message", handleTurnChange);
    return () => {
      turnChannel.removeEventListener("message", handleTurnChange);
    };
  }, [refetchAll]);

  const mappedReservations = useMemo(() => {
    return turns.map((t) => ({
      id: t.id,
      date: t.date,
      activityName: (t as any).activityName || t.activity?.name || "Actividad",
      status: t.status,
    }));
  }, [turns]);

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-4 sm:px-4 sm:py-6 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
                🗓️ Gestión de Turnos
              </h1>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
                Administra los turnos y horarios de actividades
              </p>
            </div>
          </div>

          {/* Controles principales */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-6">
            {/* Panel de creación */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow p-3 sm:p-4">
              <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">Crear Turnos</span>
              </h3>
              <div className="space-y-2 sm:space-y-3">
                <select
                  value={selectedActivity}
                  onChange={(e) => setSelectedActivity(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
                >
                  <option value="">Seleccionar actividad</option>
                  {activities.map((activity) => (
                    <option key={activity.id} value={activity.id}>
                      {activity.name}
                    </option>
                  ))}
                </select>
                <div className="flex flex-col xs:flex-row gap-2">
                  <button
                    onClick={handleGenerateTurns}
                    disabled={!selectedActivity}
                    className="flex-1 px-3 sm:px-4 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 transition font-medium text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Generar Automático</span>
                  </button>
                  <button
                    onClick={handleCreateManualTurn}
                    disabled={!selectedActivity}
                    className="flex-1 px-3 sm:px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Crear Manual</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Panel de filtros */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow p-3 sm:p-4">
              <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2">
                <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">Filtros</span>
              </h3>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3">
                <select
                  value={filterActivity}
                  onChange={(e) => setFilterActivity(e.target.value)}
                  className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
                >
                  <option value="">Todas las actividades</option>
                  {activities.map((activity) => (
                    <option key={activity.id} value={activity.id}>
                      {activity.name}
                    </option>
                  ))}
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
                >
                  <option value="">Todos los estados</option>
                  <option value="available">Disponibles</option>
                  <option value="full">Llenos</option>
                  <option value="cancelled">Cancelados</option>
                </select>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            <div className="bg-white rounded-lg shadow p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Total Turnos</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                {turns.length}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                <span>Disponibles</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-green-600 mt-1">
                {
                  turns.filter((t) => t.status?.toLowerCase() === "available")
                    .length
                }
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
                <span>Llenos</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-yellow-600 mt-1">
                {turns.filter((t) => t.status?.toLowerCase() === "full").length}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
                <XCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                <span>Cancelados</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-red-600 mt-1">
                {
                  turns.filter((t) => t.status?.toLowerCase() === "cancelled")
                    .length
                }
              </div>
            </div>
          </div>
        </div>

        {/* Calendario */}
        {loading ? (
          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-6 sm:p-8 md:p-12 flex justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-4 border-red-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 font-medium text-sm sm:text-base">
                Cargando turnos...
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 md:p-6">
            <CalendarView
              reservations={mappedReservations}
              onDayClick={handleDayClick}
            />
          </div>
        )}
      </div>
    </div>
  );
}
