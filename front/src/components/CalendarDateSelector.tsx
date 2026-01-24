import { useState } from "react";

interface CalendarDatePickerProps {
  availableDates: string[];
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

export default function CalendarDatePicker({
  availableDates,
  selectedDate,
  onDateSelect,
}: CalendarDatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
  const isDateAvailable = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return availableDates.includes(dateStr);
  };

  const handleDateClick = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    if (isDateAvailable(day)) {
      onDateSelect(dateStr);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    );
  };

  const monthNames = [
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

  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 max-w-xs mx-auto">
      {/* Header del calendario */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={goToPreviousMonth}
          className="p-1 hover:bg-gray-100 rounded transition"
        >
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <div className="text-xs font-semibold text-gray-900">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </div>
        <button
          onClick={goToNextMonth}
          className="p-1 hover:bg-gray-100 rounded transition"
        >
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
      {/* Nombres de días */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center text-[9px] font-medium text-gray-500 py-0.5 w-7"
          >
            {day}
          </div>
        ))}
      </div>
      {/* Grid de días - MÁS ESTRECHO */}
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="w-7 h-7" />;
          }
          const isAvailable = isDateAvailable(day);
          const year = currentMonth.getFullYear();
          const month = currentMonth.getMonth();
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isSelected = selectedDate === dateStr;
          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              disabled={!isAvailable}
              className={`
              w-7 h-7 flex items-center justify-center rounded text-[11px] font-medium transition
              ${
                isSelected
                  ? "bg-red-600 text-white shadow-sm"
                  : isAvailable
                    ? "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                    : "bg-gray-50 text-gray-400 cursor-not-allowed"
              }
            `}
            >
              {day}
            </button>
          );
        })}
      </div>
      {/* Leyenda compacta */}
      <div className="mt-2 flex flex-col gap-1 text-[9px]">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-50 border border-green-200 rounded flex-shrink-0"></div>
          <span className="text-gray-600">Disponible</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-red-600 rounded flex-shrink-0"></div>
          <span className="text-gray-600">Seleccionado</span>
        </div>
      </div>
      {/* Fecha seleccionada */}
      {selectedDate && (
        <div className="mt-2 p-1.5 bg-blue-50 border border-blue-200 rounded">
          <p className="text-[10px] font-medium text-blue-900">
            📅 {selectedDate}
          </p>
        </div>
      )}
    </div>
  );
}
