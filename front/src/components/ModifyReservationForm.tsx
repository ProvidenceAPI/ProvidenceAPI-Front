"use client";

import { useState, useEffect, useCallback } from "react";
import { useCalendar } from "src/contexts/CalendarContext";
import { reservationService } from "src/app/lib";
import { Reservation } from "src/interfaces/Reservation";
import { Activity } from "src/interfaces/Activity";

interface ModifyReservationFormProps {
  reservation: Reservation;
  activities: Activity[];
  onClose: () => void;
}

export default function ModifyReservationForm({
  reservation,
  activities,
  onClose,
}: ModifyReservationFormProps) {
  const { modifyReservation } = useCalendar();
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState<{
    available: boolean;
    availableSlots: number;
    maxParticipants: number;
  } | null>(null);

  const [formData, setFormData] = useState({
    date: reservation.activityDate.split("T")[0],
    startTime: reservation.startTime.substring(0, 5),
    endTime: reservation.endTime.substring(0, 5),
    activityId: reservation.activityId,
  });

  const selectedActivity = activities.find((a) => a.id === formData.activityId);

  const checkAvailability = useCallback(async () => {
    try {
      const availability = await reservationService.checkAvailability({
        activityId: formData.activityId,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
      });
      setAvailability(availability);
    } catch (error) {
      setAvailability(null);
    }
  }, [
    formData.activityId,
    formData.date,
    formData.startTime,
    formData.endTime,
  ]);

  useEffect(() => {
    checkAvailability();
  }, [checkAvailability]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await modifyReservation(reservation.id, formData);
      alert("Reserva modificada exitosamente. Se envió un email al usuario.");
      onClose();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Error al modificar la reserva";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              Modificar Reserva
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Reserva actual</div>
            <div className="font-medium">
              {(reservation as any).userName ??
                (reservation as any).user?.name ??
                "—"}
            </div>
            <div className="text-sm text-gray-700">
              {new Date(reservation.activityDate).toLocaleDateString("es-ES")} •
              {reservation.startTime} - {reservation.endTime}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Actividad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Actividad
              </label>
              <select
                value={formData.activityId}
                onChange={(e) =>
                  setFormData({ ...formData, activityId: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg"
              >
                {activities.map((activity) => (
                  <option key={activity.id} value={activity.id}>
                    {activity.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Fecha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              {/* Hora inicio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora Inicio
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              {/* Hora fin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora Fin
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            {/* Validación de cupos */}
            {availability && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  availability.available
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {availability.available
                  ? `✅ ${availability.availableSlots} cupos disponibles`
                  : "❌ No hay cupos disponibles en el nuevo horario"}
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading || (availability && !availability.available)}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Guardando..." : "Guardar Cambios"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
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
