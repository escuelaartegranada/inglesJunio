import React, { ReactNode, useState, useEffect } from 'react';
import { Home, Volume2, ArrowLeft, ArrowRight, RotateCcw, Star } from 'lucide-react';
import { Screen } from '../types';
import { playSound, speak } from '../utils';
import { useScore } from '../ScoreContext';
import { motion, AnimatePresence } from 'motion/react';

interface ActivityLayoutProps {
  title: string;
  instructionText: string;
  instructionEs?: string;
  onNavigate: (screen: Screen) => void;
  onRepeatAudio: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  currentLevel?: number;
  totalLevels?: number;
  children: ReactNode;
}

export default function ActivityLayout({ 
  title, 
  instructionText, 
  instructionEs,
  onNavigate, 
  onRepeatAudio,
  onNext,
  onPrev,
  currentLevel,
  totalLevels,
  children 
}: ActivityLayoutProps) {
  const { score } = useScore();
  const [showScorePopup, setShowScorePopup] = useState(false);
  const [prevScore, setPrevScore] = useState(score);

  useEffect(() => {
    if (score > prevScore) {
      setShowScorePopup(true);
      setTimeout(() => setShowScorePopup(false), 1500);
    }
    setPrevScore(score);
  }, [score, prevScore]);
  
  const handleHome = () => {
    playSound('click');
    onNavigate('home');
  };

  const wrapAudio = () => {
    playSound('click');
    speak(instructionText);
    onRepeatAudio();
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-amber-50 overscroll-none overflow-hidden touch-none select-none font-sans">
      {/* TOP BAR */}
      <header className="h-40 flex-shrink-0 bg-white border-b-4 border-amber-200 px-6 md:px-12 flex items-center justify-between shadow-md z-10 w-full rounded-b-[40px]">
        <div className="flex-1 flex justify-start items-center gap-4 md:gap-6">
          <button 
            onClick={wrapAudio}
            className="w-16 h-16 md:w-24 md:h-24 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg active:translate-y-1 active:shadow-md transition-all shrink-0"
          >
            <Volume2 className="w-8 h-8 md:w-12 md:h-12" />
          </button>
          <div className="flex flex-col">
            <h2 className="text-2xl md:text-[40px] font-black text-blue-900 leading-tight tracking-tight">
              {instructionText}
            </h2>
            <p className="text-xl md:text-[24px] font-medium text-amber-600 italic leading-tight mt-1">{instructionEs || title}</p>
          </div>
        </div>

        <div className="flex-1 flex justify-end">
          <div className="flex items-center gap-4 relative">
            <AnimatePresence>
              {showScorePopup && (
                <motion.div 
                  initial={{ opacity: 0, y: 20, scale: 0.5 }}
                  animate={{ opacity: 1, y: -40, scale: 1.2 }}
                  exit={{ opacity: 0, y: -80, scale: 1.5 }}
                  className="absolute left-1/2 -ml-8 bottom-full text-5xl font-black text-emerald-500 drop-shadow-md z-50 pointer-events-none"
                >
                  +10
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex items-center gap-3 bg-amber-100 px-6 py-4 rounded-3xl border-4 border-amber-300">
               <Star className="text-amber-500 w-10 h-10 fill-amber-500" />
               <span className="text-4xl font-black text-amber-700">{score}</span>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 relative w-full h-full p-4 md:p-12 flex flex-col items-center justify-center overflow-auto z-0">
        {children}
      </main>

      {/* BOTTOM BAR */}
      <footer className="h-28 flex-shrink-0 bg-white border-t-4 border-amber-100 px-6 md:px-12 flex items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] w-full relative z-10">
        <div className="flex-1 flex justify-start">
          <button 
             onClick={handleHome}
             className="h-16 md:h-20 px-6 md:px-8 bg-amber-400 rounded-3xl flex items-center gap-3 md:gap-4 shadow-md active:translate-y-1 text-white border-b-8 border-amber-500 hover:border-b-4 hover:translate-y-1 transition-all"
          >
             <Home size={32} strokeWidth={3} />
             <span className="text-xl md:text-2xl font-black uppercase hidden sm:flex flex-col items-start leading-none group-hover:scale-105 transition-transform"><span className="tracking-wide">Home</span><span className="text-[12px] md:text-[14px] text-amber-200 normal-case tracking-normal">Inicio</span></span>
          </button>
        </div>
        
        <div className="flex-1 flex justify-center items-center">
           {onPrev && (
             <button 
               onClick={() => { playSound('click'); onPrev(); }}
               className="h-16 md:h-20 px-4 md:px-8 bg-slate-100 rounded-3xl flex items-center gap-2 md:gap-4 shadow-md active:translate-y-1 text-slate-500 border-b-8 border-slate-200 hover:border-b-4 hover:translate-y-1 transition-all"
             >
               <ArrowLeft size={32} strokeWidth={3} />
               <span className="text-xl md:text-2xl font-black uppercase hidden lg:flex flex-col items-start leading-none"><span className="tracking-wide">Back</span><span className="text-[12px] md:text-[14px] text-slate-400 normal-case tracking-normal">Volver</span></span>
             </button>
           )}
           {currentLevel !== undefined && totalLevels !== undefined && (
             <div className="bg-amber-100 px-6 sm:px-10 py-3 rounded-full border-2 border-amber-200 hidden md:block mx-4">
               <span className="text-xl sm:text-[24px] font-black text-amber-700 uppercase tracking-widest">{currentLevel} / {totalLevels}</span>
             </div>
           )}
        </div>

        <div className="flex-1 flex justify-end">
          {onNext ? (
            <button 
              onClick={() => { playSound('click'); onNext(); }}
              className="h-16 md:h-20 px-6 md:px-10 bg-indigo-600 rounded-3xl flex items-center gap-3 md:gap-4 shadow-lg active:translate-y-1 transition-all border-b-8 border-indigo-800 text-white hover:border-b-4 hover:translate-y-1"
            >
              <span className="text-xl md:text-2xl font-black uppercase hidden sm:flex flex-col items-start leading-none group-hover:scale-105 transition-transform"><span className="tracking-wide">Next</span><span className="text-[12px] md:text-[14px] text-indigo-300 normal-case tracking-normal">Siguiente</span></span>
              <ArrowRight size={32} strokeWidth={3} />
            </button>
          ) : (
            <div className="w-[120px] md:w-[160px]"></div>
          )}
        </div>
      </footer>
    </div>
  );
}
