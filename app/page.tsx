"use client";

import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Settings2 } from 'lucide-react';
import { addMonths, subMonths, format } from 'date-fns';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { toPng } from 'html-to-image';
import CalendarGrid from '@/components/CalendarGrid';
import PosterStudio from '@/components/PosterStudio'; // <-- IMPORT OUR NEW COMPONENT

const monthImages = [
  "https://images.unsplash.com/photo-1445543949571-ffc3e0e2f55e", "https://images.unsplash.com/photo-1433162653888-a571f51cb86a",
  "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa", "https://images.unsplash.com/photo-1522748906645-95d8adfd52c7",
  "https://images.unsplash.com/photo-1476041800959-2f10d0590d93", "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
  "https://images.unsplash.com/photo-1501426026826-31c667bdf23d", "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",
  "https://images.unsplash.com/photo-1439853949127-fa647821eba0", "https://images.unsplash.com/photo-1509023464722-18d996393ca8",
  "https://images.unsplash.com/photo-1478147427282-58a87a120781", "https://images.unsplash.com/photo-1512389142860-9c449e58a543"
];

export default function WallCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [direction, setDirection] = useState(1); 

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [fontStyle, setFontStyle] = useState<'font-sans' | 'font-serif' | 'font-mono'>('font-sans');
  const [theme, setTheme] = useState<'zinc' | 'sepia' | 'midnight'>('zinc');
  const [ultraQuality, setUltraQuality] = useState(false);

  const posterRef = useRef<HTMLDivElement>(null);

  // Spatial 3D Engine
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 150, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 20 });
  const rotateX = useTransform(springY, [-0.5, 0.5], ["3deg", "-3deg"]);
  const rotateY = useTransform(springX, [-0.5, 0.5], ["-3deg", "3deg"]);
  const glareX = useTransform(springX, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(springY, [-0.5, 0.5], ["0%", "100%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(xPct);
    mouseY.set(yPct);
  };

  const nextMonth = () => { setDirection(1); setCurrentDate(addMonths(currentDate, 1)); };
  const prevMonth = () => { setDirection(-1); setCurrentDate(subMonths(currentDate, 1)); };

  const exportPoster = async () => {
    if (!posterRef.current) return;
    setIsExporting(true);
    mouseX.set(0); 
    mouseY.set(0);
    
    setTimeout(async () => {
      try {
        const dataUrl = await toPng(posterRef.current!, { 
          quality: 1, 
          pixelRatio: ultraQuality ? 4 : 2,
          backgroundColor: theme === 'midnight' ? '#0f172a' : '#ffffff',
        });
        const link = document.createElement('a');
        link.download = `calendar-${format(currentDate, 'MMM-yyyy')}${ultraQuality ? '-ULTRA' : ''}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Failed to export poster', err);
      } finally {
        setIsExporting(false);
      }
    }, 150);
  };

  const currentMonthIndex = currentDate.getMonth();
  const heroImage = customImage || `${monthImages[currentMonthIndex]}?auto=format&fit=crop&w=1000&q=80`;

  const themeStyles = {
    zinc: { bg: 'bg-[#fafafa]', text: 'text-zinc-800', fill: 'text-[#fafafa]' },
    sepia: { bg: 'bg-[#f4ecd8]', text: 'text-[#4a3b32]', fill: 'text-[#f4ecd8]' },
    midnight: { bg: 'bg-slate-900', text: 'text-slate-100', fill: 'text-slate-900' }
  };
  const activeTheme = themeStyles[theme];

  return (
    <main className="w-screen h-screen overflow-hidden bg-zinc-200 flex items-center justify-center p-4 md:p-8 font-sans relative perspective-[2000px]">
      
      {/* Settings Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05, rotate: 90 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsSettingsOpen(true)}
        className="absolute top-6 left-6 z-40 p-3 bg-white/80 backdrop-blur-md shadow-lg rounded-full text-zinc-800 border border-white/40 hover:bg-white transition-colors"
      >
        <Settings2 className="w-6 h-6" />
      </motion.button>

      <PosterStudio 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        customImage={customImage}
        onImageChange={setCustomImage}
        fontStyle={fontStyle}
        onFontStyleChange={setFontStyle}
        theme={theme}
        onThemeChange={setTheme}
        ultraQuality={ultraQuality}
        onUltraQualityChange={setUltraQuality}
        isExporting={isExporting}
        onExport={exportPoster}
      />

      {/* --- THE POSTER --- */}
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={() => { mouseX.set(0); mouseY.set(0); }}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative w-full max-w-6xl h-full max-h-[900px] flex items-center justify-center cursor-default z-10"
      >
        <div ref={posterRef} className={`relative w-full h-full shadow-[0_40px_80px_rgba(0,0,0,0.4)] rounded-2xl flex flex-col xl:flex-row overflow-hidden ${fontStyle}`}>
          
          <div className="absolute top-[-4px] left-0 w-full flex justify-around px-8 z-40 pointer-events-none">
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="relative w-1.5 h-6 bg-gradient-to-b from-zinc-300 via-zinc-400 to-zinc-600 rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-zinc-900 rounded-full opacity-90" />
              </div>
            ))}
          </div>

          <div className="w-full xl:w-5/12 h-[45%] xl:h-full relative group overflow-hidden bg-black z-10 flex-shrink-0">
             <AnimatePresence mode="popLayout">
               <motion.img 
                 key={heroImage} initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 0.9, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}
                 src={heroImage} crossOrigin="anonymous" className="absolute inset-0 w-full h-full object-cover"
               />
             </AnimatePresence>
             <div className="absolute inset-0 bg-gradient-to-t xl:bg-gradient-to-r from-black/80 via-black/20 to-transparent flex flex-col justify-end xl:justify-center p-8 xl:p-12 z-10 pointer-events-none">
                <h1 className="text-white text-6xl xl:text-8xl font-black tracking-tighter uppercase drop-shadow-2xl">{format(currentDate, 'MMM')}</h1>
                <p className="text-white/90 text-2xl xl:text-3xl font-bold tracking-widest uppercase mt-2">{format(currentDate, 'yyyy')}</p>
             </div>
             <div className="absolute bottom-0 left-0 w-full h-[60px] xl:w-[60px] xl:h-full xl:bottom-auto xl:right-0 xl:left-auto z-20 pointer-events-none">
               <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className={`w-full h-full block xl:hidden translate-y-[1px] fill-current ${activeTheme.fill}`}><path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C73.69,32.35,159.5,45.8,244.33,54.89,270.63,57.7,296.2,59.34,321.39,56.44Z"></path></svg>
               <svg viewBox="0 0 120 1200" preserveAspectRatio="none" className={`w-full h-full hidden xl:block translate-x-[1px] fill-current ${activeTheme.fill}`}><path d="M56.44,878.61c-10.79-58-30.13-114.16-41.86-172-16.72-82.39-17.73-168.19-.39-250.45C31,376.22,72,293.33,92.83,214.34c18.48-70.05,26.09-146.53,3-214.34H120V1200H0C32.35,1126.31,45.8,1040.5,54.89,955.67,57.7,929.37,59.34,903.8,56.44,878.61Z"></path></svg>
             </div>
          </div>

          <div className={`w-full xl:w-7/12 flex-1 p-6 xl:p-12 flex flex-col perspective-1000 z-0 ${activeTheme.bg} ${activeTheme.text}`}>
             <div className="flex justify-between items-center mb-4 xl:mb-8 relative z-10">
               <h2 className="text-xl xl:text-3xl font-black uppercase tracking-widest text-inherit/60 pointer-events-none">Schedule</h2>
               <div className="flex gap-3 relative z-50">
                 <motion.button whileTap={{ scale: 0.85 }} onClick={prevMonth} className="p-2 rounded-full hover:bg-black/5 transition-colors"><ChevronLeft className="w-5 h-5" /></motion.button>
                 <motion.button whileTap={{ scale: 0.85 }} onClick={nextMonth} className="p-2 rounded-full hover:bg-black/5 transition-colors"><ChevronRight className="w-5 h-5" /></motion.button>
               </div>
             </div>
             <div className="flex-1 relative z-10 w-full min-h-0">
               <AnimatePresence custom={direction} mode="popLayout">
                 <motion.div
                   key={currentDate.toISOString()} custom={direction}
                   initial={{ rotateX: direction > 0 ? -90 : 90, opacity: 0, y: direction > 0 ? 50 : -50, transformOrigin: "top" }}
                   animate={{ rotateX: 0, opacity: 1, y: 0, transformOrigin: "top" }}
                   exit={{ rotateX: direction < 0 ? -90 : 90, opacity: 0, y: direction < 0 ? 50 : -50, transformOrigin: "top" }}
                   transition={{ type: "spring", stiffness: 100, damping: 15 }}
                   className="absolute inset-0 w-full h-full"
                 >
                   <CalendarGrid currentDate={currentDate} />
                 </motion.div>
               </AnimatePresence>
             </div>
          </div>

          <motion.div
            className="pointer-events-none absolute inset-0 z-40 opacity-50 mix-blend-overlay"
            style={{ background: "radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 60%)", left: glareX, top: glareY, transform: "translate(-50%, -50%)", width: "150%", height: "150%" }}
          />
          <div 
            className="pointer-events-none absolute inset-0 z-50 mix-blend-multiply opacity-[0.25]" 
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
          />
        </div>
      </motion.div>
    </main>
  );
}