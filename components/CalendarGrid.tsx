"use client";

import React, { useState, useEffect } from 'react';
import { 
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, format, isSameMonth, isSameDay, 
  isToday, isWithinInterval, isAfter, isBefore 
} from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

type SavedRange = { id: string; start: string; end: string; note: string };

const ConfettiBurst = () => {
  const colors = ['#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#8b5cf6'];
  return (
    <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center">
      {Array.from({ length: 40 }).map((_, i) => (
        <motion.div
          key={i} initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
          animate={{ x: (Math.random() - 0.5) * 600, y: (Math.random() - 0.5) * 600, scale: Math.random() * 1.5, opacity: 0, rotate: Math.random() * 360 }}
          transition={{ duration: 1 + Math.random() * 1.5, ease: "easeOut" }}
          className="absolute w-2 h-2 rounded-sm shadow-sm" style={{ backgroundColor: colors[Math.floor(Math.random() * colors.length)] }}
        />
      ))}
    </div>
  );
};

export default function CalendarGrid({ currentDate }: { currentDate: Date }) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [inputText, setInputText] = useState("");
  
  const [singleNotes, setSingleNotes] = useState<Record<string, string>>({});
  const [monthNotes, setMonthNotes] = useState<Record<string, string>>({});
  const [savedRanges, setSavedRanges] = useState<SavedRange[]>([]);
  
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // LOAD MEMORY
  useEffect(() => {
    const sSingle = localStorage.getItem('cal_single_notes');
    const sMonth = localStorage.getItem('cal_month_notes');
    const sRanges = localStorage.getItem('cal_ranges');
    
    if (sSingle) setSingleNotes(JSON.parse(sSingle));
    if (sMonth) setMonthNotes(JSON.parse(sMonth));
    if (sRanges) setSavedRanges(JSON.parse(sRanges));
    
    setIsLoaded(true);
  }, []);

  // AUTO-SAVE MEMORY
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('cal_single_notes', JSON.stringify(singleNotes));
    localStorage.setItem('cal_month_notes', JSON.stringify(monthNotes));
    localStorage.setItem('cal_ranges', JSON.stringify(savedRanges));
  }, [singleNotes, monthNotes, savedRanges, isLoaded]);

  // UPDATE INPUT CONTEXT
  useEffect(() => {
    setIsSaved(false);
    if (startDate && !endDate) {
      setInputText(singleNotes[format(startDate, 'yyyy-MM-dd')] || "");
    } else if (!startDate && !endDate) {
      setInputText(monthNotes[format(currentDate, 'yyyy-MM')] || "");
    } else {
      setInputText("");
    }
  }, [startDate, endDate, currentDate, singleNotes, monthNotes]);

  // GLOBAL ESCAPE KEY LISTENER FOR GRID
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setStartDate(null);
        setEndDate(null);
        setHoverDate(null);
        setInputText("");
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDateGrid = startOfWeek(monthStart);
  const endDateGrid = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: startDateGrid, end: endDateGrid });

  const onDateClick = (day: Date) => {
    if (!isSameMonth(day, monthStart)) return;
    
    if (startDate && !endDate) {
      if (isBefore(day, startDate)) {
        setStartDate(day); 
      } else if (isSameDay(day, startDate)) {
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

  // EXPLICIT SAVE & DISMISS WORKFLOW
  const handleSaveRange = () => {
    if (!startDate || !endDate || !inputText.trim()) return;
    const newRange: SavedRange = {
      id: Math.random().toString(36).substring(2, 9),
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      note: inputText
    };
    setSavedRanges(prev => [...prev, newRange]);
    
    // Clear visual selection immediately after saving
    setStartDate(null); setEndDate(null); setInputText(""); setHoverDate(null);
  };

  const handleSaveSingle = () => {
    if (!startDate) return;
    const key = format(startDate, 'yyyy-MM-dd');
    if (!inputText.trim()) {
       const newNotes = {...singleNotes};
       delete newNotes[key];
       setSingleNotes(newNotes);
    } else {
       setSingleNotes(prev => ({ ...prev, [key]: inputText }));
    }
    
    // Show brief saved state, then dismiss
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      setStartDate(null); setEndDate(null); setInputText(""); setHoverDate(null);
    }, 400);
  };

  const handleSaveMonth = () => {
    const key = format(currentDate, 'yyyy-MM');
    if (!inputText.trim()) {
       const newNotes = {...monthNotes};
       delete newNotes[key];
       setMonthNotes(newNotes);
    } else {
       setMonthNotes(prev => ({ ...prev, [key]: inputText }));
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const deleteRange = (id: string) => setSavedRanges(prev => prev.filter(r => r.id !== id));
  
  const deleteSingleNote = () => {
    if (!startDate) return;
    const key = format(startDate, 'yyyy-MM-dd');
    const newNotes = {...singleNotes};
    delete newNotes[key];
    setSingleNotes(newNotes);
    setInputText("");
    setStartDate(null); // Dismiss after delete
  };

  const deleteMonthNote = () => {
    const key = format(currentDate, 'yyyy-MM');
    const newNotes = {...monthNotes};
    delete newNotes[key];
    setMonthNotes(newNotes);
    setInputText("");
  };

  const activeOverlappingRanges = startDate && !endDate 
    ? savedRanges.filter(r => isWithinInterval(startDate, { start: new Date(r.start), end: new Date(r.end) }))
    : [];

  return (
    <div className="w-full h-full flex flex-col pointer-events-auto relative">
      {showConfetti && <ConfettiBurst />}

      <div className="grid grid-cols-7 mb-4">
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
          <div key={day} className="text-center text-[10px] font-bold tracking-widest text-inherit/40">{day}</div>
        ))}
      </div>

      {/* THE HOVER BLEED FIX: onMouseLeave added here! */}
      <div className="grid grid-cols-7 gap-y-2 relative" onMouseLeave={() => setHoverDate(null)}>
        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isStart = startDate && isSameDay(day, startDate);
          const isEnd = endDate && isSameDay(day, endDate);
          const isMiddle = startDate && endDate && isWithinInterval(day, { start: startDate, end: endDate }) && !isStart && !isEnd;
          const isHoverMiddle = startDate && !endDate && hoverDate && isAfter(hoverDate, startDate) && isWithinInterval(day, { start: startDate, end: hoverDate }) && !isStart;
          
          const hasSingleNote = singleNotes[format(day, 'yyyy-MM-dd')];
          const hasPhantomRange = savedRanges.some(r => isWithinInterval(day, { start: new Date(r.start), end: new Date(r.end) }));

          return (
            <div key={day.toISOString()} onMouseEnter={() => setHoverDate(day)} className="relative flex justify-center items-center h-10 w-full">
              {isCurrentMonth ? (
                <>
                  {(isMiddle || isHoverMiddle) && <div className="absolute inset-y-0 left-0 right-0 bg-black/10 z-0" />}
                  {isStart && (endDate || (hoverDate && isAfter(hoverDate, startDate))) && <div className="absolute inset-y-0 right-0 w-1/2 bg-black/10 z-0" />}
                  {isEnd && <div className="absolute inset-y-0 left-0 w-1/2 bg-black/10 z-0" />}

                  <div onClick={() => onDateClick(day)} className={`relative z-10 flex flex-col items-center justify-center w-10 h-10 rounded-full cursor-pointer transition-all duration-200
                      ${isStart || isEnd ? 'bg-zinc-900 text-white shadow-md scale-105' : 'hover:bg-black/5 text-inherit'}
                      ${isToday(day) && !isStart && !isEnd ? 'border-2 border-amber-500 text-amber-600 font-bold' : 'font-medium'}
                    `}
                  >
                    <span>{format(day, 'd')}</span>
                    
                    {/* Visual Memory Dots */}
                    <div className="absolute bottom-[2px] flex gap-1">
                      {hasPhantomRange && !isStart && !isEnd && <div className="w-1 h-1 bg-inherit/30 rounded-full" />}
                      {hasSingleNote && !isStart && !isEnd && <div className="w-1 h-1 bg-amber-500 rounded-full shadow-sm" />}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-inherit/20 text-sm">{format(day, 'd')}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* --- LAYERED MEMORY UI --- */}
      <div className="mt-auto pt-6 flex flex-col gap-3 min-h-[120px]">
        <AnimatePresence mode="wait">
          
          {/* STATE 1: RANGE SELECTED */}
          {startDate && endDate && (
            <motion.div key="range-edit" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="flex flex-col border-t border-inherit/10 pt-4">
              <span className="text-[10px] font-bold text-inherit/40 uppercase tracking-widest mb-2">New Event Range</span>
              <div className="flex items-center gap-4 w-full mb-1">
                <input 
                  type="text" value={inputText} onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 text-xs font-black uppercase tracking-widest text-inherit bg-transparent outline-none border-b border-inherit/20 focus:border-inherit/80 pb-1 placeholder-inherit/30"
                  placeholder="E.G., SUMMER HACKATHON..."
                />
                <button onClick={handleSaveRange} className="text-[10px] font-bold px-4 py-1.5 bg-zinc-900 text-white rounded-sm uppercase tracking-wider hover:bg-zinc-800 transition-colors shadow-sm">Save Range</button>
              </div>
              <span className="text-xs font-semibold text-inherit/60">{format(startDate, 'MMM d')} - {format(endDate, 'MMM d')}</span>
            </motion.div>
          )}

          {/* STATE 2: SINGLE DATE CLICKED */}
          {startDate && !endDate && (
            <motion.div key="single-edit" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="flex flex-col border-t border-inherit/10 pt-4 gap-4">
              
              {/* Phantom Memory Cards */}
              {activeOverlappingRanges.map(r => (
                <div key={r.id} className="flex justify-between items-center bg-black/5 rounded-md p-2 px-3">
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase text-inherit/80">{r.note}</span>
                    <span className="text-[10px] font-bold text-inherit/50">{format(new Date(r.start), 'MMM d')} - {format(new Date(r.end), 'MMM d')}</span>
                  </div>
                  <button onClick={() => deleteRange(r.id)} className="text-[10px] text-red-500/70 hover:text-red-500 uppercase font-bold tracking-wider transition-colors">Delete</button>
                </div>
              ))}

              {/* Day Note Editor */}
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-inherit/40 uppercase tracking-widest mb-2">Note for {format(startDate, 'MMM d, yyyy')}</span>
                <div className="flex items-center gap-4 w-full mb-1">
                  <input 
                    type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} 
                    className="flex-1 text-xs font-black uppercase tracking-widest text-inherit bg-transparent outline-none border-b border-inherit/20 focus:border-inherit/80 pb-1 placeholder-inherit/30"
                    placeholder="ADD DAILY MEMO..."
                  />
                  <div className="flex items-center gap-2">
                    {singleNotes[format(startDate, 'yyyy-MM-dd')] && (
                      <button onClick={deleteSingleNote} className="text-[10px] font-bold text-red-500/70 hover:text-red-500 uppercase tracking-wider transition-colors">Delete</button>
                    )}
                    <button onClick={handleSaveSingle} className={`text-[10px] font-bold px-4 py-1.5 rounded-sm uppercase tracking-wider transition-colors shadow-sm ${isSaved ? 'bg-green-500 text-white' : 'bg-zinc-900 text-white hover:bg-zinc-800'}`}>
                      {isSaved ? 'Saved!' : 'Save'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STATE 3: MONTHLY CANVAS */}
          {!startDate && !endDate && (
            <motion.div key="month-edit" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="flex flex-col border-t border-inherit/10 pt-4">
              <span className="text-[10px] font-bold text-inherit/40 uppercase tracking-widest mb-2">{format(currentDate, 'MMMM')} Canvas</span>
              <div className="flex items-center gap-4 w-full mb-1">
                <input 
                  type="text" value={inputText} onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 text-xs font-black uppercase tracking-widest text-inherit bg-transparent outline-none border-b border-transparent hover:border-inherit/20 focus:border-inherit/80 pb-1 placeholder-inherit/30 transition-colors"
                  placeholder="WRITE A NOTE FOR THIS MONTH..."
                />
                <div className="flex items-center gap-2">
                  {monthNotes[format(currentDate, 'yyyy-MM')] && (
                    <button onClick={deleteMonthNote} className="text-[10px] font-bold text-red-500/70 hover:text-red-500 uppercase tracking-wider transition-colors">Delete</button>
                  )}
                  <button onClick={handleSaveMonth} className={`text-[10px] font-bold px-3 py-1 rounded-sm uppercase tracking-wider transition-all border ${isSaved ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-inherit/5 text-inherit hover:bg-inherit/10 border-transparent'}`}>
                    {isSaved ? 'Saved!' : 'Save'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}