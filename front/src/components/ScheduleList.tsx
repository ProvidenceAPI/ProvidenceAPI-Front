"use client";

import React, { useState, useMemo } from "react";
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
  const [showLoginMessage, setShowLoginMessage] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");

  const handleReserve = async (turnId: string) => {
    if (!isAuthenticated) {
      setShowLoginMessage(true);
      setTimeout(() => setShowLoginMessage(false), 3000);
      return;
    }

    try {
      setReservingTurnId(turnId);
      await onReserve(turnId);
    } catch (error) {
      console.error("Error al reservar:", error);
    } finally {
      setReservingTurnId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    return `${days[date.getDay()]} ${date.getDate()} de ${months[date.getMonth()]}`;
  };

  const isTurnAvailable = (turn: Turn): boolean => {
    const spots = typeof turn.availableSpots === 'number' 
      ? turn.availableSpots 
      : parseInt(String(turn.availableSpots || '0'), 10);
    
    const status = (turn.status || '').toLowerCase();
    
    return status === 'available' && spots > 0;
  };


  const availableDates = useMemo(() => {
    const uniqueDates = Array.from(new Set(turns.map(turn => turn.date)));
    return uniqueDates.sort();
  }, [turns]);


  React.useEffect(() => {
    if (availableDates.length > 0 && !selectedDate) {
      setSelectedDate(availableDates[0]);
    }
  }, [availableDates]);


  const filteredTurns = useMemo(() => {
    if (!selectedDate) return [];
    return turns.filter(turn => turn.date === selectedDate);
  }, [turns, selectedDate]);

  if (!isAuthenticated) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Inicia sesión para reservar
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>Debes iniciar sesión para ver y reservar horarios disponibles.</p>
            </div>
            <div className="mt-4">
              <a
                href="/login"
                className="inline-flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-md transition-colors"
              >
                Iniciar Sesión
              </a>
            </div>
          </div>
        </div>
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


      {showLoginMessage && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md animate-pulse">
          <p className="text-sm text-red-700">
            Por favor, inicia sesión para reservar un horario.
          </p>
        </div>
      )}


      {availableDates.length > 0 ? (
        <>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <label htmlFor="date-select" className="block text-sm font-medium text-gray-700 mb-2">
              Selecciona un día:
            </label>
            <div className="relative">
              <select
                id="date-select"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="block w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DC2626] focus:border-transparent bg-white cursor-pointer transition-all hover:border-gray-400"
              >
                {availableDates.map((date) => (
                  <option key={date} value={date}>
                    {formatDate(date)}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                <svg className="fill-current h-5 w-5" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>


          {filteredTurns.length > 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {formatDate(selectedDate)}
                </h3>
              </div>

              <div className="divide-y divide-gray-100">
                {filteredTurns.map((turn) => {
                  const isAvailable = isTurnAvailable(turn);
                  const spots = typeof turn.availableSpots === 'number' 
                    ? turn.availableSpots 
                    : parseInt(String(turn.availableSpots || '0'), 10);

                  return (
                    <div
                      key={turn.id}
                      className="px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
 
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                              <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-lg font-medium text-gray-900">
                                {turn.time}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              <span className={`text-sm ${isAvailable ? 'text-gray-600' : 'text-red-600 font-medium'}`}>
                                {spots} de {turn.capacity} cupos disponibles
                              </span>
                            </div>
                          </div>
                        </div>

        
                        <div>
                          {isAvailable ? (
                            <button
                              onClick={() => handleReserve(turn.id)}
                              disabled={reservingTurnId === turn.id}
                              className={`px-6 py-2 rounded-md font-medium transition-all ${
                                reservingTurnId === turn.id
                                  ? 'bg-gray-400 cursor-not-allowed'
                                  : 'bg-[#DC2626] hover:bg-[#B01C1C] text-white shadow-sm hover:shadow-md'
                              }`}
                            >
                              {reservingTurnId === turn.id ? (
                                <span className="flex items-center">
                                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Reservando...
                                </span>
                              ) : (
                                'Reservar'
                              )}
                            </button>
                          ) : (
                            <span className="px-6 py-2 bg-gray-200 text-gray-500 rounded-md font-medium cursor-not-allowed">
                              Agotado
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay horarios disponibles</h3>
              <p className="mt-1 text-sm text-gray-500">No hay turnos programados para este día.</p>
            </div>
          )}
        </>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay horarios disponibles</h3>
          <p className="mt-1 text-sm text-gray-500">Los horarios se actualizan regularmente.</p>
        </div>
      )}
    </div>
  );
}