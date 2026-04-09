"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Settings2 } from 'lucide-react';
import { addMonths, subMonths } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import WallPoster, { WallPosterHandle } from '@/components/WallPoster';
import PosterStudio, { ThemeType } from '@/components/PosterStudio';
import MusicPlayer from '@/components/MusicPlayer';
import { audio } from '@/utils/audio';

const monthImages = [
  "/months/jan.webp", "/months/feb.webp", "/months/mar.webp", "/months/apr.webp",
  "/months/may.webp", "/months/jun.webp", "/months/jul.webp", "/months/aug.webp",
  "/months/sep.webp", "/months/oct.webp", "/months/nov.webp", "/months/dec.webp"
];

const NOISE_BG = 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%2２ filter=%2２url(%２3noiseFilter)%２２/%３E%３C/svg%３E")';

export type ThemeStyle = { bg: string; text: string; fill: string; bgColorHex: string };

const THEME_STYLES: Record<ThemeType, ThemeStyle> = {
  zinc: { bg: 'bg-[#fafafa]', text: 'text-zinc-800', fill: 'text-[#fafafa]', bgColorHex: '#fafafa' },
  sepia: { bg: 'bg-[#f4ecd8]', text: 'text-[#4a3b32]', fill: 'text-[#f4ecd8]', bgColorHex: '#f4ecd8' },
  midnight: { bg: 'bg-slate-900', text: 'text-slate-100', fill: 'text-slate-900', bgColorHex: '#0f172a' },
  emerald: { bg: 'bg-[#ecfdf5]', text: 'text-emerald-900', fill: 'text-[#ecfdf5]', bgColorHex: '#ecfdf5' },
  rose: { bg: 'bg-[#fff1f2]', text: 'text-rose-900', fill: 'text-[#fff1f2]', bgColorHex: '#fff1f2' },
  lavender: { bg: 'bg-[#faf5ff]', text: 'text-purple-900', fill: 'text-[#faf5ff]', bgColorHex: '#faf5ff' },
};

const ACTUAL_MIN_LOADER_MS = 2000; 

const AestheticLoader = ({ progress }: { progress: number }) => {
  return (
    <motion.div
      key="loader"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(8px)", scale: 1.04 }}
      transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#050505] text-white overflow-hidden"
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
        <div className="w-48 h-[2px] bg-zinc-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-zinc-400 to-zinc-200 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
        <motion.p
          className="text-[10px] font-mono tracking-widest text-zinc-600 uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {Math.round(progress)}%
        </motion.p>
      </div>
    </motion.div>
  );
};

export default function WallCalendar() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
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
  const initialLoadDone = useRef(false);

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
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;
    const loadStart = performance.now();

    const loadAssets = async () => {
      const savedCustomImage = localStorage.getItem('wall_cal_custom_image');
      const currentMonthIndex = new Date().getMonth();
      const currentMonthImage = monthImages[currentMonthIndex];
      const priorityImages = savedCustomImage ? [savedCustomImage] : [currentMonthImage];
      const totalAssets = priorityImages.length + 2;
      let loadedCount = 0;

      const updateProgress = () => {
        loadedCount++;
        setLoadProgress(Math.round((loadedCount / totalAssets) * 100));
      };

      const imagePromises = priorityImages.map(src =>
        new Promise<void>(resolve => {
          const img = new window.Image();
          img.src = src;
          img.onload = () => { updateProgress(); resolve(); };
          img.onerror = () => { updateProgress(); resolve(); };
        })
      );

      const videoPromise = new Promise<void>(resolve => {
        const vid = document.createElement('video');
        vid.preload = 'auto';
        vid.src = "/video.mp4";
        vid.muted = true;
        vid.playsInline = true;
        vid.oncanplaythrough = () => { updateProgress(); resolve(); };
        vid.onerror = () => { 
          console.warn("Video preload blocked or failed.");
          updateProgress(); 
          resolve(); 
        };
        vid.load();
      });

      const audioPromise = new Promise<void>(resolve => {
        const aud = new Audio();
        aud.preload = 'auto';
        aud.src = "/song.mp3";
        aud.oncanplaythrough = () => { updateProgress(); resolve(); };
        aud.onerror = () => { 
          console.warn("Audio preload blocked or failed.");
          updateProgress(); 
          resolve(); 
        };
        aud.load();
      });

      const timeoutPromise = new Promise<void>(resolve => setTimeout(resolve, 8000));
      await Promise.race([
        Promise.all([...imagePromises, videoPromise, audioPromise]),
        timeoutPromise
      ]);
    };

    loadAssets().then(() => {
      const elapsed = performance.now() - loadStart;
      const remaining = Math.max(0, ACTUAL_MIN_LOADER_MS - elapsed);
      
      setTimeout(() => {
        setIsLoading(false);
        setTimeout(() => {
          const currentMonthIndex = new Date().getMonth();
          const currentMonthImage = monthImages[currentMonthIndex];
          const backgroundImages = monthImages.filter(img => img !== currentMonthImage);
          backgroundImages.forEach(src => {
            const img = new window.Image();
            img.src = src;
          });
        }, 1500);

      }, remaining);
    });
  }, []);

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

  // GLOBAL KEYBOARD SHORTCUTS
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
        {isLoading && <AestheticLoader progress={loadProgress} />}
      </AnimatePresence>

      <main className="w-screen h-screen overflow-hidden bg-black flex items-center justify-center p-4 md:p-8 font-sans relative perspective-[2000px]">
        <video
          src="/video.mp4"
          autoPlay
          loop={true}
          muted
          playsInline
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-40 blur-[3px]"
        />

        <AnimatePresence>
          {!isLoading && (
            <>
              {/* SETTINGS TRIGGER */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.4, ease: "easeOut" }}
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

              {/* THE WALL POSTER*/}
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

              {/* MUSIC PLAYER */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.5, ease: "easeOut" }}
              >
                <MusicPlayer />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}