import { useState, useEffect } from 'react';
import { Screen } from '../types';
import ActivityLayout from './ActivityLayout';
import { VOCABULARY } from '../data';
import { playSound, speak } from '../utils';
import * as Icons from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X } from 'lucide-react';
import { useScore } from '../ScoreContext';

interface Props {
  onNavigate: (screen: Screen) => void;
}

export default function TickCross({ onNavigate }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const { addScore } = useScore();

  const currentItem = VOCABULARY[currentIndex];

  useEffect(() => {
    speak(`Can you ${currentItem.en}?`);
  }, [currentIndex, currentItem.en]);

  const handleNext = () => {
    if (currentIndex < VOCABULARY.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      playSound('pop');
      setCurrentIndex(0);
      setAnswers({});
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleRepeat = () => {
    speak(`Can you ${currentItem.en}?`);
  };

  const handleAnswer = (canDoIt: boolean) => {
    if (answers[currentItem.id] !== undefined) return; // already answered
    playSound('correct');
    addScore(5); // points for participation
    setAnswers(prev => ({ ...prev, [currentItem.id]: canDoIt }));
    
    if (canDoIt) {
      speak(`I can ${currentItem.en}`);
    } else {
      speak(`I can't ${currentItem.en}`);
    }

    setTimeout(() => {
      handleNext();
    }, 1500);
  };

  const IconComponent = (Icons as any)[currentItem.icon] || Icons.Star;
  const answered = answers[currentItem.id];

  return (
    <ActivityLayout 
      title="Tick / Cross" 
      instructionText="Can you do it?"
      instructionEs="¿Puedes hacerlo?"
      onNavigate={onNavigate}
      onRepeatAudio={handleRepeat}
      onNext={handleNext}
      onPrev={currentIndex > 0 ? handlePrev : undefined}
      currentLevel={currentIndex + 1}
      totalLevels={VOCABULARY.length}
    >
      <div className="flex-1 w-full flex flex-col items-center justify-center p-8 max-w-5xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentItem.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center w-full"
          >
            <div className="bg-white rounded-[48px] border-4 border-amber-200 w-full max-w-2xl flex flex-col p-8 shadow-xl relative overflow-hidden items-center">
              <div className="w-full flex-1 flex flex-col items-center justify-center bg-blue-50 rounded-[32px] mb-8 py-12 border-2 border-blue-100">
                <div className="w-48 h-48 bg-blue-200 rounded-full flex items-center justify-center mb-8 shadow-inner">
                  {IconComponent && <IconComponent size={96} className="text-blue-700" strokeWidth={2} />}
                </div>
                <span className="text-[32px] md:text-[40px] font-black text-blue-900 uppercase tracking-widest text-center px-4 leading-none mb-4">
                  I can {currentItem.en}
                </span>
                <span className="text-[20px] md:text-[28px] font-bold text-amber-600 uppercase italic tracking-widest text-center px-4 leading-none">
                  (Puedo {currentItem.es})
                </span>
              </div>
              
              <div className="flex justify-center gap-10 w-full">
                <button 
                  onClick={() => handleAnswer(true)}
                  className={`w-32 h-32 md:w-40 md:h-40 bg-emerald-500 rounded-3xl flex items-center justify-center shadow-xl active:translate-y-1 transition-all border-b-8 border-emerald-700 hover:border-b-4 hover:translate-y-1 ${
                    answered === true ? 'outline-dashed outline-4 outline-emerald-300 outline-offset-4 scale-105' : ''
                  }`}
                >
                  <Check size={80} strokeWidth={4} className="text-white" />
                </button>

                <button 
                  onClick={() => handleAnswer(false)}
                  className={`w-32 h-32 md:w-40 md:h-40 bg-rose-500 rounded-3xl flex items-center justify-center shadow-xl active:translate-y-1 transition-all border-b-8 border-rose-700 hover:border-b-4 hover:translate-y-1 ${
                    answered === false ? 'outline-dashed outline-4 outline-rose-300 outline-offset-4 scale-105' : ''
                  }`}
                >
                  <X size={80} strokeWidth={4} className="text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </ActivityLayout>
  );
}
