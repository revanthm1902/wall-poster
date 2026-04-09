"use client";

import React, { useRef } from 'react';
import { Settings2, X, Upload, Download, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type ThemeType = 'zinc' | 'sepia' | 'midnight' | 'emerald' | 'rose' | 'lavender';

interface PosterStudioProps {
  isOpen: boolean;
  onClose: () => void;
  customImage: string | null;
  onImageChange: (image: string | null) => void;
  fontStyle: 'font-sans' | 'font-serif' | 'font-mono';
  onFontStyleChange: (font: 'font-sans' | 'font-serif' | 'font-mono') => void;
  theme: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
  ultraQuality: boolean;
  onUltraQualityChange: (quality: boolean) => void;
  isExporting: boolean;
  onExport: () => void;
}

export default function PosterStudio({
  isOpen, onClose, customImage, onImageChange,
  fontStyle, onFontStyleChange, theme, onThemeChange,
  ultraQuality, onUltraQualityChange, isExporting, onExport
}: PosterStudioProps) {

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = img.width;
        let height = img.height;
        const maxSize = 1200;

        if (width > height && width > maxSize) {
          height *= maxSize / width;
          width = maxSize;
        } else if (height > maxSize) {
          width *= maxSize / height;
          height = maxSize;
        }
        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        onImageChange(compressedBase64);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-zinc-900/20 backdrop-blur-sm"
          />

          <motion.div
            initial={{ x: -400, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -400, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 180 }}
            role="dialog"
            aria-modal="true"
            aria-label="Poster Studio settings"
            className="fixed top-0 left-0 h-full w-full max-w-85 z-50 bg-white/60 backdrop-blur-2xl border-r border-white/50 shadow-2xl p-6 flex flex-col gap-6 overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-zinc-400/20 pb-4">
              <div className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-zinc-800" />
                <h3 className="font-bold text-zinc-800">Poster Studio</h3>
              </div>
              <button
                onClick={onClose}
                aria-label="Close settings"
                className="p-1.5 rounded-full hover:bg-black/10 transition-all duration-200"
              >
                <X className="w-5 h-5 text-zinc-600" />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider">Hero Image</label>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" aria-hidden="true" />
              <div className="flex gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Upload hero image"
                  className="flex-1 flex items-center justify-center gap-2 bg-white/80 hover:bg-white text-zinc-800 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all duration-200 border border-white/50"
                >
                  <Upload className="w-4 h-4" /> Upload
                </button>
                {customImage && (
                  <button
                    onClick={() => onImageChange(null)}
                    aria-label="Clear hero image"
                    className="px-4 bg-red-500/10 text-red-600 hover:bg-red-500/20 rounded-lg text-sm font-semibold transition-all duration-200"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider">Typography</label>
              <div className="grid grid-cols-3 gap-2 bg-black/5 p-1 rounded-lg border border-white/30">
                {(['font-sans', 'font-serif', 'font-mono'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => onFontStyleChange(f)}
                    aria-label={`Select ${f.split('-')[1]} typography`}
                    className={`py-1.5 text-xs font-bold rounded-md capitalize transition-all duration-200 ${fontStyle === f ? 'bg-white shadow-md text-zinc-900' : 'text-zinc-600 hover:text-zinc-900'}`}
                  >
                    {f.split('-')[1]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider">Color Theme</label>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => onThemeChange('zinc')} aria-label="Select zinc theme" className={`h-10 rounded-md bg-zinc-900 border-2 shadow-inner transition-all duration-200 hover:scale-105 ${theme === 'zinc' ? 'border-amber-400' : 'border-transparent'}`} title="Zinc" />
                <button onClick={() => onThemeChange('sepia')} aria-label="Select sepia theme" className={`h-10 rounded-md bg-[#8c7355] border-2 shadow-inner transition-all duration-200 hover:scale-105 ${theme === 'sepia' ? 'border-amber-400' : 'border-transparent'}`} title="Sepia" />
                <button onClick={() => onThemeChange('midnight')} aria-label="Select midnight theme" className={`h-10 rounded-md bg-blue-950 border-2 shadow-inner transition-all duration-200 hover:scale-105 ${theme === 'midnight' ? 'border-amber-400' : 'border-transparent'}`} title="Midnight" />

                <button onClick={() => onThemeChange('emerald')} aria-label="Select emerald theme" className={`h-10 rounded-md bg-emerald-800 border-2 shadow-inner transition-all duration-200 hover:scale-105 ${theme === 'emerald' ? 'border-amber-400' : 'border-transparent'}`} title="Emerald" />
                <button onClick={() => onThemeChange('rose')} aria-label="Select rose theme" className={`h-10 rounded-md bg-rose-800 border-2 shadow-inner transition-all duration-200 hover:scale-105 ${theme === 'rose' ? 'border-amber-400' : 'border-transparent'}`} title="Rose" />
                <button onClick={() => onThemeChange('lavender')} aria-label="Select lavender theme" className={`h-10 rounded-md bg-purple-800 border-2 shadow-inner transition-all duration-200 hover:scale-105 ${theme === 'lavender' ? 'border-amber-400' : 'border-transparent'}`} title="Lavender" />
              </div>
            </div>

            <div className="mt-auto flex flex-col gap-4">
              <div className="flex items-center justify-between pt-4 border-t border-zinc-400/20">
                <label htmlFor="ultra-quality-toggle" className="text-sm font-semibold text-zinc-800 flex flex-col">
                  Ultra Print Quality
                  <span className="text-[10px] text-zinc-500 font-normal">4x resolution (Slower)</span>
                </label>
                <input
                  id="ultra-quality-toggle"
                  type="checkbox"
                  checked={ultraQuality}
                  onChange={(e) => onUltraQualityChange(e.target.checked)}
                  aria-label="Toggle ultra print quality"
                  className="w-4 h-4 accent-zinc-900"
                />
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onExport}
                disabled={isExporting}
                aria-label={isExporting ? 'Rendering poster' : 'Download poster as image'}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-zinc-900 text-white font-bold rounded-xl shadow-xl hover:bg-zinc-800 transition-all duration-200 disabled:opacity-70"
              >
                {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                {isExporting ? 'Rendering Poster...' : 'Download Poster'}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}