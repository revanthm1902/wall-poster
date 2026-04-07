"use client";

import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Download, Loader2 } from 'lucide-react';
import { addMonths, subMonths, format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { toPng } from 'html-to-image';
import CalendarGrid from '@/components/CalendarGrid';

const monthImages = [
  "https://images.unsplash.com/photo-1445543949571-ffc3e0e2f55e", // Jan
  "https://images.unsplash.com/photo-1433162653888-a571f51cb86a", // Feb
  "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa", // Mar
  "https://images.unsplash.com/photo-1522748906645-95d8adfd52c7", // Apr
  "https://images.unsplash.com/photo-1476041800959-2f10d0590d93", // May
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e", // Jun
  "https://images.unsplash.com/photo-1501426026826-31c667bdf23d", // Jul
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e", // Aug
  "https://images.unsplash.com/photo-1439853949127-fa647821eba0", // Sep
  "https://images.unsplash.com/photo-1509023464722-18d996393ca8", // Oct
  "https://images.unsplash.com/photo-1478147427282-58a87a120781", // Nov
  "https://images.unsplash.com/photo-1512389142860-9c449e58a543"  // Dec
];

export default function WallCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [direction, setDirection] = useState(1); 
  const [isExporting, setIsExporting] = useState(false);
  
  const posterRef = useRef<HTMLDivElement>(null);

  const nextMonth = () => { setDirection(1); setCurrentDate(addMonths(currentDate, 1)); };
  const prevMonth = () => { setDirection(-1); setCurrentDate(subMonths(currentDate, 1)); };

  // --- THE SNAPSHOT EXPORT LOGIC ---
  const exportPoster = async () => {
    if (!posterRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(posterRef.current, { 
        quality: 1, 
        pixelRatio: 2,
        backgroundColor: '#ffffff'
      });
      const link = document.createElement('a');
      link.download = `calendar-poster-${format(currentDate, 'MMM-yyyy')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export poster', err);
    } finally {
      setIsExporting(false);
    }
  };

  const currentMonthIndex = currentDate.getMonth();
  const heroImage = `${monthImages[currentMonthIndex]}?auto=format&fit=crop&w=1000&q=80`;

  // 3D Flip
  const flipVariants = {
    enter: (direction: number) => ({ rotateX: direction > 0 ? -90 : 90, opacity: 0, y: direction > 0 ? 50 : -50, transformOrigin: "top" }),
    center: { zIndex: 1, rotateX: 0, opacity: 1, y: 0, transformOrigin: "top" },
    exit: (direction: number) => ({ zIndex: 0, rotateX: direction < 0 ? -90 : 90, opacity: 0, y: direction < 0 ? 50 : -50, transformOrigin: "top" })
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 font-sans perspective-1000 gap-8">
      
      {/* THE POSTER CONTAINER (Everything inside here gets exported!) */}
      <div 
        ref={posterRef}
        className="relative w-full max-w-5xl bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)] rounded-b-xl rounded-t-sm overflow-hidden border-t-[16px] border-zinc-900"
      >

        <div className="absolute top-[-12px] left-1/2 -translate-x-1/2 flex gap-16 z-20">
          <div className="w-4 h-4 bg-zinc-300 rounded-full shadow-inner border border-zinc-400" />
          <div className="w-4 h-4 bg-zinc-300 rounded-full shadow-inner border border-zinc-400" />
        </div>

        <div className="flex flex-col md:flex-row h-[800px] md:h-[600px]">
          
          {/* Dynamic Hero Image */}
          <div className="w-full md:w-5/12 h-64 md:h-full relative group overflow-hidden bg-black z-10">
             <AnimatePresence mode="popLayout">
               <motion.img 
                 key={currentMonthIndex}
                 initial={{ opacity: 0, scale: 1.1 }}
                 animate={{ opacity: 0.9, scale: 1 }}
                 exit={{ opacity: 0 }}
                 transition={{ duration: 0.8 }}
                 src={heroImage} 
                 alt="Monthly Theme"
                 
                 crossOrigin="anonymous" 
                 className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
               />
             </AnimatePresence>
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                <AnimatePresence mode="wait">
                  <motion.h1 
                    key={currentDate.toISOString()}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-white text-6xl font-black tracking-tighter uppercase drop-shadow-lg"
                  >
                    {format(currentDate, 'MMMM')}
                  </motion.h1>
                </AnimatePresence>
                <p className="text-white/90 text-xl font-semibold tracking-wide">{format(currentDate, 'yyyy')}</p>
             </div>
          </div>

          {/* Calendar Interface */}
          <div className="w-full md:w-7/12 p-6 md:p-10 bg-[#fafafa] flex flex-col perspective-1000 z-0">
             <div className="flex justify-between items-center mb-8">
               <h2 className="text-2xl font-bold text-zinc-800">Select Dates</h2>
               <div className="flex gap-2">
                 {/* HAPTIC UPGRADE: motion.button for physical bounce effect */}
                 <motion.button 
                   whileTap={{ scale: 0.85 }} 
                   onClick={prevMonth} 
                   className="p-2 rounded-full hover:bg-zinc-200 transition-colors"
                 >
                   <ChevronLeft className="w-6 h-6 text-zinc-600" />
                 </motion.button>
                 <motion.button 
                   whileTap={{ scale: 0.85 }} 
                   onClick={nextMonth} 
                   className="p-2 rounded-full hover:bg-zinc-200 transition-colors"
                 >
                   <ChevronRight className="w-6 h-6 text-zinc-600" />
                 </motion.button>
               </div>
             </div>

             {/* The 3D Grid */}
             <div className="flex-1 relative">
               <AnimatePresence custom={direction} mode="popLayout">
                 <motion.div
                   key={currentDate.toISOString()}
                   custom={direction}
                   variants={flipVariants}
                   initial="enter"
                   animate="center"
                   exit="exit"
                   transition={{ type: "spring", stiffness: 100, damping: 15 }}
                   className="absolute inset-0"
                 >
                   <CalendarGrid currentDate={currentDate} />
                 </motion.div>
               </AnimatePresence>
             </div>
          </div>
        </div>
      </div>

      <motion.button
        whileHover={{ y: -3, boxShadow: "0px 10px 20px rgba(0,0,0,0.15)" }}
        whileTap={{ scale: 0.95 }}
        onClick={exportPoster}
        disabled={isExporting}
        className="flex items-center gap-3 px-8 py-4 bg-zinc-900 text-white font-bold text-lg rounded-full shadow-lg hover:bg-zinc-800 transition-all disabled:opacity-70 disabled:scale-100"
      >
        {isExporting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Download className="w-6 h-6" />}
        {isExporting ? 'Generating Poster...' : 'Download as Poster'}
      </motion.button>

    </main>
  );
}