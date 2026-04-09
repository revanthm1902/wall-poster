"use client";

import React, { useState, useEffect } from 'react';
import { 
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, format, isSameMonth, isSameDay, 
  isToday, isWithinInterval, isAfter, isBefore 
} from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export default function CalendarGrid({ currentDate }: { currentDate: Date }) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. ROBUST LOCAL STORAGE MOUNTING
  useEffect(() => {
    const savedStart = localStorage.getItem('wall_cal_start');
    const savedEnd = localStorage.getItem('wall_cal_end');
    const savedNote = localStorage.getItem('wall_cal_note');
    
    if (savedStart) setStartDate(new Date(savedStart));
    if (savedEnd) setEndDate(new Date(savedEnd));
    if (savedNote) setNoteTitle(savedNote);
    setIsLoaded(true);
  }, []);

  // 2. AUTO-SAVE ON CHANGE
  useEffect(() => {
    if (!isLoaded) return;
    
    if (startDate) localStorage.setItem('wall_cal_start', startDate.toISOString());
    else localStorage.removeItem('wall_cal_start');
    
    if (endDate) localStorage.setItem('wall_cal_end', endDate.toISOString());
    else localStorage.removeItem('wall_cal_end');
    
    localStorage.setItem('wall_cal_note', noteTitle);
  }, [startDate, endDate, noteTitle, isLoaded]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDateGrid = startOfWeek(monthStart);
  const endDateGrid = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: startDateGrid, end: endDateGrid });
  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const onDateClick = (day: Date) => {
    if (!isSameMonth(day, monthStart)) return;
    if (startDate && endDate) {
      setStartDate(day);
      setEndDate(null);
    } else if (startDate && !endDate) {
      if (isBefore(day, startDate)) setStartDate(day);
      else setEndDate(day);
    } else {
      setStartDate(day);
    }
  };

  const clearRange = () => {
    setStartDate(null); setEndDate(null); setHoverDate(null); setNoteTitle("");
  };

  return (
    <div className="w-full h-full flex flex-col pointer-events-auto">
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 mb-4">
        {weekDays.map(day => (
          <div key={day} className="text-center text-[10px] font-bold tracking-widest text-inherit/40">{day}</div>
        ))}
      </div>

      {/* Flawless Pill Calendar Grid */}
      <div className="grid grid-cols-7 gap-y-2 relative">
        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isStart = startDate && isSameDay(day, startDate);
          const isEnd = endDate && isSameDay(day, endDate);
          const isMiddle = startDate && endDate && isWithinInterval(day, { start: startDate, end: endDate }) && !isStart && !isEnd;
          const isHoverMiddle = startDate && !endDate && hoverDate && isAfter(hoverDate, startDate) && isWithinInterval(day, { start: startDate, end: hoverDate }) && !isStart;
          const isTodayDate = isToday(day);

          return (
            <div 
              key={day.toISOString()} 
              onMouseEnter={() => setHoverDate(day)}
              className="relative flex justify-center items-center h-10 w-full"
            >
              {isCurrentMonth ? (
                <>
                  {/* SEAMLESS BACKGROUND CONNECTORS */}
                  {(isMiddle || isHoverMiddle) && <div className="absolute inset-y-0 left-[-2px] right-[-2px] bg-black/10 z-0" />}
                  {isStart && (endDate || (hoverDate && isAfter(hoverDate, startDate))) && <div className="absolute inset-y-0 right-[-2px] left-1/2 bg-black/10 z-0" />}
                  {isEnd && <div className="absolute inset-y-0 left-[-2px] right-1/2 bg-black/10 z-0" />}

                  {/* THE INTERACTIVE DATE BUBBLE */}
                  <div 
                    onClick={() => onDateClick(day)} 
                    className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full cursor-pointer transition-all duration-200
                      ${isStart || isEnd ? 'bg-zinc-900 text-white shadow-md scale-105' : 'hover:bg-black/5 text-inherit'}
                      ${isTodayDate && !isStart && !isEnd ? 'border-2 border-amber-500 text-amber-600 font-bold' : 'font-medium'}
                    `}
                  >
                    {format(day, 'd')}
                  </div>
                </>
              ) : (
                <div className="text-inherit/20 text-sm">{format(day, 'd')}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Editable Note & Memory UI */}
      <AnimatePresence>
        {startDate && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className="mt-auto pt-6 border-t border-inherit/10 flex items-end justify-between"
          >
            <div className="flex flex-col flex-1 pr-8">
              <input 
                type="text" 
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                className="text-xs font-black uppercase tracking-widest text-inherit bg-transparent outline-none border-b border-transparent hover:border-inherit/20 focus:border-inherit/50 transition-colors w-full mb-1 pb-1 placeholder-inherit/30"
                placeholder="ADD NOTE TITLE (e.g. BALI TRIP)..."
              />
              <span className="text-sm font-semibold text-inherit/70">
                {format(startDate, 'MMM d')} 
                {endDate ? ` - ${format(endDate, 'MMM d')} (${Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24))} days)` : ' (Select end date)'}
              </span>
            </div>
            <button onClick={clearRange} className="text-xs font-bold text-red-500/80 hover:text-red-500 uppercase tracking-wider mb-0.5 transition-colors">
              Clear
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}