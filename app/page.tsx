"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Settings2 } from 'lucide-react';
import { addMonths, subMonths } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import WallPoster, { WallPosterHandle, ThemeStyle } from '@/components/WallPoster';
import PosterStudio, { ThemeType } from '@/components/PosterStudio';
import MusicPlayer from '@/components/MusicPlayer';
import { audio } from '@/utils/audio';

const monthImages = [
  "/months/jan.png", "/months/feb.png", "/months/mar.png", "/months/apr.png",
  "/months/may.png", "/months/jun.png", "/months/jul.png", "/months/aug.png",
  "/months/sep.png", "/months/oct.png", "/months/nov.png", "/months/dec.png"
];

const NOISE_BG = 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")';

const THEME_STYLES: Record<ThemeType, ThemeStyle> = {
  zinc: { bg: 'bg-[#fafafa]', text: 'text-zinc-800', fill: 'text-[#fafafa]', bgColorHex: '#fafafa' },
  sepia: { bg: 'bg-[#f4ecd8]', text: 'text-[#4a3b32]', fill: 'text-[#f4ecd8]', bgColorHex: '#f4ecd8' },
  midnight: { bg: 'bg-slate-900', text: 'text-slate-100', fill: 'text-slate-900', bgColorHex: '#0f172a' },
  emerald: { bg: 'bg-[#ecfdf5]', text: 'text-emerald-900', fill: 'text-[#ecfdf5]', bgColorHex: '#ecfdf5' },
  rose: { bg: 'bg-[#fff1f2]', text: 'text-rose-900', fill: 'text-[#fff1f2]', bgColorHex: '#fff1f2' },
  lavender: { bg: 'bg-[#faf5ff]', text: 'text-purple-900', fill: 'text-[#faf5ff]', bgColorHex: '#faf5ff' },
};

const AestheticLoader = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 3000;
    const startTime = performance.now();

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const p = Math.min(elapsed / duration, 1);
      const easeProgress = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      setProgress(easeProgress * 100);
      if (p < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, []);

  return (
    <motion.div
      key="loader"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
      className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-[#050505] text-white overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-[0.12] mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: NOISE_BG }}
      />
      <div className="relative z-10 flex flex-col items-center gap-6">
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <h1 className="text-sm md:text-base font-serif italic tracking-[0.3em] text-zinc-300 font-light">
            Preparing your Wall...
          </h1>
        </motion.div>
        <div className="w-40 h-px bg-zinc-800 overflow-hidden">
          <motion.div className="h-full bg-zinc-300" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </motion.div>
  );
};

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

  const wallPosterRef = useRef<WallPosterHandle>(null);

  useEffect(() => {
    const savedCustomImage = localStorage.getItem('wall_cal_custom_image');
    if (savedCustomImage) setCustomImage(savedCustomImage);
  }, []);

  useEffect(() => {
    if (customImage) {
      try {
        localStorage.setItem('wall_cal_custom_image', customImage);
      } catch {
        console.error("Storage full! Couldn't save custom image.");
      }
    } else {
      localStorage.removeItem('wall_cal_custom_image');
    }
  }, [customImage]);

  useEffect(() => {
    const loadAssets = async () => {
      const allImagesToPreload = customImage ? [...monthImages, customImage] : monthImages;

      const imagePromises = allImagesToPreload.map(src => {
        return new Promise(resolve => {
          const img = new window.Image();
          img.src = src;
          img.onload = resolve;
          img.onerror = resolve;
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

    loadAssets().then(() => setIsLoading(false));
  }, [customImage]);

  const nextMonth = useCallback(() => {
    audio.playPaperFlip();
    setDirection(1);
    setCurrentDate(prev => addMonths(prev, 1));
  }, []);

  const prevMonth = useCallback(() => {
    audio.playPaperFlip();
    setDirection(-1);
    setCurrentDate(prev => subMonths(prev, 1));
  }, []);

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
  }, [nextMonth, prevMonth]);

  const activeTheme = useMemo(() => THEME_STYLES[theme], [theme]);

  const heroImage = useMemo(
    () => customImage || monthImages[currentDate.getMonth()],
    [customImage, currentDate]
  );

  const handleExport = useCallback(() => {
    wallPosterRef.current?.exportPoster();
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && <AestheticLoader />}
      </AnimatePresence>

      <main className="w-screen h-screen overflow-hidden bg-black flex items-center justify-center p-4 md:p-8 font-sans relative perspective-[2000px]">

        {/* BACKGROUND */}
        <video
          src="/video.mp4"
          autoPlay
          loop={true}
          muted
          playsInline
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-40 blur-[3px]"
        />

        {/* SETTINGS TRIGGER */}
        <motion.button
          whileHover={{ scale: 1.05, rotate: 90 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { audio.playClick(); setIsSettingsOpen(true); }}
          aria-label="Open settings"
          className="absolute top-6 left-6 z-40 p-3 bg-white/80 backdrop-blur-md shadow-lg rounded-full text-zinc-800 border border-white/40 hover:bg-white transition-all duration-200 ease-out"
        >
          <Settings2 className="w-6 h-6" />
        </motion.button>

        {/* POSTER STUDIO */}
        <PosterStudio
          isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} customImage={customImage} onImageChange={setCustomImage}
          fontStyle={fontStyle} onFontStyleChange={setFontStyle} theme={theme} onThemeChange={setTheme}
          ultraQuality={ultraQuality} onUltraQualityChange={setUltraQuality} isExporting={isExporting} onExport={handleExport}
        />

        {/* WALL POSTER */}
        <AnimatePresence>
          {!isLoading && (
            <WallPoster
              ref={wallPosterRef}
              currentDate={currentDate}
              direction={direction}
              activeTheme={activeTheme}
              fontStyle={fontStyle}
              heroImage={heroImage}
              isTimeWarpOpen={isTimeWarpOpen}
              onTimeWarpToggle={setIsTimeWarpOpen}
              onDateChange={setCurrentDate}
              nextMonth={nextMonth}
              prevMonth={prevMonth}
              isExporting={isExporting}
              onExportStateChange={setIsExporting}
              ultraQuality={ultraQuality}
            />
          )}
        </AnimatePresence>

        <MusicPlayer />
      </main>
    </>
  );
}