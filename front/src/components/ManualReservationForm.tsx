"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "src/app/lib/apiClient";
import { IUser } from "src/interfaces/IUser";
import { Activity } from "src/interfaces/Activity";
import Swal from "sweetalert2";
import { broadcastReservationUpdate } from "src/utils/broadcastChannel";
import { getTranslatedErrorMessage } from "src/app/lib/errorTranslations";
import CalendarDatePicker from "./CalendarDateSelector";

interface Turn {
  id: string;
  activityId: string;
  date: string;
  startTime: string;
  endTime: string;
  availableSpots: number;
  status: string;
  activity?: {
    id: string;
    name: string;
  };
}

interface ManualReservationFormProps {
  users: IUser[];
  activities: Activity[];
  onClose: () => void;
  onSuccess?: () => void;
  defaultDate?: Date;
}

export default function ManualReservationForm({
  users,
  activities,
  onClose,
  onSuccess,
  defaultDate,
}: ManualReservationFormProps) {
  const [loading, setLoading] = useState(false);
  const [loadingTurns, setLoadingTurns] = useState(false);
  const [availableTurns, setAvailableTurns] = useState<Turn[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedTurnId, setSelectedTurnId] = useState<string>("");
  const [filterDate, setFilterDate] = useState<string>(
    defaultDate ? defaultDate.toISOString().split("T")[0] : "",
  );

  const [formData, setFormData] = useState({
    userId: "",
    activityId: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const activeUsers = users.filter(
    (user) => user.status?.toLowerCase() === "active",
  );
  const sortedUsers = [...activeUsers].sort((a, b) => {
    const nameA = `${a.name} ${a.lastname || ""}`.toLowerCase();
    const nameB = `${b.name} ${b.lastname || ""}`.toLowerCase();
    return nameA.localeCompare(nameB);
  });

  const filteredUsers = searchTerm
    ? sortedUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.lastname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : sortedUsers;

  const selectedActivity = activities.find((a) => a.id === formData.activityId);
  const selectedTurn = availableTurns.find((t) => t.id === selectedTurnId);
  const loadAvailableTurns = useCallback(async () => {
    if (!formData.activityId) {
      setAvailableTurns([]);
      setAvailableDates([]);
      setSelectedTurnId("");
      return;
    }

    setLoadingTurns(true);
    try {
      
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);
      const params: any = {
        activityId: formData.activityId,
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      };

      const { data } = await apiClient.get("/api/turns", { params });
      const turnsList = Array.isArray(data)
        ? data
        : data?.data || data?.turns || [];
      
      
      const isTurnBookable = (turn: Turn): boolean => {
        if (!turn.date || !turn.startTime) return false;
        try {
          const now = new Date();
          const [year, month, day] = turn.date.split("-").map(Number);
          const [hh, mm] = turn.startTime.split(":").map(Number);
          if (
            [year, month, day, hh, mm].some(
              (n) => typeof n !== "number" || Number.isNaN(n),
            )
          ) {
            return false;
          }
          const turnDateTime = new Date(year, month - 1, day, hh, mm);
          
          if (turnDateTime <= now) return false;
         
          const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
          return turnDateTime >= oneHourFromNow;
        } catch {
          return false;
        }
      };

      const available: Turn[] = (turnsList as Turn[]).filter(
        (turn) => {
          const statusLower = (turn.status || "").toLowerCase();
          return (
            statusLower !== "cancelled" &&
            statusLower !== "completed" &&
            turn.availableSpots > 0 &&
            isTurnBookable(turn) 
          );
        },
      );
      available.sort((a: Turn, b: Turn) => {
        const dateA = new Date(`${a.date}T${a.startTime}`);
        const dateB = new Date(`${b.date}T${b.startTime}`);
        return dateA.getTime() - dateB.getTime();
      });

     
      const normalizeDate = (dateValue: string | Date): string => {
        if (typeof dateValue === "string") {
         
          return dateValue.split("T")[0].split(" ")[0];
        }
     
        const date = dateValue as Date;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const uniqueDates: string[] = Array.from(
        new Set<string>(available.map((t) => normalizeDate(t.date as string | Date))),
      ).sort();
      setAvailableDates(uniqueDates);

  
      const normalizedFilterDate = filterDate ? normalizeDate(filterDate) : "";
      const nextDate =
        normalizedFilterDate && uniqueDates.includes(normalizedFilterDate)
          ? normalizedFilterDate
          : uniqueDates[0] || "";
      
    
      if (nextDate && nextDate !== normalizedFilterDate) {
        setFilterDate(nextDate);
      }

      const visibleTurns = nextDate
        ? available.filter((t: Turn) => normalizeDate(t.date as string | Date) === nextDate)
        : available;
      setAvailableTurns(visibleTurns);
      setSelectedTurnId("");
    } catch (error: any) {
      console.error("Error loading turns:", error);
      setAvailableTurns([]);
      setAvailableDates([]);
    } finally {
      setLoadingTurns(false);
    }
  }, [formData.activityId, filterDate]);

  useEffect(() => {
    loadAvailableTurns();
  }, [loadAvailableTurns]);

  const isValidUUID = (str: string): boolean => {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.userId || formData.userId.trim() === "") {
      await Swal.fire({
        icon: "warning",
        title: "Usuario requerido",
        text: "Debes seleccionar un usuario para crear la reserva",
      });
      return;
    }

    if (!selectedTurnId || selectedTurnId.trim() === "") {
      await Swal.fire({
        icon: "warning",
        title: "Turno requerido",
        text: "Debes seleccionar un turno disponible para crear la reserva",
      });
      return;
    }

    const trimmedUserId = formData.userId.trim();
    const trimmedTurnId = selectedTurnId.trim();

    if (!isValidUUID(trimmedUserId)) {
      await Swal.fire({
        icon: "error",
        title: "Error de validación",
        text: "El ID de usuario no es válido. Por favor, selecciona un usuario nuevamente.",
      });
      return;
    }

    if (!isValidUUID(trimmedTurnId)) {
      await Swal.fire({
        icon: "error",
        title: "Error de validación",
        text: "El ID de turno no es válido. Por favor, selecciona un turno nuevamente.",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post("/api/reservations/admin", {
        turnId: selectedTurnId,
        userId: formData.userId,
      });
      broadcastReservationUpdate("created", response.data?.id);

      await Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: "Reserva creada exitosamente. Se envió un email de confirmación al usuario.",
      });
      onSuccess?.();
      onClose();
    } catch (error: any) {
      let errorMessage = "Error al crear la reserva";

      if (error?.response) {
        const data = error.response.data;

        if (data?.message) {
          errorMessage = getTranslatedErrorMessage(error, errorMessage);
        } else if (data?.error) {
          errorMessage = getTranslatedErrorMessage(
            { response: { data: { message: data.error } } },
            errorMessage,
          );
        } else if (Array.isArray(data?.message)) {
          const validationErrors = data.message.join(", ");
          errorMessage = `Error de validación: ${validationErrors}`;
        } else {
          errorMessage = getTranslatedErrorMessage(error, errorMessage);
        }
      } else if (error?.request) {
        errorMessage =
          "No se pudo conectar con el servidor. Verifica tu conexión a internet.";
      } else {
        errorMessage = error?.message || errorMessage;
      }

      await Swal.fire({
        icon: "error",
        title: "Error al crear la reserva",
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">
              Crear Reserva Manual
            </h3>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Selección de usuario con buscador */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usuario *
              </label>
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg mb-2"
              />
              <select
                value={formData.userId}
                onChange={(e) =>
                  setFormData({ ...formData, userId: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg"
                required
                size={5}
              >
                <option value="">Seleccionar usuario...</option>
                {filteredUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} {user.lastname || ""} ({user.email})
                  </option>
                ))}
              </select>
            </div>
            {/* Selección de actividad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Actividad *
              </label>
              <select
                value={formData.activityId}
                onChange={(e) => {
                  setFormData({ ...formData, activityId: e.target.value });
                  setSelectedTurnId("");
                }}
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                <option value="">Seleccionar actividad...</option>
                {activities.map((activity) => (
                  <option key={activity.id} value={activity.id}>
                    {activity.name} (Max: {activity.capacity ?? "-"} personas)
                  </option>
                ))}
              </select>
            </div>
            {/* Filtro de fecha (opcional) */}
            {formData.activityId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccionar fecha (calendario)
                </label>
                <div className="mt-2">
                  <CalendarDatePicker
                    availableDates={availableDates}
                    selectedDate={filterDate}
                    onDateSelect={(date) => {
                      setFilterDate(date);
                      setSelectedTurnId("");
                    }}
                  />
                </div>
                {!loadingTurns && formData.activityId && (
                  <div className="mt-2 text-sm text-gray-600">
                    {filterDate ? (
                      availableTurns.length > 0 ? (
                        <span>
                          ✓ {availableTurns.length} turno
                          {availableTurns.length !== 1 ? "s" : ""} disponible
                          {availableTurns.length !== 1 ? "s" : ""} en esta fecha
                        </span>
                      ) : (
                        <span className="text-amber-600">
                          No hay turnos disponibles en esta fecha
                        </span>
                      )
                    ) : (
                      <span>Selecciona un día disponible en el calendario.</span>
                    )}
                  </div>
                )}
              </div>
            )}
            {/* Lista de turnos disponibles */}
            {formData.activityId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccionar turno disponible *
                </label>
                {loadingTurns ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">
                      Cargando horarios disponibles...
                    </p>
                  </div>
                ) : availableTurns.length === 0 ? (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      {filterDate
                        ? `No hay turnos disponibles para esta actividad en la fecha seleccionada.`
                        : `No hay turnos disponibles para esta actividad en los próximos 30 días.`}
                    </p>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                    <div className="divide-y divide-gray-100">
                      {availableTurns.map((turn) => {
                        const isSelected = selectedTurnId === turn.id;
                        return (
                          <button
                            key={turn.id}
                            type="button"
                            onClick={() => setSelectedTurnId(turn.id)}
                            className={`w-full text-left px-4 py-3 transition-colors ${
                              isSelected ? "bg-green-50" : "hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <p className="text-base font-semibold text-gray-900">
                                  {turn.startTime} - {turn.endTime}
                                </p>
                                <p className="text-sm text-gray-600 mt-0.5">
                                  {turn.availableSpots} cupos disponibles
                                </p>
                              </div>
                              <span
                                className={`px-3 py-1 rounded-md text-sm font-medium ${
                                  isSelected
                                    ? "bg-green-600 text-white"
                                    : "bg-gray-200 text-gray-700"
                                }`}
                              >
                                {isSelected ? "Seleccionado" : "Seleccionar"}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* Información del turno seleccionado */}
            {selectedTurn && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-green-800">
                      ✅ Turno seleccionado
                    </div>
                    <div className="text-sm text-green-700 mt-1">
                      <p>
                        <strong>Fecha:</strong>{" "}
                        {(() => {
                          
                          
                          const dateStr = selectedTurn.date.split("T")[0];
                          const [year, month, day] = dateStr.split("-").map(Number);
                          const date = new Date(year, month - 1, day);
                          return date.toLocaleDateString("es-ES", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          });
                        })()}
                      </p>
                      <p>
                        <strong>Horario:</strong> {selectedTurn.startTime} -{" "}
                        {selectedTurn.endTime}
                      </p>
                      <p>
                        <strong>Cupos disponibles:</strong>{" "}
                        {selectedTurn.availableSpots}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading || !selectedTurnId || !formData.userId}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? "Creando..." : "Crear Reserva"}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClose();
                }}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}