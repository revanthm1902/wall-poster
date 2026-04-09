"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Settings2, X } from 'lucide-react';
import { addMonths, subMonths, setMonth, setYear, format, getYear } from 'date-fns';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { toPng } from 'html-to-image';
import CalendarGrid from '@/components/CalendarGrid';
import PosterStudio, { ThemeType } from '@/components/PosterStudio'; 
import MusicPlayer from '@/components/MusicPlayer';
import { audio } from '@/utils/audio';

const monthImages = [
  "/months/jan.png", "/months/feb.png", "/months/mar.png", "/months/apr.png",
  "/months/may.png", "/months/jun.png", "/months/jul.png", "/months/aug.png",
  "/months/sep.png", "/months/oct.png", "/months/nov.png", "/months/dec.png"
];

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// --- THE AESTHETIC LOADER COMPONENT ---
const LoadingScreen = () => (
  <motion.div 
    key="loader"
    initial={{ opacity: 1 }}
    exit={{ opacity: 0, filter: "blur(10px)" }}
    transition={{ duration: 1, ease: "easeInOut" }}
    className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0a0a] text-white"
  >
    <div className="flex flex-col items-center gap-8">
      {/* Abstract Spinning Ring */}
      <div className="relative flex items-center justify-center w-20 h-20">
        <motion.div 
          animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border-[1px] border-zinc-800 border-t-amber-500 rounded-full"
        />
        <motion.div 
          animate={{ rotate: -360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute inset-2 border-[1px] border-zinc-800 border-b-zinc-500 rounded-full opacity-50"
        />
      </div>
      
      {/* Typography & Progress Line */}
      <div className="flex flex-col items-center gap-3">
        <h2 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-400">
          Loading Your Wall Poster
        </h2>
        <motion.div 
          initial={{ width: 0, opacity: 0 }} 
          animate={{ width: "100%", opacity: 1 }} 
          transition={{ duration: 3, ease: "easeInOut" }}
          className="h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent w-full max-w-[150px]"
        />
      </div>
    </div>
  </motion.div>
);

export default function WallCalendar() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [direction, setDirection] = useState(1); 
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTimeWarpOpen, setIsTimeWarpOpen] = useState(false); 
  const [isExporting, setIsExporting] = useState(false);
  
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [fontStyle, setFontStyle] = useState<'font-sans' | 'font-serif' | 'font-mono'>('font-sans');
  const [theme, setTheme] = useState<ThemeType>('zinc');
  const [ultraQuality, setUltraQuality] = useState(false);

  const posterRef = useRef<HTMLDivElement>(null);

  // --- THE MASTER ASSET PRELOADER ---
  useEffect(() => {
    // 1. Minimum 3-second aesthetic timer
    const minTimer = new Promise(resolve => setTimeout(resolve, 3000));

    // 2. Heavy Asset Downloader
    const loadAssets = async () => {
      const imagePromises = monthImages.map(src => {
        return new Promise(resolve => {
          const img = new window.Image();
          img.src = src;
          img.onload = resolve;
          img.onerror = resolve; // Resolve on error so app doesn't hang forever if 1 image fails
        });
      });

      const videoPromise = new Promise(resolve => {
        const vid = document.createElement('video');
        vid.src = "/video.mp4";
        vid.onloadeddata = resolve;
        vid.onerror = resolve;
        vid.load();
      });

      await Promise.all([...imagePromises, videoPromise]);
    };

    // 3. Race condition: Wait for BOTH the 3 seconds AND the heavy downloads to finish
    Promise.all([minTimer, loadAssets()]).then(() => {
      setIsLoading(false);
    });
  }, []);

  const nextMonth = () => { audio.playPaperFlip(); setDirection(1); setCurrentDate(prev => addMonths(prev, 1)); };
  const prevMonth = () => { audio.playPaperFlip(); setDirection(-1); setCurrentDate(prev => subMonths(prev, 1)); };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSettingsOpen(false);
        setIsTimeWarpOpen(false);
        return;
      }
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight') nextMonth();
      if (e.key === 'ArrowLeft') prevMonth();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
          quality: 1, pixelRatio: ultraQuality ? 4 : 2, backgroundColor: themeStyles[theme].bgColorHex,
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
  const heroImage = customImage || monthImages[currentMonthIndex];

  const themeStyles = {
    zinc: { bg: 'bg-[#fafafa]', text: 'text-zinc-800', fill: 'text-[#fafafa]', bgColorHex: '#fafafa' },
    sepia: { bg: 'bg-[#f4ecd8]', text: 'text-[#4a3b32]', fill: 'text-[#f4ecd8]', bgColorHex: '#f4ecd8' },
    midnight: { bg: 'bg-slate-900', text: 'text-slate-100', fill: 'text-slate-900', bgColorHex: '#0f172a' },
    emerald: { bg: 'bg-[#ecfdf5]', text: 'text-emerald-900', fill: 'text-[#ecfdf5]', bgColorHex: '#ecfdf5' },
    rose: { bg: 'bg-[#fff1f2]', text: 'text-rose-900', fill: 'text-[#fff1f2]', bgColorHex: '#fff1f2' },   
    lavender: { bg: 'bg-[#faf5ff]', text: 'text-purple-900', fill: 'text-[#faf5ff]', bgColorHex: '#faf5ff' }
  };
  const activeTheme = themeStyles[theme];
  const wavePath = "M56.44,878.61c-10.79-58-30.13-114.16-41.86-172-16.72-82.39-17.73-168.19-.39-250.45C31,376.22,72,293.33,92.83,214.34c18.48-70.05,26.09-146.53,3-214.34H120V1200H0C32.35,1126.31,45.8,1040.5,54.89,955.67,57.7,929.37,59.34,903.8,56.44,878.61Z";
  const waveMaskImage = `url("data:image/svg+xml,%3Csvg viewBox='0 0 120 1200' preserveAspectRatio='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='${wavePath}' fill='black'/%3E%3C/svg%3E")`;

  return (
    <>
      {/* THE LOADING GATE */}
      <AnimatePresence mode="wait">
        {isLoading && <LoadingScreen />}
      </AnimatePresence>

      {/* THE MAIN APP (Rendered underneath, but hidden until loader exits) */}
      <main className="w-screen h-screen overflow-hidden bg-black flex items-center justify-center p-4 md:p-8 font-sans relative perspective-[2000px]">
        
        <style dangerouslySetInnerHTML={{__html: `
          .rope-texture { background-color: #cda47b; background-image: repeating-linear-gradient(-45deg, transparent, transparent 2px, rgba(0,0,0,0.25) 2px, rgba(0,0,0,0.25) 4px); box-shadow: inset 2px 0 3px rgba(0,0,0,0.6), inset -1px 0 2px rgba(255,255,255,0.3); }
          @keyframes sway1 { 0%, 100% { transform: rotate(-1deg); } 50% { transform: rotate(1deg); } }
          @keyframes sway2 { 0%, 100% { transform: rotate(0.8deg); } 50% { transform: rotate(-1.2deg); } }
          .rope-sway-1 { transform-origin: bottom center; animation: sway1 4s ease-in-out infinite; }
          .rope-sway-2 { transform-origin: bottom center; animation: sway2 4.5s ease-in-out infinite 0.5s; }
        `}} />

        <video src="/video.mp4" autoPlay loop={true} muted playsInline className="absolute inset-0 w-full h-full object-cover z-0 opacity-40 blur-[3px]" />

        <motion.button
          whileHover={{ scale: 1.05, rotate: 90 }} whileTap={{ scale: 0.95 }} onClick={() => { audio.playClick(); setIsSettingsOpen(true); }}
          className="absolute top-6 left-6 z-40 p-3 bg-white/80 backdrop-blur-md shadow-lg rounded-full text-zinc-800 border border-white/40 hover:bg-white transition-colors"
        >
          <Settings2 className="w-6 h-6" />
        </motion.button>

        <PosterStudio 
          isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} customImage={customImage} onImageChange={setCustomImage}
          fontStyle={fontStyle} onFontStyleChange={setFontStyle} theme={theme} onThemeChange={setTheme}
          ultraQuality={ultraQuality} onUltraQualityChange={setUltraQuality} isExporting={isExporting} onExport={exportPoster}
        />

        <motion.div
          onMouseMove={handleMouseMove} onMouseLeave={() => { mouseX.set(0); mouseY.set(0); }}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="relative w-full max-w-6xl h-full max-h-[900px] flex items-center justify-center cursor-default z-10"
        >
          
          <div className="absolute bottom-[calc(100%-24px)] left-[30%] -translate-x-1/2 w-2 h-[2000px] rope-texture rope-sway-1 z-20" />
          <div className="absolute bottom-[calc(100%-24px)] left-[70%] -translate-x-1/2 w-2 h-[2000px] rope-texture rope-sway-2 z-20" />

          <div ref={posterRef} style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.7) inset, 0 40px 80px -20px rgba(0,0,0,0.6)", backgroundColor: activeTheme.bgColorHex }} className={`relative w-full h-full rounded-2xl flex flex-col xl:flex-row overflow-hidden ${fontStyle}`}>
            
            <div className="absolute top-6 left-[30%] -translate-x-1/2 w-6 h-6 bg-[#0a0a0a] rounded-full shadow-[inset_0_4px_8px_rgba(0,0,0,1)] z-30 flex items-center justify-center border border-white/10">
               <div className="w-3.5 h-3.5 rounded-full rope-texture shadow-[0_3px_5px_rgba(0,0,0,0.8)] rotate-45 translate-y-[2px]" />
            </div>
            <div className="absolute top-6 left-[70%] -translate-x-1/2 w-6 h-6 bg-[#0a0a0a] rounded-full shadow-[inset_0_4px_8px_rgba(0,0,0,1)] z-30 flex items-center justify-center border border-white/10">
               <div className="w-3.5 h-3.5 rounded-full rope-texture shadow-[0_3px_5px_rgba(0,0,0,0.8)] rotate-[65deg] translate-y-[2px]" />
            </div>

            <div className="w-full xl:w-5/12 h-[45%] xl:h-full relative group overflow-hidden bg-black z-0 flex-shrink-0">
               <AnimatePresence mode="popLayout">
                 <motion.img key={heroImage} initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 0.9, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }} src={heroImage} crossOrigin="anonymous" className="absolute inset-0 w-full h-full object-cover" />
               </AnimatePresence>
               <div className="absolute inset-0 bg-gradient-to-t xl:bg-gradient-to-r from-black/60 via-black/10 to-transparent flex flex-col justify-end xl:justify-center p-8 xl:p-12 z-10 pointer-events-none">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { audio.playClick(); setIsTimeWarpOpen(true); }} className="pointer-events-auto cursor-pointer inline-block group/warp">
                    <h1 className="text-white text-6xl xl:text-8xl font-black tracking-tighter uppercase drop-shadow-xl group-hover/warp:text-amber-200 transition-colors">{format(currentDate, 'MMM')}</h1>
                    <div className="flex items-center gap-3">
                      <p className="text-white/90 text-2xl xl:text-3xl font-bold tracking-widest uppercase mt-2 group-hover/warp:text-amber-200/80 transition-colors">{format(currentDate, 'yyyy')}</p>
                    </div>
                  </motion.div>
               </div>
               <AnimatePresence>
                 {isTimeWarpOpen && (
                   <motion.div initial={{ opacity: 0, backdropFilter: "blur(0px)" }} animate={{ opacity: 1, backdropFilter: "blur(16px)" }} exit={{ opacity: 0, backdropFilter: "blur(0px)" }} className="absolute inset-0 z-30 bg-black/60 flex flex-col items-center justify-center p-8 pointer-events-auto">
                     <button onClick={() => { audio.playClick(); setIsTimeWarpOpen(false); }} className="absolute top-6 right-6 p-2 text-white/50 hover:text-white bg-black/20 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                     <div className="flex items-center gap-4 mb-8">
                       <button onClick={() => { audio.playClick(); setCurrentDate(setYear(currentDate, currentYear - 1)); }} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full"><ChevronLeft /></button>
                       <span className="text-4xl font-bold text-white tracking-widest">{currentYear}</span>
                       <button onClick={() => { audio.playClick(); setCurrentDate(setYear(currentDate, currentYear + 1)); }} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full"><ChevronRight /></button>
                     </div>
                     <div className="grid grid-cols-3 gap-3 w-full max-w-[300px]">
                       {MONTH_NAMES.map((m, idx) => (
                         <button key={m} onClick={() => { audio.playPaperFlip(); setCurrentDate(setMonth(currentDate, idx)); setIsTimeWarpOpen(false); }} className={`py-3 rounded-xl font-bold text-sm tracking-wider uppercase transition-all ${currentMonthIndex === idx ? 'bg-amber-400 text-black shadow-[0_0_20px_rgba(251,191,36,0.4)]' : 'bg-white/10 text-white hover:bg-white/20'}`}>{m}</button>
                       ))}
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>

            <div className={`w-full xl:w-7/12 flex-1 relative flex flex-col p-6 xl:p-12 perspective-1000 z-10 ${activeTheme.bg} ${activeTheme.text}`}>
               <div className="absolute top-0 right-full w-[60px] xl:w-[120px] h-full hidden xl:block z-0 pointer-events-none">
                 <svg viewBox="0 0 120 1200" preserveAspectRatio="none" className={`w-full h-full fill-current ${activeTheme.fill}`}><path d={wavePath} /></svg>
                 <div className="absolute inset-0 mix-blend-multiply opacity-[0.35]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")', maskImage: waveMaskImage, WebkitMaskImage: waveMaskImage, maskSize: '100% 100%', WebkitMaskSize: '100% 100%' }} />
               </div>
               <div className="pointer-events-none absolute inset-0 z-0 mix-blend-multiply opacity-[0.35]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />

               <div className="flex justify-between items-center mb-4 xl:mb-8 relative z-20">
                 <h2 className="text-xl xl:text-3xl font-black uppercase tracking-widest text-inherit/60 pointer-events-none">Wall Poster</h2>
                 <div className="flex gap-3 relative z-50">
                   <motion.button whileTap={{ scale: 0.85 }} onClick={prevMonth} className="p-2 rounded-full hover:bg-black/5 transition-colors"><ChevronLeft className="w-5 h-5" /></motion.button>
                   <motion.button whileTap={{ scale: 0.85 }} onClick={nextMonth} className="p-2 rounded-full hover:bg-black/5 transition-colors"><ChevronRight className="w-5 h-5" /></motion.button>
                 </div>
               </div>
               
               <div className="flex-1 relative z-20 w-full min-h-0">
                 <AnimatePresence custom={direction} mode="wait">
                   <motion.div
                     key={currentDate.toISOString()} custom={direction}
                     initial={{ rotateY: direction > 0 ? 90 : -90, opacity: 0, scale: 0.95 }}
                     animate={{ rotateY: 0, opacity: 1, scale: 1 }}
                     exit={{ rotateY: direction < 0 ? 90 : -90, opacity: 0, scale: 0.95 }}
                     transition={{ duration: 0.35, ease: "easeInOut" }}
                     style={{ transformOrigin: direction > 0 ? "left center" : "right center" }}
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
    </>
  );
}