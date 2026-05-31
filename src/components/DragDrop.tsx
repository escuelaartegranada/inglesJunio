import { useState, useEffect, useRef, useMemo } from 'react';
import { Screen } from '../types';
import ActivityLayout from './ActivityLayout';
import { VOCABULARY } from '../data';
import { playSound, speak } from '../utils';
import * as Icons from 'lucide-react';
import { motion, useAnimation } from 'motion/react';
import { useScore } from '../ScoreContext';
import SpanishReveal from './SpanishReveal';

interface Props {
  onNavigate: (screen: Screen) => void;
}

export default function DragDrop({ onNavigate }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState<{en: string, es: string}[]>([]);
  const [isPlaced, setIsPlaced] = useState(false);
  const { addScore } = useScore();

  const gameItems = useMemo(() => {
    return [...VOCABULARY].sort(() => Math.random() - 0.5);
  }, []);
  
  const currentItem = gameItems[currentIndex];
  const dropZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    generateOptions();
    speak(`Find the word for ${currentItem.en}`);
    setIsPlaced(false);
  }, [currentIndex, currentItem]);

  const generateOptions = () => {
    const wrongAnswers = VOCABULARY.filter(v => v.id !== currentItem.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 2)
      .map(v => ({en: v.en, es: v.es}));
    
    setOptions([{en: currentItem.en, es: currentItem.es}, ...wrongAnswers].sort(() => 0.5 - Math.random()));
  };

  const handleNext = () => {
    if (currentIndex < gameItems.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      playSound('pop');
      setCurrentIndex(0);
    }
  };

  const handleRepeat = () => {
    speak(`Find the word for ${currentItem.en}`);
  };

  const IconComponent = (Icons as any)[currentItem.icon] || Icons.Star;

  return (
      <ActivityLayout 
      title="Stickers" 
      instructionText="Drag the word"
      instructionEs="Arrastra la palabra hacia la imagen"
      onNavigate={onNavigate}
      onRepeatAudio={handleRepeat}
      onNext={handleNext}
      currentLevel={currentIndex + 1}
      totalLevels={gameItems.length}
    >
      <div className="flex-1 w-full flex flex-col items-center justify-start md:justify-center p-4 max-w-5xl gap-4 md:gap-10">
        
        {/* The Picture and Drop Zone */}
        <div className="bg-white rounded-[32px] md:rounded-[48px] p-4 md:p-8 shadow-xl border-4 border-amber-200 flex flex-col items-center gap-4 md:gap-8 w-full max-w-md shrink-0">
          <div className="bg-amber-50 w-full py-6 md:py-12 rounded-[24px] md:rounded-[32px] flex items-center justify-center border-2 border-amber-100">
             <div className="w-32 h-32 md:w-48 md:h-48 bg-amber-200 rounded-full flex items-center justify-center shadow-inner">
               {IconComponent && <IconComponent size={64} className="md:w-[96px] md:h-[96px] text-amber-700" strokeWidth={2} />}
             </div>
          </div>
          
          <div 
            ref={dropZoneRef}
            className={`w-[90%] h-20 md:h-28 rounded-[24px] md:rounded-[32px] border-4 border-dashed transition-colors flex items-center justify-center
              ${isPlaced ? 'border-emerald-500 bg-emerald-50' : 'border-amber-300 bg-orange-50'}`}
          >
             {isPlaced && (
               <span className="text-2xl md:text-[40px] font-black text-emerald-700 uppercase tracking-widest">{currentItem.en}</span>
             )}
          </div>
        </div>

        {/* The Stickers */}
        {!isPlaced && (
          <div className="flex flex-col items-center gap-4 md:gap-8 w-full mt-2 md:mt-8 shrink-0 pb-12">
            <h3 className="text-xl md:text-3xl font-bold text-amber-600 mb-2 md:mb-4 bg-amber-100 px-6 py-2 md:px-8 md:py-3 rounded-full border-4 border-amber-200 text-center">
               ¿Qué significa: <span className="font-black mix-blend-multiply text-slate-800">{currentItem.es.toUpperCase()}</span>?
            </h3>
            <div className="flex justify-center gap-4 md:gap-8 w-full flex-wrap">
              {options.map((option, idx) => (
                <DraggableSticker 
                  key={`${currentIndex}-${idx}`} 
                  word={option.en} 
                  spanish={option.es}
                  correctWord={currentItem.en}
                  dropZoneRef={dropZoneRef}
                  onSuccess={() => {
                    playSound('correct');
                    speak(`Yes, ${currentItem.en}!`);
                    addScore(10);
                    setIsPlaced(true);
                    setTimeout(() => {
                      handleNext();
                    }, 2000);
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </ActivityLayout>
  );
}

// Separate component for draggable sticker to manage its own drag state easily
function DraggableSticker({ word, spanish, correctWord, dropZoneRef, onSuccess }: any) {
  const controls = useAnimation();

  const handleDragEnd = (event: any, info: any) => {
    if (!dropZoneRef.current) return;
    
    // Use info.point for the center point of the drag 
    const dropRect = dropZoneRef.current.getBoundingClientRect();
    const x = info.point.x;
    const y = info.point.y;

    const isInside = x >= dropRect.left && x <= dropRect.right && y >= dropRect.top && y <= dropRect.bottom;

    if (isInside) {
      if (word === correctWord) {
        onSuccess();
      } else {
        playSound('wrong');
        controls.start({ x: 0, y: 0, transition: { type: "spring", bounce: 0.6 } });
      }
    } else {
       controls.start({ x: 0, y: 0, transition: { type: "spring", bounce: 0.5 } });
    }
  };

  return (
    <motion.div
      drag
      dragSnapToOrigin={false} // We handle snap back manually
      animate={controls}
      onDragStart={() => { playSound('pop'); speak(word); }}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.1, rotate: 2, zIndex: 50, cursor: 'grabbing' }}
      className="bg-white px-4 py-3 md:px-6 md:py-4 rounded-3xl shadow-xl border-4 border-amber-200 cursor-grab touch-none select-none border-b-8 active:border-b-4 hover:-translate-y-1 active:translate-y-1 transition-all flex flex-col items-center justify-center min-w-[120px]"
    >
      <span className="text-xl md:text-2xl font-black uppercase text-blue-900 tracking-widest">{word}</span>
    </motion.div>
  );
}
