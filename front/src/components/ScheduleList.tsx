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
}: ScheduleListProps) {
  const router = useRouter();
  const [reservingTurnId, setReservingTurnId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");

  useEffect(() => {
    console.log("📅 Turnos recibidos en ScheduleList:", turns);
    console.log("📅 Total de turnos:", turns.length);
  }, [turns]);

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
        confirmButtonText: "Aceptar"
      });
    } catch (error: any) {
      console.error("Error al reservar:", error);

      const status = error?.response?.status;
      const backendMsg = error?.response?.data?.message || error?.response?.data?.error || "";
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
        : backendMsg || error?.message || "No se pudo realizar la reserva. Intenta nuevamente.";

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

      if (esReservaGratisUsada && result.isDismissed && result.dismiss === "cancel") {
        router.push("/mis-pagos");
      }
    } finally {
      setReservingTurnId(null);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) {
      console.warn("formatDate recibió un valor undefined o vacío");
      return "Fecha no disponible";
    }

    try {
      const [year, month, day] = dateString.split('-').map(Number);
      
      if (isNaN(year) || isNaN(month) || isNaN(day)) {
        console.warn("Fecha inválida:", dateString);
        return "Fecha inválida";
      }
      
      const date = new Date(year, month - 1, day);
      
      const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
      const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
      
      return `${days[date.getDay()]} ${date.getDate()} de ${months[date.getMonth()]}`;
    } catch (error) {
      console.error("Error formateando fecha:", error, "dateString:", dateString);
      return "Fecha inválida";
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
    // Usar 'date' en lugar de 'activityDate'
    const turnsWithDates = turns.filter(turn => turn.date);
    console.log("📅 Turnos con fecha válida:", turnsWithDates.length);
    
    const uniqueDates = Array.from(new Set(turnsWithDates.map((turn) => turn.date)));
    console.log("📅 Fechas únicas encontradas:", uniqueDates);
    
    return uniqueDates.sort();
  }, [turns]);

  useEffect(() => {
    if (availableDates.length > 0 && !selectedDate) {
      console.log("📅 Seleccionando fecha inicial:", availableDates[0]);
      setSelectedDate(availableDates[0]);
    }
  }, [availableDates, selectedDate]);

  const filteredTurns = useMemo(() => {
    if (!selectedDate) {
      console.log("⚠️ No hay fecha seleccionada");
      return [];
    }

    const filtered = turns.filter((turn) => turn.date === selectedDate);
    console.log(`📅 Turnos filtrados para ${selectedDate}:`, filtered.length);
    return filtered;
  }, [turns, selectedDate]);

  if (!isAuthenticated) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-md">
        <h3 className="text-sm font-medium text-yellow-800">
          Inicia sesión para reservar
        </h3>
        <p className="mt-2 text-sm text-yellow-700">
          Debes iniciar sesión para ver y reservar horarios disponibles.
        </p>
        <a 
          href="/login"
          className="inline-flex mt-4 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-md transition-colors"
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
              🎉 <strong>¡Tu primera reserva es gratis!</strong> Las siguientes requerirán pago mensual.
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
                    <div key={turn.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg font-semibold text-gray-900">{turn.startTime}</p>
                          <p className={`text-sm mt-1 ${isAvailable ? "text-gray-600" : "text-red-600 font-medium"}`}>
                            {spots} de {turn.capacity} cupos disponibles
                          </p>
                        </div>

                        {isAvailable ? (
                          !userHasFreeReservation ? (
                            <button
                              onClick={() => router.push("/mis-pagos")}
                              className="px-6 py-2 rounded-md font-medium bg-amber-600 hover:bg-amber-700 text-white transition-colors"
                            >
                              Pagar para reservar
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReserve(turn.id)}
                              disabled={reservingTurnId === turn.id}
                              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                                reservingTurnId === turn.id
                                  ? "bg-gray-400 cursor-not-allowed text-white"
                                  : "bg-[#DC2626] hover:bg-[#B01C1C] text-white"
                              }`}
                            >
                              {reservingTurnId === turn.id ? "Reservando..." : "Reservar"}
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
                <p className="text-sm text-gray-500">No hay turnos disponibles para este día.</p>
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