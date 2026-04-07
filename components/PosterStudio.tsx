import React, { useRef } from 'react';
import { Settings2, X, Upload, Download, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PosterStudioProps {
  isOpen: boolean;
  onClose: () => void;
  customImage: string | null;
  onImageChange: (image: string | null) => void;
  fontStyle: 'font-sans' | 'font-serif' | 'font-mono';
  onFontStyleChange: (font: 'font-sans' | 'font-serif' | 'font-mono') => void;
  theme: 'zinc' | 'sepia' | 'midnight';
  onThemeChange: (theme: 'zinc' | 'sepia' | 'midnight') => void;
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
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => onImageChange(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-zinc-900/20 backdrop-blur-sm"
          />
          
          {/* Glass Panel */}
          <motion.div 
            initial={{ x: -400, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -400, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 h-full w-full max-w-[340px] z-50 bg-white/60 backdrop-blur-2xl border-r border-white/50 shadow-2xl p-6 flex flex-col gap-6 overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-400/20 pb-4">
              <div className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-zinc-800" />
                <h3 className="font-bold text-zinc-800">Poster Studio</h3>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-black/10 transition-colors">
                <X className="w-5 h-5 text-zinc-600" />
              </button>
            </div>

            {/* Upload Control */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider">Hero Image</label>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
              <div className="flex gap-2">
                <button onClick={() => fileInputRef.current?.click()} className="flex-1 flex items-center justify-center gap-2 bg-white/80 hover:bg-white text-zinc-800 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all border border-white/50">
                  <Upload className="w-4 h-4" /> Upload
                </button>
                {customImage && (
                  <button onClick={() => onImageChange(null)} className="px-4 bg-red-500/10 text-red-600 hover:bg-red-500/20 rounded-lg text-sm font-semibold transition-colors">Clear</button>
                )}
              </div>
            </div>

            {/* Typography Control */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider">Typography</label>
              <div className="grid grid-cols-3 gap-2 bg-black/5 p-1 rounded-lg border border-white/30">
                {(['font-sans', 'font-serif', 'font-mono'] as const).map((f) => (
                  <button key={f} onClick={() => onFontStyleChange(f)} className={`py-1.5 text-xs font-bold rounded-md capitalize transition-all ${fontStyle === f ? 'bg-white shadow-md text-zinc-900' : 'text-zinc-600 hover:text-zinc-900'}`}>
                    {f.split('-')[1]}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Control */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider">Color Theme</label>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => onThemeChange('zinc')} className={`h-10 rounded-md bg-zinc-900 border-2 shadow-inner ${theme === 'zinc' ? 'border-amber-400' : 'border-transparent'}`} />
                <button onClick={() => onThemeChange('sepia')} className={`h-10 rounded-md bg-[#8c7355] border-2 shadow-inner ${theme === 'sepia' ? 'border-amber-400' : 'border-transparent'}`} />
                <button onClick={() => onThemeChange('midnight')} className={`h-10 rounded-md bg-blue-950 border-2 shadow-inner ${theme === 'midnight' ? 'border-amber-400' : 'border-transparent'}`} />
              </div>
            </div>

            {/* Export Footer */}
            <div className="mt-auto flex flex-col gap-4">
              <div className="flex items-center justify-between pt-4 border-t border-zinc-400/20">
                <label className="text-sm font-semibold text-zinc-800 flex flex-col">
                  Ultra Print Quality
                  <span className="text-[10px] text-zinc-500 font-normal">4x resolution (Slower)</span>
                </label>
                <input type="checkbox" checked={ultraQuality} onChange={(e) => onUltraQualityChange(e.target.checked)} className="w-4 h-4 accent-zinc-900" />
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onExport}
                disabled={isExporting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-zinc-900 text-white font-bold rounded-xl shadow-xl hover:bg-zinc-800 transition-all disabled:opacity-70"
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