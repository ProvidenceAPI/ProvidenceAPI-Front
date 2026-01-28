"use client";

import { useState } from "react";
import { useCalendar } from "src/contexts/CalendarContext";
import { Reservation } from "src/interfaces/Reservation";
import Swal from "sweetalert2";
import { getTranslatedErrorMessage } from "src/app/lib/errorTranslations";
import { X, AlertTriangle, User, Calendar, Clock, Loader2, MessageSquare } from "lucide-react";

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
  const [showReason, setShowReason] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await cancelReservation(reservation.id, reason || undefined);
      await Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: "Reserva cancelada exitosamente. Se envió un email al usuario.",
        confirmButtonColor: "#ef4444",
      });
      onClose();
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: getTranslatedErrorMessage(error, "Error al cancelar la reserva"),
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatMobileDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-3 md:p-4 overflow-y-auto">
      {/* Modal para móvil (desde abajo) */}
      <div className="bg-white w-full max-w-lg sm:rounded-xl shadow-2xl sm:mx-auto animate-slide-up sm:animate-none">
        {/* Header fijo */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Cancelar Reserva
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido con scroll */}
        <div className="max-h-[70vh] sm:max-h-[80vh] overflow-y-auto p-4 sm:p-6">
          {/* Info rápida */}
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div className="bg-red-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4 text-gray-600" />
                <span className="text-xs font-medium text-gray-700">Usuario</span>
              </div>
              <div className="text-sm font-semibold text-gray-900 truncate">
                {(reservation as any).userName ??
                  (reservation as any).user?.name ??
                  "—"}
              </div>
            </div>
            
            <div className="bg-red-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-gray-600" />
                <span className="text-xs font-medium text-gray-700">Fecha</span>
              </div>
              <div className="text-sm font-semibold text-gray-900">
                {formatMobileDate(reservation.activityDate)}
              </div>
            </div>
          </div>

          {/* Horario */}
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Clock className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">Horario</span>
            </div>
            <div className="text-center text-lg font-bold text-gray-900">
              {reservation.startTime} - {reservation.endTime}
            </div>
          </div>

          {/* Motivo opcional - Acordeón para móvil */}
          {!showReason ? (
            <button
              type="button"
              onClick={() => setShowReason(true)}
              className="w-full mb-4 p-3 bg-gray-50 border border-gray-300 rounded-lg flex items-center justify-between hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Agregar motivo (opcional)
                </span>
              </div>
              <span className="text-xs text-gray-500">Tocar para agregar</span>
            </button>
          ) : (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Motivo de cancelación
                </label>
                <button
                  type="button"
                  onClick={() => setShowReason(false)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Ocultar
                </button>
              </div>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ej: Clase suspendida por mantenimiento..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors resize-none"
                rows={3}
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-500">
                  Máximo 500 caracteres
                </span>
                <span className={`text-xs ${
                  reason.length > 450 ? "text-red-600" : "text-gray-500"
                }`}>
                  {reason.length}/500
                </span>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-200">
            <div className="space-y-3">
              <div className="text-xs text-gray-600 text-center mb-2">
                📧 Se notificará al usuario por email
              </div>
              
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Cancelando reserva...</span>
                  </>
                ) : (
                  "✅ Confirmar Cancelación"
                )}
              </button>
              
              <button
                type="button"
                onClick={onClose}
                className="w-full bg-gray-100 text-gray-800 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                ❌ No cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}