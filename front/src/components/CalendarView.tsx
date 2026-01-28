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
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

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

const parseLocalDate = (dateString: string): Date => {
  const datePart = dateString.split("T")[0];
  const [year, month, day] = datePart.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
};

export default function CalendarView({
  reservations,
  onDayClick,
}: CalendarViewProps) {
  const { selectedDate, setSelectedDate } = useCalendar();
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
    const filtered = reservations.filter((reservation) => {
      try {
        const reservationDate = parseLocalDate(reservation.date);
        const matches = isSameDay(reservationDate, day);
        return matches;
      } catch (error) {
        console.error("Error parseando fecha:", reservation.date, error);
        return false;
      }
    });
    return filtered;
  };

  const goToPreviousMonth = () => {
    const newMonth = subMonths(currentMonth, 1);
    setSelectedDate(newMonth);
  };

  const goToNextMonth = () => {
    const newMonth = addMonths(currentMonth, 1);
    setSelectedDate(newMonth);
  };

  const goToToday = () => {
    const today = new Date();
    setSelectedDate(today);
  };

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0">
          {/* Navegación móvil - Superior */}
          <div className="flex items-center justify-between sm:hidden">
            <button
              onClick={goToPreviousMonth}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition"
              aria-label="Mes anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-sm bg-white/20 hover:bg-white/30 rounded-lg text-white font-medium transition flex items-center gap-2"
            >
              <CalendarIcon className="w-4 h-4" />
              Hoy
            </button>
            <button
              onClick={goToNextMonth}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition"
              aria-label="Mes siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Título del mes */}
          <div className="text-center order-2 sm:order-1">
            <h2 className="text-xl sm:text-2xl font-bold text-white capitalize">
              {format(currentMonth, "MMMM yyyy", { locale: es })}
            </h2>
            <button
              onClick={goToToday}
              className="hidden sm:block mt-1 text-sm text-white/80 hover:text-white underline"
            >
              Ir a hoy
            </button>
          </div>

          {/* Navegación desktop */}
          <div className="hidden sm:flex items-center gap-2 order-3">
            <button
              onClick={goToPreviousMonth}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white font-medium transition flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>
            <button
              onClick={goToNextMonth}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white font-medium transition flex items-center gap-2"
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 bg-gray-50 border-b">
        {["L", "M", "X", "J", "V", "S", "D"].map((day, index) => (
          <div
            key={day}
            className="p-2 sm:p-3 text-center text-xs sm:text-sm font-semibold text-gray-700"
            title={["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"][index]}
          >
            <span className="hidden sm:inline">
              {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"][index]}
            </span>
            <span className="sm:hidden">{day}</span>
          </div>
        ))}
      </div>

      {/* Grid del calendario */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day, index) => {
          if (!day) {
            return (
              <div
                key={`empty-${index}`}
                className="aspect-square bg-gray-50 min-h-[60px] sm:min-h-[80px] md:min-h-[100px] lg:min-h-[120px]"
              />
            );
          }
          
          const dayReservations = getReservationsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isCurrentDay = isToday(day);
          const hasReservations = dayReservations.length > 0;
          const visibleReservations = dayReservations.slice(0, 2); // Menos items en móvil
          const remainingCount = dayReservations.length - 2;

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDayClick && onDayClick(day)}
              disabled={!isCurrentMonth}
              className={`
                relative p-1 sm:p-2 border-b border-r transition-all
                min-h-[60px] sm:min-h-[80px] md:min-h-[100px] lg:min-h-[120px]
                flex flex-col
                ${!isCurrentMonth 
                  ? "bg-gray-50 text-gray-400 cursor-not-allowed" 
                  : "hover:bg-gray-50 cursor-pointer"
                }
                ${isCurrentDay 
                  ? "bg-blue-50 ring-2 ring-blue-500 ring-inset" 
                  : ""
                }
                ${hasReservations && isCurrentMonth && !isCurrentDay 
                  ? "bg-red-50" 
                  : ""
                }
              `}
              aria-label={`Día ${format(day, "d")}${hasReservations ? `, ${dayReservations.length} reservas` : ''}`}
            >
              {/* Número del día */}
              <div
                className={`
                  text-xs sm:text-sm font-medium mb-1 flex-shrink-0
                  self-start
                  ${isCurrentDay 
                    ? "text-blue-700 font-bold" 
                    : isCurrentMonth 
                      ? "text-gray-900" 
                      : "text-gray-400"
                  }
                `}
              >
                {format(day, "d")}
                {isCurrentDay && (
                  <span className="hidden sm:inline ml-1 text-[10px] text-blue-600">
                    Hoy
                  </span>
                )}
              </div>

              {/* Badge de cantidad de reservas en móvil */}
              {hasReservations && isCurrentMonth && (
                <div className="sm:hidden absolute top-1 right-1">
                  <div className={`
                    w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold
                    ${isCurrentDay 
                      ? "bg-blue-600 text-white" 
                      : "bg-red-600 text-white"
                    }
                  `}>
                    {dayReservations.length}
                  </div>
                </div>
              )}

              {/* Lista de actividades - Solo visible en pantallas medianas+ */}
              {hasReservations && isCurrentMonth && (
                <div className="hidden sm:flex flex-1 flex-col gap-0.5 overflow-hidden">
                  {visibleReservations.map((reservation, idx) => (
                    <div
                      key={reservation.id || idx}
                      className={`
                        text-[10px] md:text-xs text-white rounded px-1 py-0.5 truncate flex-shrink-0
                        ${isCurrentDay 
                          ? "bg-blue-600" 
                          : "bg-red-600"
                        }
                      `}
                      title={reservation.activityName || "Reserva"}
                    >
                      <span className="hidden md:inline">
                        {reservation.activityName || "Reserva"}
                      </span>
                      <span className="md:hidden">
                        {(reservation.activityName || "Res").substring(0, 3)}
                      </span>
                    </div>
                  ))}
                  
                  {/* Mostrar +X más si hay actividades adicionales */}
                  {remainingCount > 0 && (
                    <div
                      className={`
                        text-[10px] md:text-xs font-medium rounded px-1 py-0.5 flex-shrink-0
                        ${isCurrentDay 
                          ? "bg-blue-200 text-blue-800" 
                          : "bg-gray-200 text-gray-600"
                        }
                      `}
                    >
                      +{remainingCount} más
                    </div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Leyenda */}
      <div className="p-3 sm:p-4 bg-gray-50 border-t">
        <div className="flex flex-col xs:flex-row items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-600 rounded"></div>
            <span className="text-gray-700">Hoy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-600 rounded"></div>
            <span className="text-gray-700">Con reservas</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-600 rounded"></div>
            <span className="text-gray-700">Otros días</span>
          </div>
        </div>
      </div>

      {/* Nota para móvil */}
      <div className="sm:hidden p-3 bg-blue-50 border-t border-blue-100 text-center">
        <p className="text-xs text-blue-700">
          👆 Toca en un día para ver las reservas
        </p>
        <p className="text-xs text-blue-600 mt-1">
          Los números rojos indican cantidad de reservas
        </p>
      </div>
    </div>
  );
}