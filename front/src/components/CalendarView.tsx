"use client";

import React from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import { useCalendar } from "src/contexts/CalendarContext";

interface Reservation {
  id: string;
  date: string;
  activityName?: string;
  status?: string;
}

interface CalendarViewProps {
  reservations: Reservation[];
  onDayClick?: (day: Date) => void;
}

export default function CalendarView({
  reservations,
  onDayClick,
}: CalendarViewProps) {
  const { selectedDate, setSelectedDate, fetchTurns } = useCalendar();
  const currentMonth = selectedDate;
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const firstDayOfMonth = monthStart.getDay();
  const daysFromPrevMonth = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const calendarDays: (Date | null)[] = [
    ...Array(daysFromPrevMonth).fill(null),
    ...daysInMonth,
  ];

  const getReservationsForDay = (day: Date) => {
    if (!Array.isArray(reservations)) {
      return [];
    }
    return reservations.filter((reservation) => {
      try {
        return reservation && isSameDay(new Date(reservation.date), day);
      } catch (error) {
        return false;
      }
    });
  };

  const goToPreviousMonth = async () => {
    const newMonth = subMonths(currentMonth, 1);
    setSelectedDate(newMonth);
    const startDate = new Date(newMonth);
    startDate.setDate(1);
    const endDate = new Date(newMonth);
    endDate.setMonth(endDate.getMonth() + 1, 0);
    await fetchTurns({
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    });
  };

  const goToNextMonth = async () => {
    const newMonth = addMonths(currentMonth, 1);
    setSelectedDate(newMonth);
    const startDate = new Date(newMonth);
    startDate.setDate(1);
    const endDate = new Date(newMonth);
    endDate.setMonth(endDate.getMonth() + 1, 0);
    await fetchTurns({
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    });
  };

  const goToToday = async () => {
    const today = new Date();
    setSelectedDate(today);
    const startDate = new Date(today);
    startDate.setDate(1);
    const endDate = new Date(today);
    endDate.setMonth(endDate.getMonth() + 1, 0);
    await fetchTurns({
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 p-6">
        <div className="flex justify-between items-center">
          <button
            onClick={goToPreviousMonth}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white font-medium transition"
          >
            ← Anterior
          </button>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white capitalize">
              {format(currentMonth, "MMMM yyyy", { locale: es })}
            </h2>
            <button
              onClick={goToToday}
              className="mt-1 text-sm text-white/80 hover:text-white underline"
            >
              Ir a hoy
            </button>
          </div>
          <button
            onClick={goToNextMonth}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white font-medium transition"
          >
            Siguiente →
          </button>
        </div>
      </div>
      {/* Días de la semana */}
      <div className="grid grid-cols-7 bg-gray-50 border-b">
        {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => (
          <div
            key={day}
            className="p-3 text-center text-sm font-semibold text-gray-700"
          >
            {day}
          </div>
        ))}
      </div>
      {/* Calendario */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day, index) => {
          if (!day) {
            return (
              <div
                key={`empty-${index}`}
                className="aspect-square bg-gray-50"
              />
            );
          }
          const dayReservations = getReservationsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isCurrentDay = isToday(day);
          const hasReservations = dayReservations.length > 0;
          const visibleReservations = dayReservations.slice(0, 5);
          const remainingCount = dayReservations.length - 5;
          return (
            <button
              key={day.toISOString()}
              onClick={() => onDayClick && onDayClick(day)}
              disabled={!isCurrentMonth}
              className={`
          p-2 border-b border-r transition-all min-h-[120px] flex flex-col
          ${!isCurrentMonth ? "bg-gray-50 text-gray-400 cursor-not-allowed" : "hover:bg-gray-50 cursor-pointer"}
          ${isCurrentDay ? "bg-blue-50 ring-2 ring-blue-500 ring-inset" : ""}
          ${hasReservations && isCurrentMonth && !isCurrentDay ? "bg-red-50" : ""}
        `}
            >
              <div className="h-full flex flex-col">
                {/* Número del día */}
                <div
                  className={`
            text-sm font-medium mb-1 flex-shrink-0
            ${isCurrentDay ? "text-blue-700 font-bold" : isCurrentMonth ? "text-gray-900" : "text-gray-400"}
          `}
                >
                  {format(day, "d")}
                </div>
                {/* Lista de actividades */}
                {hasReservations && isCurrentMonth && (
                  <div className="flex-1 flex flex-col gap-0.5 overflow-hidden">
                    {visibleReservations.map((reservation, idx) => (
                      <div
                        key={reservation.id || idx}
                        className={`
                    text-xs text-white rounded px-1 py-0.5 truncate flex-shrink-0
                    ${isCurrentDay ? "bg-blue-600" : "bg-red-600"}
                  `}
                        title={reservation.activityName || "Reserva"}
                      >
                        {reservation.activityName || "Reserva"}
                      </div>
                    ))}
                    {/* Mostrar +X más si hay actividades adicionales */}
                    {remainingCount > 0 && (
                      <div
                        className={`
                  text-xs font-medium rounded px-1 py-0.5 flex-shrink-0
                  ${isCurrentDay ? "bg-blue-200 text-blue-800" : "bg-gray-200 text-gray-600"}
                `}
                      >
                        +{remainingCount} más
                      </div>
                    )}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
      {/* Leyenda */}
      <div className="p-4 bg-gray-50 border-t flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-600 rounded"></div>
          <span className="text-gray-700">Hoy</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-600 rounded"></div>
          <span className="text-gray-700">Otros días</span>
        </div>
      </div>
    </div>
  );
}
