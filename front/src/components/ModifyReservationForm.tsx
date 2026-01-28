"use client";

import { useState, useEffect, useCallback } from "react";
import { useCalendar } from "src/contexts/CalendarContext";
import { reservationService } from "src/app/lib";
import { Reservation } from "src/interfaces/Reservation";
import { Activity } from "src/interfaces/Activity";
import Swal from "sweetalert2";
import { getTranslatedErrorMessage } from "src/app/lib/errorTranslations";

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

  const checkAvailability = useCallback(async () => {
    try {
      const availability = await reservationService.checkAvailability({
        activityId: formData.activityId,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
      });
      setAvailability(availability);
    } catch {
      setAvailability(null);
    }
  }, [formData]);

  useEffect(() => {
    checkAvailability();
  }, [checkAvailability]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await modifyReservation(reservation.id, formData);
      await Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: "Reserva modificada exitosamente",
      });
      onClose();
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: getTranslatedErrorMessage(error, "Error al modificar la reserva"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4 py-6 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl">
        <div className="p-5 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">
              Modificar Reserva
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Info actual */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500 mb-1">Reserva actual</p>
            <p className="font-medium text-gray-900">
              {(reservation as any).userName ??
                (reservation as any).user?.name ??
                "—"}
            </p>
            <p className="text-sm text-gray-700 mt-1">
              {new Date(reservation.activityDate).toLocaleDateString("es-ES")} •{" "}
              {reservation.startTime} - {reservation.endTime}
            </p>
          </div>

          {/* Form */}
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
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {activities.map((activity) => (
                  <option key={activity.id} value={activity.id}>
                    {activity.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha y Horas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div className="sm:col-span-2">
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

            {/* Disponibilidad */}
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
                  : "❌ No hay cupos disponibles"}
              </div>
            )}

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="submit"
                disabled={loading || (availability && !availability.available)}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Guardando..." : "Guardar Cambios"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-800 py-2.5 rounded-lg hover:bg-gray-300"
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
