"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Play, Pause, Disc3 } from 'lucide-react';
import { audio } from '@/utils/audio';

export default function MusicPlayer() {
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasInteracted = useRef(false);

  useEffect(() => {
    // Initialize the audio
    audioRef.current = new Audio('/song.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5; // 50% volume so it's a vibe, not overpowering
    
    // Attempt instant auto-play
    const playPromise = audioRef.current.play();
    
    if (playPromise !== undefined) {
      playPromise.then(() => {
        // Success! Browser allowed auto-play
        setIsPlaying(true);
        hasInteracted.current = true;
      }).catch(error => {
        // Browser blocked auto-play. Let's use the "First Click" workaround.
        console.log("Browser paused auto-play. Waiting for first interaction...");
        
        const startOnInteraction = () => {
          if (!hasInteracted.current && audioRef.current) {
            audioRef.current.play();
            setIsPlaying(true);
            hasInteracted.current = true;
          }
          // Remove listener once triggered so it doesn't fire again
          document.removeEventListener('click', startOnInteraction);
        };
        
        // Listen for ANY click on the entire webpage
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

  const toggleMusic = (e: React.MouseEvent) => {
    e.stopPropagation(); // Don't trigger the global click listener
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
      <motion.div layout="position" className="w-14 h-14 flex items-center justify-center shrink-0">
        <div className={`p-2.5 rounded-full ${isPlaying ? 'bg-zinc-900 text-white shadow-md' : 'bg-transparent text-zinc-700'}`}>
          {isPlaying ? <Disc3 className="w-5 h-5 animate-[spin_3s_linear_infinite]" /> : <Music className="w-5 h-5" />}
        </div>
      </motion.div>

      <AnimatePresence>
        {isHovered && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}
            className="flex-1 flex items-center justify-between pl-2 pr-4 min-w-[160px]"
          >
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold text-zinc-900 truncate">Now Playing</span>
              <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider truncate">Gallery Vibes</span>
            </div>
            
            <button onClick={toggleMusic} className="p-2 bg-zinc-100 hover:bg-zinc-200 rounded-full transition-colors shrink-0">
              {isPlaying ? <Pause className="w-4 h-4 fill-current text-zinc-800" /> : <Play className="w-4 h-4 fill-current text-zinc-800 ml-0.5" />}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}