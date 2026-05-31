import React, { ReactNode, useState, useEffect } from 'react';
import { Home, Volume2, ArrowLeft, ArrowRight, RotateCcw, Star } from 'lucide-react';
import { Screen } from '../types';
import { playSound, speak } from '../utils';
import { useScore } from '../ScoreContext';
import { motion, AnimatePresence } from 'motion/react';
import SpanishReveal from './SpanishReveal';

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
    <div className="min-h-[100dvh] flex flex-col bg-amber-50 overscroll-none select-none font-sans overflow-x-hidden overflow-y-auto">
      {/* TOP BAR */}
      <header className="min-h-[100px] md:h-40 py-4 flex-shrink-0 bg-white border-b-4 border-amber-200 px-4 md:px-12 flex items-center justify-between shadow-md z-10 w-full rounded-b-[40px] gap-2">
        <div className="flex-1 flex justify-start items-center gap-3 md:gap-6 min-w-0">
          <button 
            onClick={wrapAudio}
            className="w-12 h-12 md:w-24 md:h-24 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg active:translate-y-1 active:shadow-md transition-all shrink-0"
          >
            <Volume2 className="w-6 h-6 md:w-12 md:h-12" />
          </button>
          <div className="flex flex-col min-w-0">
            <h2 className="text-lg sm:text-2xl md:text-[40px] font-black text-blue-900 leading-tight tracking-tight break-words">
              {instructionText}
            </h2>
            <div className="mt-1 flex justify-start"><SpanishReveal text={instructionEs || title} className="text-sm sm:text-xl md:text-[24px] font-medium italic truncate" /></div>
          </div>
        </div>

        <div className="shrink-0 flex justify-end">
          <div className="flex items-center gap-2 md:gap-4 relative">
            <button
              onClick={() => {
                playSound('click');
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen().catch(e => console.error(e));
                } else {
                  document.exitFullscreen().catch(e => console.error(e));
                }
              }}
              className="bg-slate-100 p-4 rounded-3xl border-4 border-slate-200 text-slate-500 hover:bg-slate-200 transition-all hidden md:flex items-center justify-center shrink-0"
              title="Pantalla Completa"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-maximize"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>
            </button>
            <AnimatePresence>
              {showScorePopup && (
                <motion.div 
                  initial={{ opacity: 0, y: 20, scale: 0.5 }}
                  animate={{ opacity: 1, y: -40, scale: 1.2 }}
                  exit={{ opacity: 0, y: -80, scale: 1.5 }}
                  className="absolute left-1/2 -ml-8 bottom-full text-3xl md:text-5xl font-black text-emerald-500 drop-shadow-md z-50 pointer-events-none"
                >
                  +10
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex items-center gap-2 md:gap-3 bg-amber-100 px-4 md:px-6 py-2 md:py-4 rounded-full md:rounded-3xl border-2 md:border-4 border-amber-300">
               <Star className="text-amber-500 w-6 h-6 md:w-10 md:h-10 fill-amber-500 shrink-0" />
               <div className="flex flex-col items-start leading-none gap-1">
                  <span className="text-[10px] md:text-[14px] font-black text-amber-600 uppercase tracking-widest hidden sm:block">Score</span>
                  <span className="text-2xl md:text-4xl font-black text-amber-700 leading-none">{score}</span>
               </div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 relative w-full p-4 md:p-12 flex flex-col items-center justify-center z-0">
        {children}
      </main>

      {/* BOTTOM BAR */}
      <footer className="h-28 flex-shrink-0 bg-white border-t-4 border-amber-100 px-6 md:px-12 flex items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] w-full relative z-10">
        <div className="flex-1 flex justify-start">
          <button 
             onClick={handleHome}
             className="h-14 md:h-20 px-4 md:px-8 bg-amber-400 rounded-2xl md:rounded-3xl flex items-center gap-2 md:gap-4 shadow-md active:translate-y-1 text-white border-b-4 md:border-b-8 border-amber-500 hover:translate-y-1 transition-all"
          >
             <Home size={24} className="md:w-8 md:h-8" strokeWidth={3} />
             <span className="text-lg md:text-2xl font-black uppercase hidden lg:flex flex-col items-start leading-none group-hover:scale-105 transition-transform"><span className="tracking-wide">Home</span><SpanishReveal text="Inicio" className="text-[14px] normal-case tracking-normal !text-amber-200 mt-1" /></span>
          </button>
        </div>
        
        <div className="flex-1 flex justify-center items-center">
           {onPrev && (
             <button 
               onClick={() => { playSound('click'); onPrev(); }}
               className="h-14 md:h-20 px-4 md:px-8 bg-slate-100 rounded-2xl md:rounded-3xl flex items-center gap-2 md:gap-4 shadow-md active:translate-y-1 text-slate-500 border-b-4 md:border-b-8 border-slate-200 hover:translate-y-1 transition-all"
             >
               <ArrowLeft size={24} className="md:w-8 md:h-8" strokeWidth={3} />
               <span className="text-lg md:text-2xl font-black uppercase hidden lg:flex flex-col items-start leading-none"><span className="tracking-wide">Back</span><SpanishReveal text="Volver" className="text-[14px] normal-case tracking-normal !text-slate-400 mt-1" /></span>
             </button>
           )}
           {currentLevel !== undefined && totalLevels !== undefined && (
             <div className="bg-amber-100 px-4 sm:px-10 py-2 sm:py-3 rounded-full border-2 border-amber-200 hidden sm:block mx-2 sm:mx-4 shrink-0">
               <span className="text-lg sm:text-[24px] font-black text-amber-700 uppercase tracking-widest leading-none">{currentLevel} / {totalLevels}</span>
             </div>
           )}
        </div>

        <div className="flex-1 flex justify-end">
          {onNext ? (
            <button 
              onClick={() => { playSound('click'); onNext(); }}
              className="h-14 md:h-20 px-4 md:px-10 bg-indigo-600 rounded-2xl md:rounded-3xl flex items-center gap-2 md:gap-4 shadow-lg active:translate-y-1 transition-all border-b-4 md:border-b-8 border-indigo-800 text-white hover:translate-y-1"
            >
              <span className="text-lg md:text-2xl font-black uppercase hidden lg:flex flex-col items-start leading-none group-hover:scale-105 transition-transform"><span className="tracking-wide">Next</span><SpanishReveal text="Siguiente" className="text-[14px] normal-case tracking-normal !text-indigo-300 mt-1" /></span>
              <ArrowRight size={24} className="md:w-8 md:h-8" strokeWidth={3} />
            </button>
          ) : (
            <div className="w-[120px] md:w-[160px]"></div>
          )}
        </div>
      </footer>
    </div>
  );
}
