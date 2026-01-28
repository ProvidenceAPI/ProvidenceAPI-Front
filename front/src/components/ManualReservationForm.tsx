"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "src/app/lib/apiClient";
import { IUser } from "src/interfaces/IUser";
import { Activity } from "src/interfaces/Activity";
import Swal from "sweetalert2";
import { broadcastReservationUpdate } from "src/utils/broadcastChannel";
import { getTranslatedErrorMessage } from "src/app/lib/errorTranslations";
import { 
  X, 
  Search, 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Filter,
  User
} from "lucide-react";

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
  const [selectedTurnId, setSelectedTurnId] = useState<string>("");
  const [filterDate, setFilterDate] = useState<string>(
    defaultDate ? defaultDate.toISOString().split("T")[0] : "",
  );

  const [formData, setFormData] = useState({
    userId: "",
    activityId: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [activeStep, setActiveStep] = useState<"user" | "activity" | "turn">("user");

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
  const selectedUser = users.find((u) => u.id === formData.userId);

  const loadAvailableTurns = useCallback(async () => {
    if (!formData.activityId) {
      setAvailableTurns([]);
      setSelectedTurnId("");
      return;
    }

    setLoadingTurns(true);
    try {
      const params: any = { activityId: formData.activityId };
      if (filterDate) {
        params.startDate = filterDate;
        params.endDate = filterDate;
      } else {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);
        params.startDate = startDate.toISOString().split("T")[0];
        params.endDate = endDate.toISOString().split("T")[0];
      }

      const { data } = await apiClient.get("/api/turns", { params });
      const turnsList = Array.isArray(data)
        ? data
        : data?.data || data?.turns || [];
      const available = turnsList.filter(
        (turn: Turn) =>
          turn.status !== "cancelled" &&
          turn.status !== "completed" &&
          turn.availableSpots > 0,
      );
      available.sort((a: Turn, b: Turn) => {
        const dateA = new Date(`${a.date}T${a.startTime}`);
        const dateB = new Date(`${b.date}T${b.startTime}`);
        return dateA.getTime() - dateB.getTime();
      });

      setAvailableTurns(available);
      setSelectedTurnId("");
      if (available.length > 0) {
        setActiveStep("turn");
      }
    } catch (error: any) {
      console.error("Error loading turns:", error);
      setAvailableTurns([]);
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

  const formatDateForDisplay = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const formatDateForOption = (turn: Turn) => {
    const date = new Date(turn.date);
    return date.toLocaleDateString("es-ES", {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-3 md:p-4 overflow-y-auto">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl w-full max-w-xs xs:max-w-sm sm:max-w-md md:max-w-2xl max-h-[90vh] overflow-y-auto mx-2">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 z-10">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
              📝 Crear Reserva Manual
            </h3>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className="text-gray-400 hover:text-gray-600 p-1"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Steps indicador */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => setActiveStep("user")}
              className={`flex flex-col items-center ${activeStep === "user" ? "text-blue-600" : "text-gray-400"}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${activeStep === "user" ? "bg-blue-100" : "bg-gray-100"}`}>
                <User className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium">Usuario</span>
            </button>
            
            <div className={`flex-1 h-0.5 mx-2 ${formData.userId ? "bg-blue-600" : "bg-gray-200"}`} />
            
            <button
              type="button"
              onClick={() => formData.userId && setActiveStep("activity")}
              className={`flex flex-col items-center ${activeStep === "activity" ? "text-blue-600" : formData.userId ? "text-gray-600" : "text-gray-400"}`}
              disabled={!formData.userId}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${activeStep === "activity" ? "bg-blue-100" : formData.userId ? "bg-gray-100" : "bg-gray-50"}`}>
                <Calendar className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium">Actividad</span>
            </button>
            
            <div className={`flex-1 h-0.5 mx-2 ${formData.activityId ? "bg-blue-600" : "bg-gray-200"}`} />
            
            <button
              type="button"
              onClick={() => formData.activityId && setActiveStep("turn")}
              className={`flex flex-col items-center ${activeStep === "turn" ? "text-blue-600" : formData.activityId ? "text-gray-600" : "text-gray-400"}`}
              disabled={!formData.activityId}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${activeStep === "turn" ? "bg-blue-100" : formData.activityId ? "bg-gray-100" : "bg-gray-50"}`}>
                <Clock className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium">Turno</span>
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Paso 1: Selección de usuario */}
            <div className={`${activeStep !== "user" ? "hidden sm:block" : ""}`}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline-block w-4 h-4 mr-1" />
                Seleccionar usuario *
              </label>
              
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar usuario..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              {selectedUser && (
                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-blue-800 text-sm">
                        ✅ Usuario seleccionado
                      </div>
                      <div className="text-xs text-blue-700 mt-1">
                        {selectedUser.name} {selectedUser.lastname || ""}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, userId: "" });
                        setSearchTerm("");
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Cambiar
                    </button>
                  </div>
                </div>
              )}

              <div className="border border-gray-300 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                <div className="divide-y">
                  {filteredUsers.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      No se encontraron usuarios
                    </div>
                  ) : (
                    filteredUsers.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, userId: user.id });
                          setActiveStep("activity");
                        }}
                        className={`w-full text-left p-3 hover:bg-gray-50 transition-colors ${
                          formData.userId === user.id ? "bg-blue-50 border-l-4 border-blue-500" : ""
                        }`}
                      >
                        <div className="font-medium text-gray-900 text-sm">
                          {user.name} {user.lastname || ""}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {user.email}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Paso 2: Selección de actividad */}
            <div className={`${activeStep !== "activity" ? "hidden sm:block" : ""}`}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline-block w-4 h-4 mr-1" />
                Seleccionar actividad *
              </label>

              <div className="grid grid-cols-1 gap-2">
                {activities.map((activity) => (
                  <button
                    key={activity.id}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, activityId: activity.id });
                      setSelectedTurnId("");
                      setActiveStep("turn");
                    }}
                    className={`p-3 text-left rounded-lg border transition-colors ${
                      formData.activityId === activity.id
                        ? "bg-blue-50 border-blue-500 border-2"
                        : "bg-white border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="font-medium text-gray-900 text-sm">
                      {activity.name}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                      <Users className="w-3 h-3" />
                      <span>Capacidad: {activity.capacity ?? "-"} personas</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Paso 3: Selección de turno */}
            {formData.activityId && (
              <div className={`${activeStep !== "turn" ? "hidden sm:block" : ""}`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    <Clock className="inline-block w-4 h-4 mr-1" />
                    Seleccionar turno *
                  </label>
                  
                  <div className="relative w-full sm:w-48">
                    <input
                      type="date"
                      value={filterDate}
                      onChange={(e) => {
                        setFilterDate(e.target.value);
                        setSelectedTurnId("");
                      }}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      min={new Date().toISOString().split("T")[0]}
                    />
                    {filterDate && (
                      <button
                        type="button"
                        onClick={() => {
                          setFilterDate("");
                          setSelectedTurnId("");
                        }}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        title="Limpiar filtro"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {loadingTurns ? (
                  <div className="text-center py-6">
                    <Loader2 className="animate-spin w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      Cargando turnos disponibles...
                    </p>
                  </div>
                ) : availableTurns.length === 0 ? (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">
                          No hay turnos disponibles
                        </p>
                        <p className="text-xs text-yellow-700 mt-1">
                          {filterDate
                            ? `Para esta actividad en la fecha seleccionada.`
                            : `Para esta actividad en los próximos 30 días.`}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Vista móvil - Cards */}
                    <div className="sm:hidden space-y-2 max-h-64 overflow-y-auto">
                      {availableTurns.map((turn) => (
                        <button
                          key={turn.id}
                          type="button"
                          onClick={() => setSelectedTurnId(turn.id)}
                          className={`w-full p-3 text-left rounded-lg border transition-colors ${
                            selectedTurnId === turn.id
                              ? "bg-green-50 border-green-500 border-2"
                              : "bg-white border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium text-gray-900 text-sm">
                                {formatDateForOption(turn)}
                              </div>
                              <div className="text-xs text-gray-600">
                                {turn.startTime} - {turn.endTime}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded">
                              <Users className="w-3 h-3" />
                              <span>{turn.availableSpots}</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Vista desktop - Select */}
                    <div className="hidden sm:block border border-gray-300 rounded-lg overflow-hidden">
                      <select
                        value={selectedTurnId}
                        onChange={(e) => setSelectedTurnId(e.target.value)}
                        className="w-full px-3 py-2 border-0 text-sm"
                        required
                        size={Math.min(availableTurns.length, 6)}
                      >
                        <option value="">Seleccionar un turno...</option>
                        {availableTurns.map((turn) => (
                          <option key={turn.id} value={turn.id}>
                            {formatDateForOption(turn)} - {turn.startTime} a {turn.endTime} ({turn.availableSpots} cupos disponibles)
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Resumen seleccionado */}
            {(selectedUser || selectedActivity || selectedTurn) && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
                <h4 className="font-medium text-gray-900 text-sm mb-3">
                  📋 Resumen de selección
                </h4>
                <div className="space-y-2 text-sm">
                  {selectedUser && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Usuario:</span>
                      <span className="font-medium text-gray-900">
                        {selectedUser.name} {selectedUser.lastname || ""}
                      </span>
                    </div>
                  )}
                  {selectedActivity && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Actividad:</span>
                      <span className="font-medium text-gray-900">
                        {selectedActivity.name}
                      </span>
                    </div>
                  )}
                  {selectedTurn && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Fecha:</span>
                        <span className="font-medium text-gray-900">
                          {formatDateForDisplay(selectedTurn.date)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Horario:</span>
                        <span className="font-medium text-gray-900">
                          {selectedTurn.startTime} - {selectedTurn.endTime}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Cupos disponibles:</span>
                        <span className="font-medium text-green-600">
                          {selectedTurn.availableSpots}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-200">
              <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
                <button
                  type="submit"
                  disabled={loading || !selectedTurnId || !formData.userId}
                  className="flex-1 bg-blue-600 text-white py-2.5 sm:py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm sm:text-base flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                      <span>Creando reserva...</span>
                    </>
                  ) : (
                    "✅ Crear Reserva"
                  )}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onClose();
                  }}
                  className="flex-1 bg-gray-100 text-gray-800 py-2.5 sm:py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm sm:text-base"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}