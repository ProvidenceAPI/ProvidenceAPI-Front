"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { Turn } from "src/interfaces/Turn";
import { ScheduleListProps } from "src/interfaces/ScheduleListProps";

export default function ScheduleList({
  activity,
  turns,
  isAuthenticated,
  onReserve,
  userHasFreeReservation,
  hasActiveSubscription,
}: ScheduleListProps) {
  const router = useRouter();
  const [reservingTurnId, setReservingTurnId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const handleReserve = async (turnId: string) => {
    if (!isAuthenticated) {
      Swal.fire({
        icon: "warning",
        title: "Inicia sesión",
        text: "Debes iniciar sesión para reservar un horario",
        confirmButtonColor: "#DC2626",
      });
      return;
    }
    try {
      setReservingTurnId(turnId);
      await onReserve(turnId);
      Swal.fire({
        icon: "success",
        title: "¡Reserva exitosa!",
        text: "¡Reserva creada exitosamente! Puedes verla en tus reservas.",
        confirmButtonColor: "#DC2626",
        confirmButtonText: "Aceptar",
      });
    } catch (error: any) {
      const status = error?.response?.status;
      const backendMsg =
        error?.response?.data?.message || error?.response?.data?.error || "";
      const raw = (backendMsg || error?.message || "").toLowerCase();
      const esReservaGratisUsada =
        status === 403 &&
        (raw.includes("free trial") ||
          raw.includes("suscrib") ||
          raw.includes("subscription") ||
          raw.includes("subscribe") ||
          raw.includes("gratis"));

      const texto = esReservaGratisUsada
        ? "Ya usaste tu reserva gratuita. Para reservar más turnos debes suscribirte o pagar la actividad."
        : backendMsg ||
          error?.message ||
          "No se pudo realizar la reserva. Intenta nuevamente.";

      const result = await Swal.fire({
        icon: "warning",
        title: esReservaGratisUsada ? "Reserva no disponible" : "Error",
        text: texto,
        confirmButtonColor: "#DC2626",
        confirmButtonText: "Entendido",
        showCancelButton: esReservaGratisUsada,
        cancelButtonText: "Ir a Mis Pagos",
        cancelButtonColor: "#6b7280",
      });
      if (
        esReservaGratisUsada &&
        result.isDismissed &&
        result.dismiss === "cancel"
      ) {
        router.push("/mis-pagos");
      }
    } finally {
      setReservingTurnId(null);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) {
      return "Fecha no disponible";
    }
    try {
      const [year, month, day] = dateString.split("-").map(Number);
      if (isNaN(year) || isNaN(month) || isNaN(day)) {
        return "Fecha inválida";
      }
      const date = new Date(year, month - 1, day);
      const days = [
        "Domingo",
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes",
        "Sábado",
      ];
      const months = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
      ];
      return `${days[date.getDay()]} ${date.getDate()} de ${months[date.getMonth()]}`;
    } catch (error) {
      return "Fecha inválida";
    }
  };

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

      // No permitir fechas/horas pasadas
      if (turnDateTime <= now) return false;

      // Respetar la misma regla del backend: mínimo 1 hora de anticipación
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
      return turnDateTime >= oneHourFromNow;
    } catch {
      return false;
    }
  };

  const isTurnAvailable = (turn: Turn): boolean => {
    const spots =
      typeof turn.availableSpots === "number"
        ? turn.availableSpots
        : parseInt(String(turn.availableSpots || "0"), 10);
    const status = (turn.status || "").toLowerCase();
    return status === "available" && spots > 0;
  };

  const availableDates = useMemo(() => {
    const turnsWithDates = turns.filter(
      (turn) => turn.date && isTurnAvailable(turn) && isTurnBookable(turn),
    );
    const uniqueDates = Array.from(
      new Set(turnsWithDates.map((turn) => turn.date)),
    );
    return uniqueDates.sort();
  }, [turns]);

  useEffect(() => {
    if (availableDates.length > 0 && !selectedDate) {
      setSelectedDate(availableDates[0]);
    }
  }, [availableDates, selectedDate]);

  const filteredTurns = useMemo(() => {
    if (!selectedDate) {
      return [];
    }

    const filtered = turns.filter(
      (turn) =>
        turn.date === selectedDate &&
        isTurnAvailable(turn) &&
        isTurnBookable(turn),
    );
    return filtered;
  }, [turns, selectedDate]);

  if (!isAuthenticated) {
    return (
      <div className="bg-[#FEFCE8] border-l-4 border-yellow-400 p-6 rounded-md">
        <h3 className="text-base font-bold text-gray-900 mb-2">
          Inicia sesión para reservar
        </h3>
        <p className="text-sm text-gray-700 mb-4">
          Debes iniciar sesión para ver y reservar horarios disponibles.
        </p>
        <a
          href="/login"
          className="inline-flex items-center justify-center w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2.5 px-4 rounded-md transition-colors duration-200"
        >
          Iniciar Sesión
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Horarios Disponibles - {activity.name}
        </h2>
        <p className="text-gray-600">
          Selecciona el día y horario que prefieras
        </p>
        {!userHasFreeReservation && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              🎉 <strong>¡Tu primera reserva es gratis!</strong> Las siguientes
              requerirán pago mensual.
            </p>
          </div>
        )}
      </div>
      {availableDates.length > 0 ? (
        <>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecciona un día:
            </label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC2626] focus:border-[#DC2626] outline-none"
            >
              {availableDates.map((date) => (
                <option key={date} value={date}>
                  {formatDate(date)}
                </option>
              ))}
            </select>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {filteredTurns.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {filteredTurns.map((turn) => {
                  const isAvailable = isTurnAvailable(turn);
                  const spots =
                    typeof turn.availableSpots === "number"
                      ? turn.availableSpots
                      : parseInt(String(turn.availableSpots || "0"), 10);
                  return (
                    <div
                      key={turn.id}
                      className="px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg font-semibold text-gray-900">
                            {turn.startTime}
                          </p>
                          <p
                            className={`text-sm mt-1 ${isAvailable ? "text-gray-600" : "text-red-600 font-medium"}`}
                          >
                            {spots} de {turn.capacity} cupos disponibles
                          </p>
                        </div>
                        {isAvailable ? (
                          hasActiveSubscription ? (
                            <button
                              onClick={() => handleReserve(turn.id)}
                              disabled={reservingTurnId === turn.id}
                              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                                reservingTurnId === turn.id
                                  ? "bg-gray-400 cursor-not-allowed text-white"
                                  : "bg-green-600 hover:bg-green-700 text-white"
                              }`}
                            >
                              {reservingTurnId === turn.id
                                ? "Reservando..."
                                : "Reservar"}
                            </button>
                          ) : userHasFreeReservation ? (
                            <button
                              onClick={() => handleReserve(turn.id)}
                              disabled={reservingTurnId === turn.id}
                              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                                reservingTurnId === turn.id
                                  ? "bg-gray-400 cursor-not-allowed text-white"
                                  : "bg-purple-600 hover:bg-purple-700 text-white"
                              }`}
                            >
                              {reservingTurnId === turn.id
                                ? "Reservando..."
                                : "Reservar Gratis"}
                            </button>
                          ) : (
                            <button
                              onClick={() => router.push("/mis-pagos")}
                              className="px-6 py-2 rounded-md font-medium bg-amber-600 hover:bg-amber-700 text-white transition-colors"
                            >
                              Pagar para reservar
                            </button>
                          )
                        ) : (
                          <span className="px-6 py-2 bg-gray-200 text-gray-500 rounded-md font-medium">
                            Agotado
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="px-6 py-8 text-center">
                <p className="text-sm text-gray-500">
                  No hay turnos disponibles para este día.
                </p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-sm text-gray-500">No hay horarios disponibles.</p>
        </div>
      )}
    </div>
  );
}
