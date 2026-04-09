"use client";

import React, { useState, useEffect } from 'react';
import { 
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, format, isSameMonth, isSameDay, 
  isToday, isWithinInterval, isAfter, isBefore 
} from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

// --- CUSTOM CONFETTI PARTICLE ENGINE ---
const ConfettiBurst = () => {
  const colors = ['#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#8b5cf6'];
  return (
    <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center">
      {Array.from({ length: 45 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
          animate={{
            x: (Math.random() - 0.5) * 600,
            y: (Math.random() - 0.5) * 600,
            scale: Math.random() * 1.5,
            opacity: 0,
            rotate: Math.random() * 360
          }}
          transition={{ duration: 1 + Math.random() * 1.5, ease: "easeOut" }}
          className="absolute w-2 h-2 rounded-sm shadow-sm"
          style={{ backgroundColor: colors[Math.floor(Math.random() * colors.length)] }}
        />
      ))}
    </div>
  );
};

export default function CalendarGrid({ currentDate }: { currentDate: Date }) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  
  // Data States
  const [rangeNote, setRangeNote] = useState("");
  const [singleNotes, setSingleNotes] = useState<Record<string, string>>({});
  
  // Input State (Temporary state before hitting "Save")
  const [inputText, setInputText] = useState("");
  
  // Interaction States
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // LOAD FROM BROWSER MEMORY
  useEffect(() => {
    const savedStart = localStorage.getItem('wall_cal_start');
    const savedEnd = localStorage.getItem('wall_cal_end');
    const savedRangeNote = localStorage.getItem('wall_cal_range_note');
    const savedSingleNotes = localStorage.getItem('wall_cal_single_notes');
    
    if (savedStart) setStartDate(new Date(savedStart));
    if (savedEnd) setEndDate(new Date(savedEnd));
    if (savedRangeNote) setRangeNote(savedRangeNote);
    if (savedSingleNotes) setSingleNotes(JSON.parse(savedSingleNotes));
    
    setIsLoaded(true);
  }, []);

  // Update input text when selection changes
  useEffect(() => {
    setIsSaved(false);
    if (startDate && endDate) {
      setInputText(rangeNote);
    } else if (startDate && !endDate) {
      const dateKey = format(startDate, 'yyyy-MM-dd');
      setInputText(singleNotes[dateKey] || "");
    } else {
      setInputText("");
    }
  }, [startDate, endDate, rangeNote, singleNotes]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDateGrid = startOfWeek(monthStart);
  const endDateGrid = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: startDateGrid, end: endDateGrid });
  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const onDateClick = (day: Date) => {
    if (!isSameMonth(day, monthStart)) return;
    
    if (startDate && !endDate) {
      if (isBefore(day, startDate)) {
        setStartDate(day); 
      } else if (isSameDay(day, startDate)) {
        // Unselect if clicked again
        setStartDate(null);
      } else {
        setEndDate(day);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2500);
      }
    } else {
      setStartDate(day);
      setEndDate(null);
    }
  };

  // EXPLICIT SAVE ACTION
  const handleSave = () => {
    if (startDate && endDate) {
      setRangeNote(inputText);
      localStorage.setItem('wall_cal_start', startDate.toISOString());
      localStorage.setItem('wall_cal_end', endDate.toISOString());
      localStorage.setItem('wall_cal_range_note', inputText);
    } else if (startDate && !endDate) {
      const dateKey = format(startDate, 'yyyy-MM-dd');
      const newNotes = { ...singleNotes, [dateKey]: inputText };
      setSingleNotes(newNotes);
      localStorage.setItem('wall_cal_start', startDate.toISOString());
      localStorage.removeItem('wall_cal_end');
      localStorage.setItem('wall_cal_single_notes', JSON.stringify(newNotes));
    }
    
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const clearSelection = () => {
    setStartDate(null); setEndDate(null); setHoverDate(null); setInputText("");
    localStorage.removeItem('wall_cal_start');
    localStorage.removeItem('wall_cal_end');
  };

  return (
    <div className="w-full h-full flex flex-col pointer-events-auto relative">
      
      {showConfetti && <ConfettiBurst />}

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 mb-4">
        {weekDays.map(day => (
          <div key={day} className="text-center text-[10px] font-bold tracking-widest text-inherit/40">{day}</div>
        ))}
      </div>

      {/* FLAWLESS PILL CALENDAR GRID */}
      <div className="grid grid-cols-7 gap-y-2 relative">
        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isStart = startDate && isSameDay(day, startDate);
          const isEnd = endDate && isSameDay(day, endDate);
          const isMiddle = startDate && endDate && isWithinInterval(day, { start: startDate, end: endDate }) && !isStart && !isEnd;
          const isHoverMiddle = startDate && !endDate && hoverDate && isAfter(hoverDate, startDate) && isWithinInterval(day, { start: startDate, end: hoverDate }) && !isStart;
          const isTodayDate = isToday(day);
          
          const dateKey = format(day, 'yyyy-MM-dd');
          const hasSingleNote = singleNotes[dateKey] && singleNotes[dateKey].trim() !== '';

          return (
            <div key={day.toISOString()} onMouseEnter={() => setHoverDate(day)} className="relative flex justify-center items-center h-10 w-full">
              {isCurrentMonth ? (
                <>
                  {/* PERFECT GEOMETRY CONNECTOR BARS (No Gaps) */}
                  {(isMiddle || isHoverMiddle) && <div className="absolute inset-y-0 left-0 right-0 bg-black/10 z-0" />}
                  {isStart && (endDate || (hoverDate && isAfter(hoverDate, startDate))) && <div className="absolute inset-y-0 right-0 w-1/2 bg-black/10 z-0" />}
                  {isEnd && <div className="absolute inset-y-0 left-0 w-1/2 bg-black/10 z-0" />}

                  {/* DATE BUBBLE */}
                  <div 
                    onClick={() => onDateClick(day)} 
                    className={`relative z-10 flex flex-col items-center justify-center w-10 h-10 rounded-full cursor-pointer transition-all duration-200
                      ${isStart || isEnd ? 'bg-zinc-900 text-white shadow-md scale-105' : 'hover:bg-black/5 text-inherit'}
                      ${isTodayDate && !isStart && !isEnd ? 'border-2 border-amber-500 text-amber-600 font-bold' : 'font-medium'}
                    `}
                  >
                    <span>{format(day, 'd')}</span>
                    
                    {/* The Note Indicator Dot */}
                    {hasSingleNote && !isStart && !isEnd && (
                      <div className="absolute bottom-1 w-1 h-1 bg-amber-500 rounded-full shadow-sm" />
                    )}
                  </div>
                </>
              ) : (
                <div className="text-inherit/20 text-sm">{format(day, 'd')}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* EDITABLE NOTE & SAVE UI */}
      <div className="mt-auto pt-6 flex items-end justify-between min-h-[80px]">
        <AnimatePresence mode="wait">
          
          {/* Note Editor (Visible only when something is selected) */}
          {startDate && (
            <motion.div key="editor" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="flex flex-col flex-1 pr-8 border-t border-inherit/10 pt-4">
              <div className="flex items-center gap-4 w-full mb-1">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 text-xs font-black uppercase tracking-widest text-inherit bg-transparent outline-none border-b border-inherit/20 hover:border-inherit/50 focus:border-inherit/80 transition-colors pb-1 placeholder-inherit/30"
                  placeholder={endDate ? "ADD RANGE NOTE (E.G. BALI TRIP)..." : "ADD NOTE FOR THIS DAY..."}
                />
                
                {/* EXPLICIT SAVE BUTTON */}
                <button 
                  onClick={handleSave} 
                  className={`text-[10px] font-bold px-3 py-1 rounded-sm uppercase tracking-wider transition-all border
                    ${isSaved ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-inherit/5 text-inherit hover:bg-inherit/10 border-transparent'}
                  `}
                >
                  {isSaved ? "Saved!" : "Save"}
                </button>
              </div>
              
              <span className="text-sm font-semibold text-inherit/70">
                {format(startDate, 'MMM d')} 
                {endDate ? ` - ${format(endDate, 'MMM d')} (${Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24))} days)` : ''}
              </span>
            </motion.div>
          )}
          
          {/* Minimalist Empty State (No Text) */}
          {!startDate && (
             <motion.div key="empty" className="w-full h-px bg-inherit/10" />
          )}

        </AnimatePresence>

        {/* Clear Button */}
        <AnimatePresence>
          {startDate && (
            <motion.button 
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
              onClick={clearSelection} 
              className="text-xs font-bold text-inherit/40 hover:text-red-500 uppercase tracking-wider mb-0.5 transition-colors shrink-0"
            >
              Clear
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}