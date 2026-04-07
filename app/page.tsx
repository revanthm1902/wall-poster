"use client";

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { addMonths, subMonths, format } from 'date-fns';
import CalendarGrid from '@/components/CalendarGrid';

export default function WallCalendar() {
  // --- STATE ---
  // Tracks the current month being viewed (defaults to today)
  const [currentDate, setCurrentDate] = useState(new Date());

  // --- HANDLERS ---
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  return (
    <main className="min-h-screen flex items-center justify-center p-4 md:p-8 font-sans">
      
      {/* THE PHYSICAL POSTER CONTAINER */}
      <div className="relative w-full max-w-5xl bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)] rounded-b-xl rounded-t-sm overflow-hidden border-t-[16px] border-zinc-900">

        <div className="absolute top-[-12px] left-1/2 -translate-x-1/2 flex gap-16 z-20">
          <div className="w-4 h-4 bg-zinc-300 rounded-full shadow-inner border border-zinc-400" />
          <div className="w-4 h-4 bg-zinc-300 rounded-full shadow-inner border border-zinc-400" />
        </div>

        <div className="flex flex-col md:flex-row h-[800px] md:h-[600px]">
          
          {/* LEFT PANEL: The Hero Image */}
          <div className="w-full md:w-5/12 h-64 md:h-full relative group overflow-hidden bg-black">
             <img 
               src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80" 
               alt="Monthly Theme"
               className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-1000 ease-out"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                <h1 className="text-white text-6xl font-black tracking-tighter uppercase drop-shadow-lg">
                  {format(currentDate, 'MMMM')}
                </h1>
                <p className="text-white/90 text-xl font-semibold tracking-wide">
                  {format(currentDate, 'yyyy')}
                </p>
             </div>
          </div>

          {/* RIGHT PANEL: The Calendar Interface */}
          <div className="w-full md:w-7/12 p-6 md:p-10 bg-[#fafafa] flex flex-col">
             
             {/* Header: Controls & Navigation */}
             <div className="flex justify-between items-center mb-8">
               <h2 className="text-2xl font-bold text-zinc-800">Select Dates</h2>
               <div className="flex gap-2">
                 <button 
                   onClick={prevMonth}
                   className="p-2 rounded-full hover:bg-zinc-200 transition-colors active:scale-95"
                 >
                   <ChevronLeft className="w-6 h-6 text-zinc-600" />
                 </button>
                 <button 
                   onClick={nextMonth}
                   className="p-2 rounded-full hover:bg-zinc-200 transition-colors active:scale-95"
                 >
                   <ChevronRight className="w-6 h-6 text-zinc-600" />
                 </button>
               </div>
             </div>

             {/* The Grid Area*/}
             <div className="flex-1">
              <CalendarGrid currentDate={currentDate} />
            </div>
            
          </div>
        </div>
      </div>
    </main>
  );
}