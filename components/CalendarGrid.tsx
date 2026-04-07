import React, { useState, useEffect } from 'react';
import { 
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, format, isSameMonth, isSameDay, 
  isAfter, isBefore, isToday, differenceInDays 
} from 'date-fns';
import confetti from 'canvas-confetti';
import { Pin, Trash2 } from 'lucide-react';

interface CalendarGridProps {
  currentDate: Date;
}

const triggerConfetti = () => {
  const duration = 2000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 50 };

  const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

  const interval: ReturnType<typeof setInterval> = setInterval(function() {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) return clearInterval(interval);
    const particleCount = 50 * (timeLeft / duration);
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
  }, 250);
};

export default function CalendarGrid({ currentDate }: CalendarGridProps) {
  // --- STATE ---
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const [notes, setNotes] = useState<Record<string, string>>({});
  const [activeNoteText, setActiveNoteText] = useState("");

  // --- LOCAL STORAGE SYNC ---
  useEffect(() => {
    const savedNotes = localStorage.getItem('calendar-beast-notes');
    if (savedNotes) {
      setTimeout(() => setNotes(JSON.parse(savedNotes)), 0);
    }
  }, []);

  const saveNote = (dateKey: string) => {
    if (!activeNoteText.trim()) return;
    const newNotes = { ...notes, [dateKey]: activeNoteText };
    setNotes(newNotes);
    localStorage.setItem('calendar-beast-notes', JSON.stringify(newNotes));
    setActiveNoteText("");
  };

  const deleteNote = (dateKey: string) => {
    const newNotes = { ...notes };
    delete newNotes[dateKey];
    setNotes(newNotes);
    localStorage.setItem('calendar-beast-notes', JSON.stringify(newNotes));
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleDateClick = (day: Date) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(day);
      setEndDate(null);

      const dateKey = format(day, 'yyyy-MM-dd');
      setActiveNoteText(notes[dateKey] || "");
      return;
    }
    
    if (startDate && isBefore(day, startDate)) {
      setStartDate(day);
      return;
    }
    
    setEndDate(day);

    if (differenceInDays(day, startDate) >= 5) {
      triggerConfetti();
    }
  };

  const getDayClasses = (day: Date) => {
    const isCurrentMonth = isSameMonth(day, monthStart);
    const isSelectedStart = startDate && isSameDay(day, startDate);
    const isSelectedEnd = endDate && isSameDay(day, endDate);
    const isBetween = startDate && endDate && isAfter(day, startDate) && isBefore(day, endDate);
    const isHoverTrail = startDate && !endDate && hoverDate && isAfter(hoverDate, startDate) && isAfter(day, startDate) && isBefore(day, hoverDate) || (startDate && !endDate && hoverDate && isSameDay(day, hoverDate));

    let classes = "h-10 md:h-12 w-full flex items-center justify-center text-sm font-semibold transition-all duration-200 cursor-pointer relative z-10 ";

    if (!isCurrentMonth) classes += "text-zinc-300 ";
    else classes += "text-zinc-700 hover:bg-zinc-100 ";

    if (isToday(day) && !isSelectedStart && !isSelectedEnd) classes += "border-b-4 border-amber-400 ";

    if (isSelectedStart) classes += "bg-zinc-900 text-white rounded-l-lg shadow-md scale-105 z-20 ";
    if (isSelectedEnd) classes += "bg-zinc-900 text-white rounded-r-lg shadow-md scale-105 z-20 ";
    if (isBetween) classes += "bg-zinc-200 text-zinc-900 scale-100 ";
    if (isHoverTrail && !isSelectedStart) classes += "bg-zinc-100 text-zinc-900 border-y-2 border-zinc-200 animate-pulse ";
    if (isSelectedStart && !endDate && !hoverDate) classes += "rounded-r-lg ";

    return classes;
  };

  const activeDateKey = startDate && !endDate ? format(startDate, 'yyyy-MM-dd') : null;

  return (
    <div className="w-full h-full flex flex-col">
      {/* Grid Headers */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-bold text-zinc-400 uppercase tracking-wider">{day}</div>
        ))}
      </div>

      {/* The Grid */}
      <div className="grid grid-cols-7 gap-y-1" onMouseLeave={() => setHoverDate(null)}>
        {calendarDays.map((day, idx) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const hasNote = !!notes[dateKey];

          return (
            <div key={idx} className="relative flex items-center justify-center" onMouseEnter={() => setHoverDate(day)}>
              {(getDayClasses(day).includes('isBetween') || getDayClasses(day).includes('isHoverTrail')) && (
                <div className="absolute inset-0 bg-zinc-100" />
              )}
              <button onClick={() => handleDateClick(day)} className={getDayClasses(day)}>
                {format(day, 'd')}
                {/* Visual Indicator for Notes */}
                {hasNote && !isSameDay(day, startDate || new Date(0)) && !isSameDay(day, endDate || new Date(0)) && (
                  <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-400 rounded-full shadow-sm" />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Dynamic Action Area: Shows Range OR Sticky Note Editor */}
      <div className="mt-auto pt-4 border-t border-zinc-200 min-h-25 flex flex-col justify-center">
        
        {/* State 1: Range Selected */}
        {startDate && endDate && (
          <div className="flex justify-between items-center bg-zinc-100 p-3 rounded-lg border border-zinc-200">
            <div className="flex flex-col">
              <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Trip Duration</span>
                <span className="text-sm font-semibold text-zinc-800">
                    {format(startDate!, 'MMM d')} - {format(endDate!, 'MMM d')} 
                    ({differenceInDays(endDate!, startDate!) + 1} days)
                </span>
            </div>
            <button onClick={() => { setStartDate(null); setEndDate(null); }} className="text-xs font-bold text-red-500 hover:text-red-700 px-3 py-1 rounded-md hover:bg-red-50 transition-colors">
              Clear Range
            </button>
          </div>
        )}

        {/* State 2: Single Date Selected (Sticky Note Mode) */}
        {activeDateKey && !endDate && (
          <div className="flex gap-2 items-start bg-amber-50/50 p-3 rounded-lg border border-amber-200/50 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-400" />
            <Pin className="w-4 h-4 text-amber-500 mt-1 shrink-0" />
            <div className="flex-1">
              <input
                type="text"
                placeholder={`Add a note for ${format(startDate!, 'MMM d')}...`}
                value={activeNoteText}
                onChange={(e) => setActiveNoteText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveNote(activeDateKey)}
                className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium text-zinc-800 placeholder-zinc-400 outline-none"
              />
              {notes[activeDateKey] && (
                <p className="text-xs text-zinc-500 mt-1">Saved automatically.</p>
              )}
            </div>
            <div className="flex gap-1">
              {notes[activeDateKey] && (
                <button onClick={() => deleteNote(activeDateKey)} className="p-1.5 text-zinc-400 hover:text-red-500 rounded-md transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button 
                onClick={() => saveNote(activeDateKey)}
                className="px-3 py-1.5 bg-zinc-900 text-white text-xs font-bold rounded-md hover:bg-zinc-800 transition-colors shadow-sm active:scale-95"
              >
                Save
              </button>
            </div>
          </div>
        )}

        {/* State 3: Nothing Selected */}
        {!startDate && !endDate && (
          <div className="text-center text-sm font-medium text-zinc-400">
            Click a date to add a note, or select two dates for a range.
          </div>
        )}
      </div>
    </div>
  );
}