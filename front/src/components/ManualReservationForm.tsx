"use client";

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from 'src/app/lib/apiClient';
import type { User } from 'src/app/lib';
import { Activity } from 'src/interfaces/Activity';
import Swal from 'sweetalert2';

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
  users: User[];
  activities: Activity[];
  onClose: () => void;
  defaultDate?: Date;
}

export default function ManualReservationForm({
  users,
  activities,
  onClose,
  defaultDate,
}: ManualReservationFormProps) {
  const [loading, setLoading] = useState(false);
  const [loadingTurns, setLoadingTurns] = useState(false);
  const [availableTurns, setAvailableTurns] = useState<Turn[]>([]);
  const [selectedTurnId, setSelectedTurnId] = useState<string>('');
  const [filterDate, setFilterDate] = useState<string>(
    defaultDate ? defaultDate.toISOString().split('T')[0] : ''
  );

  const [formData, setFormData] = useState({
    userId: '',
    activityId: '',
  });
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = searchTerm
    ? users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : users;

  const selectedActivity = activities.find(a => a.id === formData.activityId);
  const selectedTurn = availableTurns.find(t => t.id === selectedTurnId);

  // Cargar turnos disponibles cuando se selecciona una actividad
  const loadAvailableTurns = useCallback(async () => {
    if (!formData.activityId) {
      setAvailableTurns([]);
      setSelectedTurnId('');
      return;
    }

    setLoadingTurns(true);
    try {
      const params: any = { activityId: formData.activityId };
      
      // Si hay una fecha seleccionada, filtrar por esa fecha
      if (filterDate) {
        params.startDate = filterDate;
        params.endDate = filterDate;
      } else {
        // Cargar turnos de los próximos 30 días
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);
        params.startDate = startDate.toISOString().split('T')[0];
        params.endDate = endDate.toISOString().split('T')[0];
      }

      const { data } = await apiClient.get("/api/turns", { params });
      const turnsList = Array.isArray(data)
        ? data
        : data?.data || data?.turns || [];
      
      // Filtrar solo turnos disponibles (no cancelados, no completados, con cupos)
      const available = turnsList.filter(
        (turn: Turn) =>
          turn.status !== "cancelled" &&
          turn.status !== "completed" &&
          turn.availableSpots > 0
      );
      
      // Ordenar por fecha y hora
      available.sort((a: Turn, b: Turn) => {
        const dateA = new Date(`${a.date}T${a.startTime}`);
        const dateB = new Date(`${b.date}T${b.startTime}`);
        return dateA.getTime() - dateB.getTime();
      });
      
      setAvailableTurns(available);
      setSelectedTurnId(''); // Resetear selección al cambiar actividad
    } catch (error: any) {
      console.error('Error loading turns:', error);
      setAvailableTurns([]);
    } finally {
      setLoadingTurns(false);
    }
  }, [formData.activityId, filterDate]);

  useEffect(() => {
    loadAvailableTurns();
  }, [loadAvailableTurns]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTurnId) {
      await Swal.fire({
        icon: "warning",
        title: "Selecciona un turno",
        text: "Debes seleccionar un turno disponible para crear la reserva",
      });
      return;
    }

    setLoading(true);
    try {
      // Usar el endpoint de admin para crear la reserva
      await apiClient.post("/api/reservations/admin", {
        turnId: selectedTurnId,
        userId: formData.userId,
      });

      await Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: "Reserva creada exitosamente. Se envió un email de confirmación al usuario.",
      });
      onClose();
    } catch (error: any) {
      console.error("Error creating reservation:", error);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || error.message || "Error al crear la reserva",
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
              onClick={onClose}
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
                    {user.name} ({user.email})
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
                  setSelectedTurnId('');
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
                  Filtrar por fecha (opcional)
                </label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => {
                    setFilterDate(e.target.value);
                    setSelectedTurnId('');
                  }}
                  className="w-full px-3 py-2 border rounded-lg"
                  min={new Date().toISOString().split('T')[0]}
                />
                {filterDate && (
                  <button
                    type="button"
                    onClick={() => {
                      setFilterDate('');
                      setSelectedTurnId('');
                    }}
                    className="mt-2 text-sm text-red-600 hover:text-red-700"
                  >
                    Limpiar filtro de fecha
                  </button>
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
                    <p className="text-sm text-gray-500 mt-2">Cargando horarios disponibles...</p>
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
                  <div className="border rounded-lg max-h-64 overflow-y-auto">
                    <select
                      value={selectedTurnId}
                      onChange={(e) => setSelectedTurnId(e.target.value)}
                      className="w-full px-3 py-2 border-0 rounded-lg"
                      required
                      size={Math.min(availableTurns.length, 8)}
                    >
                      <option value="">Seleccionar un turno...</option>
                      {availableTurns.map((turn) => {
                        const turnDate = new Date(turn.date).toLocaleDateString("es-ES", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        });
                        return (
                          <option key={turn.id} value={turn.id}>
                            {turnDate} - {turn.startTime} a {turn.endTime} ({turn.availableSpots} cupos disponibles)
                          </option>
                        );
                      })}
                    </select>
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
                      <p><strong>Fecha:</strong> {new Date(selectedTurn.date).toLocaleDateString("es-ES", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}</p>
                      <p><strong>Horario:</strong> {selectedTurn.startTime} - {selectedTurn.endTime}</p>
                      <p><strong>Cupos disponibles:</strong> {selectedTurn.availableSpots}</p>
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
                onClick={onClose}
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
