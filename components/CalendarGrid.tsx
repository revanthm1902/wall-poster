import React, { useState } from 'react';
import { 
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, format, isSameMonth, isSameDay, 
  isWithinInterval, isAfter, isBefore, isToday 
} from 'date-fns';

interface CalendarGridProps {
  currentDate: Date;
}

export default function CalendarGrid({ currentDate }: CalendarGridProps) {
  // --- STATE ---
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  // --- DATE ---
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // --- SELECTION LOGIC ---
  const handleDateClick = (day: Date) => {
    // 1. If nothing is selected, or both are selected, start a new selection
    if (!startDate || (startDate && endDate)) {
      setStartDate(day);
      setEndDate(null);
      return;
    }
    // 2. If start is selected but user clicks a date BEFORE start, reset start
    if (startDate && isBefore(day, startDate)) {
      setStartDate(day);
      return;
    }
    // 3. Set the end date
    setEndDate(day);
  };

  // --- HELPER TO DETERMINE STYLING ---
  const getDayClasses = (day: Date) => {
    const isCurrentMonth = isSameMonth(day, monthStart);
    const isSelectedStart = startDate && isSameDay(day, startDate);
    const isSelectedEnd = endDate && isSameDay(day, endDate);
    
    const isBetween = startDate && endDate && isAfter(day, startDate) && isBefore(day, endDate);

    const isHoverTrail = startDate && !endDate && hoverDate && isAfter(hoverDate, startDate) && isAfter(day, startDate) && isBefore(day, hoverDate) || (startDate && !endDate && hoverDate && isSameDay(day, hoverDate));

    let classes = "h-12 md:h-14 w-full flex items-center justify-center text-sm font-semibold transition-all duration-200 cursor-pointer relative z-10 ";

    if (!isCurrentMonth) classes += "text-zinc-300 ";
    else classes += "text-zinc-700 hover:bg-zinc-100 ";

    if (isToday(day) && !isSelectedStart && !isSelectedEnd) classes += "border-b-4 border-zinc-900 ";

    if (isSelectedStart) classes += "bg-zinc-900 text-white rounded-l-lg shadow-md scale-105 z-20 ";
    if (isSelectedEnd) classes += "bg-zinc-900 text-white rounded-r-lg shadow-md scale-105 z-20 ";
    if (isBetween) classes += "bg-zinc-200 text-zinc-900 scale-100 ";
    if (isHoverTrail && !isSelectedStart) classes += "bg-zinc-100 text-zinc-900 border-y-2 border-zinc-200 animate-pulse ";

    if (isSelectedStart && !endDate && !hoverDate) classes += "rounded-r-lg ";

    return classes;
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 mb-4">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-bold text-zinc-400 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* The Actual Grid */}
      <div 
        className="grid grid-cols-7 gap-y-2"
        onMouseLeave={() => setHoverDate(null)} // Clear trail if mouse leaves calendar
      >
        {calendarDays.map((day, idx) => (
          <div 
            key={idx} 
            className="relative flex items-center justify-center"
            onMouseEnter={() => setHoverDate(day)}
          >
            {(getDayClasses(day).includes('isBetween') || getDayClasses(day).includes('isHoverTrail')) && (
              <div className="absolute inset-0 bg-zinc-100" />
            )}
            
            <button
              onClick={() => handleDateClick(day)}
              className={getDayClasses(day)}
            >
              {format(day, 'd')}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-6 border-t border-zinc-200 flex justify-between items-center">
        <div className="text-sm font-medium text-zinc-500">
          {startDate && !endDate && "Select an end date..."}
          {startDate && endDate && `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d')}`}
          {!startDate && "Select a range..."}
        </div>
        {(startDate || endDate) && (
          <button 
            onClick={() => { setStartDate(null); setEndDate(null); }}
            className="text-xs font-bold text-red-500 hover:text-red-700 uppercase tracking-wider"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}