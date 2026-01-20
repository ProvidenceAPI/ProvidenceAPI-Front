// src/components/CalendarView.tsx - FIXED
'use client';

import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, isToday, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

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

export default function CalendarView({ reservations, onDayClick }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  
  // Obtener todos los días del mes
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Calcular días de la semana anterior para completar la primera semana
  const firstDayOfMonth = monthStart.getDay();
  const daysFromPrevMonth = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  
  // Días para mostrar (incluyendo días del mes anterior)
  const calendarDays: (Date | null)[] = [
    ...Array(daysFromPrevMonth).fill(null),
    ...daysInMonth,
  ];

  // 🔥 FIX: Validar que reservations es un array antes de usar .filter
  const getReservationsForDay = (day: Date) => {
    // Validación defensiva
    if (!Array.isArray(reservations)) {
      console.warn('⚠️ Reservations no es un array:', reservations);
      return [];
    }

    return reservations.filter(reservation => {
      try {
        return reservation && isSameDay(new Date(reservation.date), day);
      } catch (error) {
        console.error('❌ Error comparando fechas:', error, reservation);
        return false;
      }
    });
  };

  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

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
              {format(currentMonth, 'MMMM yyyy', { locale: es })}
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
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
          <div key={day} className="p-3 text-center text-sm font-semibold text-gray-700">
            {day}
          </div>
        ))}
      </div>

      {/* Calendario */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="aspect-square bg-gray-50" />;
          }

          const dayReservations = getReservationsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isCurrentDay = isToday(day);
          const hasReservations = dayReservations.length > 0;

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDayClick && onDayClick(day)}
              disabled={!isCurrentMonth}
              className={`
                aspect-square p-2 border-b border-r transition-all
                ${!isCurrentMonth ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'}
                ${isCurrentDay ? 'bg-blue-50 ring-2 ring-blue-500 ring-inset' : ''}
                ${hasReservations && isCurrentMonth ? 'bg-red-50' : ''}
              `}
            >
              <div className="h-full flex flex-col">
                <div className={`
                  text-sm font-medium mb-1
                  ${isCurrentDay ? 'text-blue-700 font-bold' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                `}>
                  {format(day, 'd')}
                </div>
                
                {hasReservations && isCurrentMonth && (
                  <div className="flex-1 flex flex-col gap-0.5 overflow-hidden">
                    {dayReservations.slice(0, 2).map((reservation, idx) => (
                      <div
                        key={reservation.id || idx}
                        className="text-xs bg-red-600 text-white rounded px-1 py-0.5 truncate"
                        title={reservation.activityName || 'Reserva'}
                      >
                        {reservation.activityName || 'Reserva'}
                      </div>
                    ))}
                    {dayReservations.length > 2 && (
                      <div className="text-xs text-gray-600 font-medium">
                        +{dayReservations.length - 2} más
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
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span className="text-gray-700">Hoy</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-600 rounded"></div>
          <span className="text-gray-700">Reservas</span>
        </div>
      </div>
    </div>
  );
}