"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Settings2, X } from 'lucide-react';
import { addMonths, subMonths, setMonth, setYear, format, getYear } from 'date-fns';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { toPng } from 'html-to-image';
import CalendarGrid from '@/components/CalendarGrid';
import PosterStudio from '@/components/PosterStudio'; 
import { audio } from '@/utils/audio';
import MusicPlayer from '@/components/MusicPlayer';

const monthImages = [
  "https://images.unsplash.com/photo-1445543949571-ffc3e0e2f55e", "https://images.unsplash.com/photo-1433162653888-a571f51cb86a",
  "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa", "https://images.unsplash.com/photo-1522748906645-95d8adfd52c7",
  "https://images.unsplash.com/photo-1476041800959-2f10d0590d93", "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
  "https://images.unsplash.com/photo-1501426026826-31c667bdf23d", "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",
  "https://images.unsplash.com/photo-1439853949127-fa647821eba0", "https://images.unsplash.com/photo-1509023464722-18d996393ca8",
  "https://images.unsplash.com/photo-1478147427282-58a87a120781", "https://images.unsplash.com/photo-1512389142860-9c449e58a543"
];

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function WallCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [direction, setDirection] = useState(1); 
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTimeWarpOpen, setIsTimeWarpOpen] = useState(false); 
  const [isExporting, setIsExporting] = useState(false);
  
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [fontStyle, setFontStyle] = useState<'font-sans' | 'font-serif' | 'font-mono'>('font-sans');
  const [theme, setTheme] = useState<'zinc' | 'sepia' | 'midnight'>('zinc');
  const [ultraQuality, setUltraQuality] = useState(false);

  const posterRef = useRef<HTMLDivElement>(null);

  // Audio-linked Navigation
  const nextMonth = () => { audio.playPaperFlip(); setDirection(1); setCurrentDate(prev => addMonths(prev, 1)); };
  const prevMonth = () => { audio.playPaperFlip(); setDirection(-1); setCurrentDate(prev => subMonths(prev, 1)); };

  // Keyboard Telemetry
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight') nextMonth();
      if (e.key === 'ArrowLeft') prevMonth();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Spatial Physics
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 150, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 20 });
  const rotateX = useTransform(springY, [-0.5, 0.5], ["3deg", "-3deg"]);
  const rotateY = useTransform(springX, [-0.5, 0.5], ["-3deg", "3deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const exportPoster = async () => {
    if (!posterRef.current) return;
    setIsExporting(true);
    audio.playShutter();
    mouseX.set(0); mouseY.set(0);
    
    setTimeout(async () => {
      try {
        const dataUrl = await toPng(posterRef.current!, { 
          quality: 1, pixelRatio: ultraQuality ? 4 : 2, backgroundColor: theme === 'midnight' ? '#0f172a' : '#ffffff',
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
  const currentYear = getYear(currentDate);
  const heroImage = customImage || `${monthImages[currentMonthIndex]}?auto=format&fit=crop&w=1000&q=80`;

  const themeStyles = {
    zinc: { bg: 'bg-[#fafafa]', text: 'text-zinc-800', fill: 'text-[#fafafa]' },
    sepia: { bg: 'bg-[#f4ecd8]', text: 'text-[#4a3b32]', fill: 'text-[#f4ecd8]' },
    midnight: { bg: 'bg-slate-900', text: 'text-slate-100', fill: 'text-slate-900' }
  };
  const activeTheme = themeStyles[theme];

  return (
    // REVERTED: Light zinc background
    <main className="w-screen h-screen overflow-hidden bg-zinc-200 flex items-center justify-center p-4 md:p-8 font-sans relative perspective-[2000px]">
      
      {/* REVERTED: White Glassmorphism Settings Button */}
      <motion.button
        whileHover={{ scale: 1.05, rotate: 90 }} whileTap={{ scale: 0.95 }} 
        onClick={() => { audio.playClick(); setIsSettingsOpen(true); }}
        className="absolute top-6 left-6 z-40 p-3 bg-white/80 backdrop-blur-md shadow-lg rounded-full text-zinc-800 border border-white/40 hover:bg-white transition-colors"
      >
        <Settings2 className="w-6 h-6" />
      </motion.button>

      <PosterStudio 
        isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}
        customImage={customImage} onImageChange={setCustomImage}
        fontStyle={fontStyle} onFontStyleChange={setFontStyle}
        theme={theme} onThemeChange={setTheme}
        ultraQuality={ultraQuality} onUltraQualityChange={setUltraQuality}
        isExporting={isExporting} onExport={exportPoster}
      />

      {/* 3D Spatial Wrapper */}
      <motion.div
        onMouseMove={handleMouseMove} onMouseLeave={() => { mouseX.set(0); mouseY.set(0); }}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative w-full max-w-6xl h-full max-h-[900px] flex items-center justify-center cursor-default z-10"
      >
        {/* THE EXPORTABLE POSTER (Clean edges, no clip!) */}
        <div 
          ref={posterRef} 
          style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.7) inset, 0 40px 80px -20px rgba(0,0,0,0.4)" }}
          className={`relative w-full h-full rounded-2xl flex flex-col xl:flex-row overflow-hidden ${fontStyle} bg-white`}
        >
          {/* --- HERO IMAGE (Glossy, No Texture, HD) --- */}
          <div className="w-full xl:w-5/12 h-[45%] xl:h-full relative group overflow-hidden bg-black z-10 flex-shrink-0">
             <AnimatePresence mode="popLayout">
               <motion.img 
                 key={heroImage} initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 0.9, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}
                 src={heroImage} crossOrigin="anonymous" className="absolute inset-0 w-full h-full object-cover"
               />
             </AnimatePresence>
             
             {/* Text Gradient Overlay (Just enough to read the white text) */}
             <div className="absolute inset-0 bg-gradient-to-t xl:bg-gradient-to-r from-black/60 via-black/10 to-transparent flex flex-col justify-end xl:justify-center p-8 xl:p-12 z-10 pointer-events-none">
                <motion.div 
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { audio.playClick(); setIsTimeWarpOpen(true); }}
                  className="pointer-events-auto cursor-pointer inline-block group/warp"
                >
                  <h1 className="text-white text-6xl xl:text-8xl font-black tracking-tighter uppercase drop-shadow-xl group-hover/warp:text-amber-200 transition-colors">
                    {format(currentDate, 'MMM')}
                  </h1>
                  <div className="flex items-center gap-3">
                    <p className="text-white/90 text-2xl xl:text-3xl font-bold tracking-widest uppercase mt-2 group-hover/warp:text-amber-200/80 transition-colors">
                      {format(currentDate, 'yyyy')}
                    </p>
                  </div>
                </motion.div>
             </div>

             {/* Time Warp Overlay */}
             <AnimatePresence>
               {isTimeWarpOpen && (
                 <motion.div 
                   initial={{ opacity: 0, backdropFilter: "blur(0px)" }} animate={{ opacity: 1, backdropFilter: "blur(16px)" }} exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                   className="absolute inset-0 z-30 bg-black/60 flex flex-col items-center justify-center p-8 pointer-events-auto"
                 >
                   <button onClick={() => { audio.playClick(); setIsTimeWarpOpen(false); }} className="absolute top-6 right-6 p-2 text-white/50 hover:text-white bg-black/20 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                   <div className="flex items-center gap-4 mb-8">
                     <button onClick={() => { audio.playClick(); setCurrentDate(setYear(currentDate, currentYear - 1)); }} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full"><ChevronLeft /></button>
                     <span className="text-4xl font-bold text-white tracking-widest">{currentYear}</span>
                     <button onClick={() => { audio.playClick(); setCurrentDate(setYear(currentDate, currentYear + 1)); }} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full"><ChevronRight /></button>
                   </div>
                   <div className="grid grid-cols-3 gap-3 w-full max-w-[300px]">
                     {MONTH_NAMES.map((m, idx) => (
                       <button
                         key={m}
                         onClick={() => { audio.playPaperFlip(); setCurrentDate(setMonth(currentDate, idx)); setIsTimeWarpOpen(false); }}
                         className={`py-3 rounded-xl font-bold text-sm tracking-wider uppercase transition-all ${currentMonthIndex === idx ? 'bg-amber-400 text-black shadow-[0_0_20px_rgba(251,191,36,0.4)]' : 'bg-white/10 text-white hover:bg-white/20'}`}
                       >
                         {m}
                       </button>
                     ))}
                   </div>
                 </motion.div>
               )}
             </AnimatePresence>

             {/* Wave Separator */}
             <div className="absolute bottom-0 left-0 w-full h-[60px] xl:w-[60px] xl:h-full xl:bottom-auto xl:right-0 xl:left-auto z-20 pointer-events-none">
               <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className={`w-full h-full block xl:hidden translate-y-[1px] fill-current ${activeTheme.fill}`}><path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C73.69,32.35,159.5,45.8,244.33,54.89,270.63,57.7,296.2,59.34,321.39,56.44Z"></path></svg>
               <svg viewBox="0 0 120 1200" preserveAspectRatio="none" className={`w-full h-full hidden xl:block translate-x-[1px] fill-current ${activeTheme.fill}`}><path d="M56.44,878.61c-10.79-58-30.13-114.16-41.86-172-16.72-82.39-17.73-168.19-.39-250.45C31,376.22,72,293.33,92.83,214.34c18.48-70.05,26.09-146.53,3-214.34H120V1200H0C32.35,1126.31,45.8,1040.5,54.89,955.67,57.7,929.37,59.34,903.8,56.44,878.61Z"></path></svg>
             </div>
          </div>

          {/* --- CALENDAR GRID (Texture is safely isolated here!) --- */}
          <div className={`w-full xl:w-7/12 flex-1 p-6 xl:p-12 flex flex-col perspective-1000 z-0 relative overflow-hidden ${activeTheme.bg} ${activeTheme.text}`}>
             
             {/* The Paper Noise Mask */}
             <div 
               className="pointer-events-none absolute inset-0 z-0 mix-blend-multiply opacity-[0.35]" 
               style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
             />

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
        </div>
      </motion.div>
      <MusicPlayer />
    </main>
  );
}