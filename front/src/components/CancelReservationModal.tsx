"use client";

import { useState } from "react";
import { useCalendar } from "src/contexts/CalendarContext";
import { Reservation } from "src/interfaces/Reservation";
import Swal from "sweetalert2";
import { getTranslatedErrorMessage } from "src/app/lib/errorTranslations";

interface CancelReservationModalProps {
  reservation: Reservation;
  onClose: () => void;
}

export default function CancelReservationModal({
  reservation,
  onClose,
}: CancelReservationModalProps) {
  const { cancelReservation } = useCalendar();
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await cancelReservation(reservation.id, reason || undefined);
      await Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: "Reserva cancelada exitosamente. Se envió un email al usuario.",
      });
      onClose();
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: getTranslatedErrorMessage(error, "Error al cancelar la reserva"),
      });
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
              Cancelar Reserva
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-red-800 font-medium mb-2">
              ⚠️ ¿Estás seguro de cancelar esta reserva?
            </div>
            <div className="text-gray-700">
              <div>
                <strong>Usuario:</strong>{" "}
                {(reservation as any).userName ??
                  (reservation as any).user?.name ??
                  "—"}
              </div>
              <div>
                <strong>Fecha:</strong>{" "}
                {new Date(reservation.activityDate).toLocaleDateString("es-ES")}
              </div>
              <div>
                <strong>Horario:</strong> {reservation.startTime} -{" "}
                {reservation.endTime}
              </div>
            </div>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo de cancelación (opcional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ej: Clase suspendida por mantenimiento, cambio de horario..."
                className="w-full px-3 py-2 border rounded-lg h-24 resize-none"
                maxLength={500}
              />
              <div className="text-xs text-gray-500 mt-1 text-right">
                {reason.length}/500 caracteres
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? "Cancelando..." : "Confirmar Cancelación"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Volver
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
