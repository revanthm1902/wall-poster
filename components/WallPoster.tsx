"use client";

import React, { useRef, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { setMonth, setYear, format, getYear } from 'date-fns';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { toPng } from 'html-to-image';
import CalendarGrid from '@/components/CalendarGrid';
import { audio } from '@/utils/audio';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ─── DESKTOP SIDE WAVE ───
const WAVE_PATH = "M56.44,878.61c-10.79-58-30.13-114.16-41.86-172-16.72-82.39-17.73-168.19-.39-250.45C31,376.22,72,293.33,92.83,214.34c18.48-70.05,26.09-146.53,3-214.34H120V1200H0C32.35,1126.31,45.8,1040.5,54.89,955.67,57.7,929.37,59.34,903.8,56.44,878.61Z";
const WAVE_MASK = `url("data:image/svg+xml,%3Csvg viewBox='0 0 120 1200' preserveAspectRatio='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='${WAVE_PATH}' fill='black'/%3E%3C/svg%3E")`;

// ─── MOBILE HORIZONTAL WAVE ───
const H_WAVE_PATH = "M0,120 V56.4 C100,30 180,90 280,60 C380,30 450,10 550,25 C650,40 700,90 800,85 C900,80 1000,40 1200,50 V120 Z";
const H_WAVE_MASK = `url("data:image/svg+xml,%3Csvg viewBox='0 0 1200 120' preserveAspectRatio='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='${H_WAVE_PATH}' fill='black'/%3E%3C/svg%3E")`;

const NOISE_BG = 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")';

export interface ThemeStyle {
  bg: string;
  text: string;
  fill: string;
  bgColorHex: string;
}

export interface WallPosterHandle {
  exportPoster: () => Promise<void>;
}

interface WallPosterProps {
  currentDate: Date;
  direction: number;
  activeTheme: ThemeStyle;
  fontStyle: string;
  heroImage: string;
  isTimeWarpOpen: boolean;
  onTimeWarpToggle: (open: boolean) => void;
  onDateChange: (date: Date) => void;
  nextMonth: () => void;
  prevMonth: () => void;
  isExporting: boolean;
  onExportStateChange: (exporting: boolean) => void;
  ultraQuality: boolean;
}

const WallPoster = forwardRef<WallPosterHandle, WallPosterProps>(({
  currentDate, direction, activeTheme, fontStyle, heroImage,
  isTimeWarpOpen, onTimeWarpToggle, onDateChange,
  nextMonth, prevMonth, onExportStateChange, ultraQuality
}, ref) => {
  const posterRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 120, damping: 22 });
  const springY = useSpring(mouseY, { stiffness: 120, damping: 22 });
  const rotateX = useTransform(springY, [-0.5, 0.5], ["3deg", "-3deg"]);
  const rotateY = useTransform(springX, [-0.5, 0.5], ["-3deg", "3deg"]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia("(pointer: coarse)").matches) return; 
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }, [mouseX, mouseY]);

  const resetMouse = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  const exportPoster = useCallback(async () => {
    if (!posterRef.current) return;
    onExportStateChange(true);
    audio.playShutter();
    resetMouse();

    setTimeout(async () => {
      try {
        const dataUrl = await toPng(posterRef.current!, {
          quality: 1,
          pixelRatio: ultraQuality ? 4 : 2,
          backgroundColor: activeTheme.bgColorHex,
        });
        const link = document.createElement('a');
        link.download = `calendar-${format(currentDate, 'MMM-yyyy')}${ultraQuality ? '-ULTRA' : ''}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Failed to export poster', err);
      } finally {
        onExportStateChange(false);
      }
    }, 150);
  }, [ultraQuality, activeTheme.bgColorHex, currentDate, resetMouse, onExportStateChange]);

  useImperativeHandle(ref, () => ({ exportPoster }), [exportPoster]);

  const currentMonthIndex = currentDate.getMonth();
  const currentYear = useMemo(() => getYear(currentDate), [currentDate]);

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={resetMouse}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", willChange: "transform" }}
      initial={{ y: "-120vh", opacity: 0, rotateZ: 2 }}
      animate={{ y: 0, opacity: 1, rotateZ: 0 }}
      transition={{ type: "spring", stiffness: 38, damping: 16, mass: 1.8, delay: 0.1 }}
      className="relative w-full max-w-6xl h-full max-h-212.5 flex items-center justify-center cursor-default z-10"
    >
      {/* ROPES FIX: Moved entirely outside the poster's clipping mask. z-30 guarantees they are perfectly on top! */}
      <div className="absolute bottom-[calc(100%-36px)] left-[30%] -translate-x-1/2 w-2 h-500 rope-texture rope-sway-1 z-30" />
      <div className="absolute bottom-[calc(100%-36px)] left-[70%] -translate-x-1/2 w-2 h-500 rope-texture rope-sway-2 z-30" />

      {/* POSTER FRAME */}
      <div
        ref={posterRef}
        role="region"
        aria-label="Calendar poster"
        style={{
          boxShadow: "0 0 0 1px rgba(255,255,255,0.7) inset, 0 40px 80px -20px rgba(0,0,0,0.6)",
          backgroundColor: activeTheme.bgColorHex,
        }}
        className={`relative w-full h-full rounded-2xl flex flex-col lg:flex-row overflow-hidden ${fontStyle} z-20`}
      >
        {/* PINS FIX: z-40 guarantees the pins sit on top of the ropes */}
        <div className="absolute top-4 lg:top-6 left-[30%] -translate-x-1/2 w-5 h-5 lg:w-6 lg:h-6 bg-[#0a0a0a] rounded-full shadow-[inset_0_4px_8px_rgba(0,0,0,1)] z-40 flex items-center justify-center border border-white/10">
          <div className="w-3 h-3 lg:w-3.5 lg:h-3.5 rounded-full rope-texture shadow-[0_3px_5px_rgba(0,0,0,0.8)] rotate-45 translate-y-0.5" />
        </div>
        <div className="absolute top-4 lg:top-6 left-[70%] -translate-x-1/2 w-5 h-5 lg:w-6 lg:h-6 bg-[#0a0a0a] rounded-full shadow-[inset_0_4px_8px_rgba(0,0,0,1)] z-40 flex items-center justify-center border border-white/10">
          <div className="w-3 h-3 lg:w-3.5 lg:h-3.5 rounded-full rope-texture shadow-[0_3px_5px_rgba(0,0,0,0.8)] rotate-65 translate-y-0.5" />
        </div>

        {/* ─── HERO IMAGE PANEL ──── */}
        <div className="w-full lg:w-5/12 h-[45%] lg:h-full relative group overflow-hidden bg-black z-0 shrink-0 pb-12 lg:pb-0">
          <AnimatePresence mode="popLayout">
            <motion.img
              key={heroImage}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 0.9, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
              src={heroImage}
              crossOrigin="anonymous"
              alt={`${format(currentDate, 'MMMM yyyy')} calendar image`}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </AnimatePresence>

          <div className="absolute inset-0 bg-linear-to-t lg:bg-linear-to-r from-black/70 via-black/20 to-transparent flex flex-col justify-end lg:justify-center p-6 lg:p-10 z-10 pointer-events-none">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { audio.playClick(); onTimeWarpToggle(true); }}
              className="pointer-events-auto cursor-pointer inline-block group/warp mb-4 lg:mb-0"
            >
              <h1 className="text-white text-5xl lg:text-7xl xl:text-8xl font-black tracking-tighter uppercase drop-shadow-xl group-hover/warp:text-amber-200 transition-colors duration-200">
                {format(currentDate, 'MMM')}
              </h1>
              <div className="flex items-center gap-3">
                <p className="text-white/90 text-xl lg:text-2xl xl:text-3xl font-bold tracking-widest uppercase mt-1 lg:mt-2 group-hover/warp:text-amber-200/80 transition-colors duration-200">
                  {format(currentDate, 'yyyy')}
                </p>
              </div>
            </motion.div>
          </div>

          <AnimatePresence>
            {isTimeWarpOpen && (
              <motion.div
                initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                animate={{ opacity: 1, backdropFilter: "blur(16px)" }}
                exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                className="absolute inset-0 z-30 bg-black/60 flex flex-col items-center justify-center p-6 pointer-events-auto"
              >
                <button
                  onClick={() => { audio.playClick(); onTimeWarpToggle(false); }}
                  className="absolute top-4 right-4 p-2 text-white/50 hover:text-white bg-black/20 rounded-full transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-4 mb-6">
                  <button onClick={() => { audio.playClick(); onDateChange(setYear(currentDate, currentYear - 1)); }} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all duration-150"><ChevronLeft /></button>
                  <span className="text-3xl lg:text-4xl font-bold text-white tracking-widest">{currentYear}</span>
                  <button onClick={() => { audio.playClick(); onDateChange(setYear(currentDate, currentYear + 1)); }} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all duration-150"><ChevronRight /></button>
                </div>
                <div className="grid grid-cols-3 gap-2 w-full max-w-70">
                  {MONTH_NAMES.map((m, idx) => (
                    <button
                      key={m}
                      onClick={() => { audio.playPaperFlip(); onDateChange(setMonth(currentDate, idx)); onTimeWarpToggle(false); }}
                      className={`py-2.5 rounded-lg font-bold text-xs tracking-wider uppercase transition-all duration-200 ${currentMonthIndex === idx ? 'bg-amber-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.4)]' : 'bg-white/10 text-white hover:bg-white/20'}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ─── CALENDAR GRID PANEL ──── */}
        {/* WAVE FIX: Calendar wrapper handles layout, NO overflow-hidden applied here so waves don't get cut off! */}
        <div className={`w-full lg:w-7/12 flex-1 relative flex flex-col z-20 -mt-10 lg:mt-0 ${activeTheme.text}`}>
          
          {/* THE LAYERED BACKGROUND: Absolutely positioned so waves stick out freely */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            
            {/* Desktop Wave Separator (Vertical) */}
            <div className="absolute top-0 right-[99%] w-20 xl:w-30 h-full hidden lg:block">
              <svg viewBox="0 0 120 1200" preserveAspectRatio="none" className={`w-full h-full fill-current ${activeTheme.fill}`}><path d={WAVE_PATH} /></svg>
              <div className="absolute inset-0 mix-blend-multiply opacity-[0.35]" style={{ backgroundImage: NOISE_BG, maskImage: WAVE_MASK, WebkitMaskImage: WAVE_MASK, maskSize: '100% 100%', WebkitMaskSize: '100% 100%' }} />
            </div>

            {/* Mobile Wave Separator (Horizontal) */}
            <div className="absolute bottom-[99%] left-0 w-full h-10 lg:hidden drop-shadow-[0_-5px_15px_rgba(0,0,0,0.5)]">
              <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className={`w-full h-full fill-current ${activeTheme.fill}`}><path d={H_WAVE_PATH} /></svg>
              <div className="absolute inset-0 mix-blend-multiply opacity-[0.35]" style={{ backgroundImage: NOISE_BG, maskImage: H_WAVE_MASK, WebkitMaskImage: H_WAVE_MASK, maskSize: '100% 100%', WebkitMaskSize: '100% 100%' }} />
            </div>

            {/* Base Fill & Global Noise */}
            <div className={`absolute inset-0 ${activeTheme.bg}`} />
            <div className="absolute inset-0 mix-blend-multiply opacity-[0.35]" style={{ backgroundImage: NOISE_BG }} />
          </div>

          {/* THE LAYERED CONTENT: Safely inside with its own scrollbar */}
          <div className="relative z-10 flex-1 flex flex-col p-5 lg:p-8 xl:p-10 overflow-y-auto lg:overflow-hidden scrollbar-hide">
            <div className="flex justify-between items-center mb-4 lg:mb-6 relative z-20">
              <h2 className="text-xl lg:text-2xl font-black uppercase tracking-widest text-inherit/60 pointer-events-none">Wall Poster</h2>
              <div className="flex gap-2 lg:gap-3 relative z-50">
                <motion.button whileTap={{ scale: 0.85 }} onClick={prevMonth} className="p-1.5 lg:p-2 rounded-full hover:bg-black/5 transition-all duration-150">
                  <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6" />
                </motion.button>
                <motion.button whileTap={{ scale: 0.85 }} onClick={nextMonth} className="p-1.5 lg:p-2 rounded-full hover:bg-black/5 transition-all duration-150">
                  <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6" />
                </motion.button>
              </div>
            </div>

            <div className="flex-1 relative z-20 w-full min-h-0 pb-10 lg:pb-0" style={{ willChange: "transform" }}>
              <AnimatePresence custom={direction} mode="wait">
                <motion.div
                  key={currentDate.toISOString()} custom={direction}
                  initial={{ rotateY: direction > 0 ? 90 : -90, opacity: 0, scale: 0.95 }}
                  animate={{ rotateY: 0, opacity: 1, scale: 1 }}
                  exit={{ rotateY: direction < 0 ? 90 : -90, opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                  style={{ transformOrigin: direction > 0 ? "left center" : "right center" }}
                  className="absolute inset-0 w-full h-full"
                >
                  <CalendarGrid currentDate={currentDate} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
});

WallPoster.displayName = 'WallPoster';
export default WallPoster;