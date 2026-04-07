"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Play, Pause, Disc3 } from 'lucide-react';
import { audio } from '@/utils/audio'; // We still want the UI click sound!

export default function MusicPlayer() {
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Ref to hold the actual MP3 audio element
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize the audio strictly on the client side
    audioRef.current = new Audio('/song.mp3');
    audioRef.current.loop = true; // Auto-loop the track
    audioRef.current.volume = 0.6; // Set a nice background volume level
    
    return () => {
      // Cleanup when component unmounts
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleMusic = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the hover div from stealing the click
    audio.playClick();   // Trigger the mechanical UI click sound
    
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <motion.div
      layout
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed bottom-8 right-8 z-50 flex items-center bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-full overflow-hidden cursor-pointer"
      initial={{ borderRadius: 50 }}
      animate={{ 
        width: isHovered ? 240 : 56, 
        height: 56,
        paddingLeft: isHovered ? 8 : 0,
        paddingRight: isHovered ? 8 : 0
      }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      {/* The Icon (Always visible) */}
      <motion.div 
        layout="position"
        className="w-14 h-14 flex items-center justify-center shrink-0"
      >
        <div className={`p-2.5 rounded-full ${isPlaying ? 'bg-zinc-900 text-white shadow-md' : 'bg-transparent text-zinc-700'}`}>
          {isPlaying ? <Disc3 className="w-5 h-5 animate-[spin_3s_linear_infinite]" /> : <Music className="w-5 h-5" />}
        </div>
      </motion.div>

      {/* The Expanded Content (Visible on Hover) */}
      <AnimatePresence>
        {isHovered && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex items-center justify-between pl-2 pr-4 min-w-[160px]"
          >
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold text-zinc-900 truncate">Now Playing</span>
              <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider truncate">Curated Audio</span>
            </div>
            
            <button 
              onClick={toggleMusic}
              className="p-2 bg-zinc-100 hover:bg-zinc-200 rounded-full transition-colors shrink-0"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current text-zinc-800" /> : <Play className="w-4 h-4 fill-current text-zinc-800 ml-0.5" />}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}