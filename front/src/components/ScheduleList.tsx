"use client";

import React, { useState, useMemo, useEffect } from "react";
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

      Swal.fire({
        title: "Reservando...",
        text: "Procesando tu reserva",
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      await onReserve(turnId);

      Swal.fire({
        icon: "success",
        title: "¡Reserva exitosa!",
        text: "¡Reserva creada exitosamente! Puedes verla en tu dashboard.",
        confirmButtonColor: "#DC2626",
        confirmButtonText: "Aceptar"
      });
    } catch (error) {
      console.error("Error al reservar:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo realizar la reserva. Intenta nuevamente.",
        confirmButtonColor: "#DC2626",
      });
    } finally {
      setReservingTurnId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    return `${days[date.getDay()]} ${date.getDate()} de ${months[date.getMonth()]}`;
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
    const uniqueDates = Array.from(new Set(turns.map((turn) => turn.date)));
    return uniqueDates.sort();
  }, [turns]);

  useEffect(() => {
    if (availableDates.length > 0 && !selectedDate) {
      setSelectedDate(availableDates[0]);
    }
  }, [availableDates, selectedDate]);

  const filteredTurns = useMemo(() => {
    if (!selectedDate) return [];
    return turns.filter((turn) => turn.date === selectedDate);
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
        
          <a href="/login"
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
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC2626]"
            >
              {availableDates.map((date) => (
                <option key={date} value={date}>
                  {formatDate(date)}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="divide-y divide-gray-100">
              {filteredTurns.map((turn) => {
                const isAvailable = isTurnAvailable(turn);
                const spots =
                  typeof turn.availableSpots === "number"
                    ? turn.availableSpots
                    : parseInt(String(turn.availableSpots || "0"), 10);

                return (
                  <div key={turn.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-medium">{turn.time}</p>
                        <p className={`text-sm ${isAvailable ? "text-gray-600" : "text-red-600 font-medium"}`}>
                          {spots} de {turn.capacity} cupos disponibles
                        </p>
                      </div>

                      {isAvailable ? (
                        <button
                          onClick={() => handleReserve(turn.id)}
                          disabled={reservingTurnId === turn.id}
                          className={`px-6 py-2 rounded-md font-medium ${
                            reservingTurnId === turn.id
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-[#DC2626] hover:bg-[#B01C1C] text-white"
                          }`}
                        >
                          {reservingTurnId === turn.id ? "Reservando..." : "Reservar"}
                        </button>
                      ) : (
                        <span className="px-6 py-2 bg-gray-200 text-gray-500 rounded-md">
                          Agotado
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
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