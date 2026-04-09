"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Play, Pause, Disc3 } from 'lucide-react';
import { audio } from '@/utils/audio';

export default function MusicPlayer() {
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasInteracted = useRef(false);

  useEffect(() => {
    audioRef.current = new Audio('/song.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5;

    const playPromise = audioRef.current.play();

    if (playPromise !== undefined) {
      playPromise.then(() => {
        setIsPlaying(true);
        hasInteracted.current = true;
      }).catch(() => {
        console.log("Browser paused auto-play. Waiting for first interaction...");

        const startOnInteraction = () => {
          if (!hasInteracted.current && audioRef.current) {
            audioRef.current.play();
            setIsPlaying(true);
            hasInteracted.current = true;
          }
          document.removeEventListener('click', startOnInteraction);
        };
        document.addEventListener('click', startOnInteraction);
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleMusic = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    audio.playClick();

    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
    hasInteracted.current = true;
  }, [isPlaying]);

  return (
    <motion.div
      layout
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Music player"
      className="fixed bottom-8 right-8 z-50 flex items-center bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-full overflow-hidden cursor-pointer"
      initial={{ borderRadius: 50 }}
      animate={{
        width: isHovered ? 240 : 56,
        height: 56,
        paddingLeft: isHovered ? 8 : 0,
        paddingRight: isHovered ? 8 : 0
      }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
    >
      <motion.div layout="position" className="w-14 h-14 flex items-center justify-center shrink-0">
        <div className={`p-2.5 rounded-full transition-all duration-200 ${isPlaying ? 'bg-zinc-900 text-white shadow-md' : 'bg-transparent text-zinc-700'}`}>
          {isPlaying ? <Disc3 className="w-5 h-5 animate-[spin_3s_linear_infinite]" aria-hidden="true" /> : <Music className="w-5 h-5" aria-hidden="true" />}
        </div>
      </motion.div>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="flex-1 flex items-center justify-between pl-2 pr-4 min-w-[160px]"
          >
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold text-zinc-900 truncate">Now Playing</span>
              <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider truncate">Gallery Vibes</span>
            </div>

            <button
              onClick={toggleMusic}
              aria-label={isPlaying ? 'Pause music' : 'Play music'}
              className="p-2 bg-zinc-100 hover:bg-zinc-200 rounded-full transition-all duration-200 shrink-0"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current text-zinc-800" /> : <Play className="w-4 h-4 fill-current text-zinc-800 ml-0.5" />}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}