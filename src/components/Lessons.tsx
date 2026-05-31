import { useState, useEffect } from 'react';
import { Screen } from '../types';
import ActivityLayout from './ActivityLayout';
import { VOCABULARY } from '../data';
import { playSound, speak } from '../utils';
import * as Icons from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useScore } from '../ScoreContext';

interface Props {
  onNavigate: (screen: Screen) => void;
}

export default function Lessons({ onNavigate }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { addScore } = useScore();
  const [learned, setLearned] = useState<Set<number>>(new Set());

  const currentItem = VOCABULARY[currentIndex];

  useEffect(() => {
    // Say the word when it appears
    speak(currentItem.en);

    if (!learned.has(currentIndex)) {
      addScore(2); // 2 points per word learned
      setLearned(prev => new Set([...prev, currentIndex]));
    }
  }, [currentIndex, currentItem.en, addScore, learned]);

  const handleNext = () => {
    if (currentIndex < VOCABULARY.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      playSound('pop');
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleRepeat = () => {
    speak(currentItem.en);
  };

  const IconComponent = (Icons as any)[currentItem.icon] || Icons.Star;

  return (
    <ActivityLayout 
      title="Lessons" 
      instructionText="Listen and repeat"
      instructionEs="Escucha y repite (¡Gana puntos por cada palabra nueva!)"
      onNavigate={onNavigate}
      onRepeatAudio={handleRepeat}
      onNext={handleNext}
      onPrev={currentIndex > 0 ? handlePrev : undefined}
      currentLevel={currentIndex + 1}
      totalLevels={VOCABULARY.length}
    >
      <div className="flex-1 w-full flex items-center justify-center p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentItem.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-[48px] p-12 shadow-xl border-4 border-amber-200 max-w-2xl w-full flex flex-col items-center justify-center gap-8 cursor-pointer relative overflow-hidden"
            onClick={() => {
              playSound('pop');
              speak(currentItem.en);
            }}
          >
              <div className="bg-blue-50 w-full py-12 md:py-16 rounded-[32px] flex flex-col items-center border-2 border-blue-100">
              <div className="w-40 h-40 md:w-56 md:h-56 bg-blue-200 rounded-full flex items-center justify-center shadow-inner">
                {IconComponent && <IconComponent size={80} className="md:w-[120px] md:h-[120px] text-blue-700" strokeWidth={2} />}
              </div>
            </div>
            
            <div className="text-center mt-4 bg-orange-50 w-full py-10 rounded-[32px] border-2 border-orange-100 flex flex-col items-center justify-center">
              <h1 className="text-4xl md:text-6xl font-black text-blue-900 mb-2 uppercase tracking-widest leading-none text-center px-4 break-words w-full">{currentItem.en}</h1>
              <p className="text-xl md:text-[28px] text-amber-600 font-bold italic tracking-wider text-center">({currentItem.es})</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </ActivityLayout>
  );
}
