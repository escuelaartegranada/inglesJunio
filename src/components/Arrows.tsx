import React, { useState, useEffect } from 'react';
import { Screen } from '../types';
import ActivityLayout from './ActivityLayout';
import { playSound, speak } from '../utils';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Smile, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { useScore } from '../ScoreContext';

interface Props {
  onNavigate: (screen: Screen) => void;
}

export default function Arrows({ onNavigate }: Props) {
  const [level, setLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [target, setTarget] = useState({ x: 80, y: -80 });
  const [jiggling, setJiggling] = useState(false);
  const { addScore } = useScore();

  useEffect(() => {
    speak(`Level ${level}. Catch the star!`);
  }, [level]);

  const generateNewTarget = (currentX: number, currentY: number) => {
    const validXs = [-160, -80, 0, 80, 160];
    const validYs = [-80, 0, 80];
    let newX = currentX;
    let newY = currentY;
    while (newX === currentX && newY === currentY) {
      newX = validXs[Math.floor(Math.random() * validXs.length)];
      newY = validYs[Math.floor(Math.random() * validYs.length)];
    }
    setTarget({ x: newX, y: newY });
  };

  const handleRepeat = () => {
    speak('Move the character to the star with the arrows');
  };

  const move = (dir: string) => {
    playSound('pop');
    speak(dir);
    setJiggling(true);
    setTimeout(() => setJiggling(false), 300);

    const step = 80;
    setPosition(prev => {
      let newX = prev.x;
      let newY = prev.y;
      
      switch(dir) {
        case 'up': newY -= step; break;
        case 'down': newY += step; break;
        case 'left': newX -= step; break;
        case 'right': newX += step; break;
      }
      
      newX = Math.max(-160, Math.min(160, newX));
      newY = Math.max(-80, Math.min(80, newY));
      
      if (newX === target.x && newY === target.y) {
         setTimeout(() => {
            playSound('correct');
            addScore(5); // points for catching a star
            if (level < 100) {
              setLevel(l => l + 1);
              generateNewTarget(newX, newY);
            } else {
              speak('Amazing! 100 levels complete!');
            }
         }, 400); // Check after motion
      }

      return { x: newX, y: newY };
    });
  };

  return (
    <ActivityLayout 
      title="Arrows" 
      instructionText="Catch the star!"
      instructionEs="¡Atrapa la estrella usando las flechas!"
      onNavigate={onNavigate}
      onRepeatAudio={handleRepeat}
      currentLevel={level}
      totalLevels={100}
    >
      <div className="flex-1 w-full flex flex-col lg:flex-row items-center justify-between p-4 md:p-8 gap-8 md:gap-12">
        
        {/* Play Area */}
        <div className="flex-1 bg-white rounded-[48px] p-4 shadow-xl border-4 border-amber-200 min-h-[40vh] md:h-[60vh] w-full flex items-center justify-center relative overflow-hidden shrink-0">
          {/* Grid background effect */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-300 to-transparent bg-[length:40px_40px]"></div>
          
          <div className="relative" style={{ width: 400, height: 240 }}>
              {/* Note: The container is 400x240, Center is (0,0). X: [-160, 160], Y: [-80, 80] are 80px steps away from center */}
              <motion.div
                animate={{ x: target.x, y: target.y }}
                className="absolute shadow-sm"
                style={{ top: '50%', left: '50%', marginLeft: -40, marginTop: -40, width: 80, height: 80 }}
              >
                  <div className="w-full h-full text-amber-500 drop-shadow-md flex items-center justify-center animate-pulse">
                     <Star size={64} fill="currentColor" />
                  </div>
              </motion.div>

              <motion.div
                animate={{ 
                  x: position.x, 
                  y: position.y,
                  rotate: jiggling ? [-10, 10, -10, 0] : 0 
                }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="w-20 h-20 bg-purple-500 rounded-[20px] flex items-center justify-center shadow-lg border-b-8 border-purple-700 text-white z-10 absolute"
                style={{ top: '50%', left: '50%', marginLeft: -40, marginTop: -40 }}
              >
                <Smile size={60} strokeWidth={2.5} />
              </motion.div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center justify-center gap-4 bg-white p-8 rounded-[48px] border-4 border-amber-200 shadow-xl shrink-0">
           <button 
             onClick={() => move('up')}
             className="w-28 h-28 bg-blue-500 border-b-8 border-blue-700 rounded-3xl flex flex-col items-center justify-center text-white hover:-translate-y-1 active:translate-y-1 hover:border-b-4 transition-all shadow-md"
           >
             <ArrowUp size={40} strokeWidth={3} />
             <span className="font-black text-xl uppercase mt-1 leading-none">UP</span>
             <span className="font-bold text-[12px] text-blue-200 uppercase tracking-widest mt-1">(arriba)</span>
           </button>
           <div className="flex gap-4">
             <button 
               onClick={() => move('left')}
               className="w-28 h-28 bg-rose-500 border-b-8 border-rose-700 rounded-3xl flex flex-col items-center justify-center text-white hover:-translate-y-1 active:translate-y-1 hover:border-b-4 transition-all shadow-md"
             >
               <ArrowLeft size={40} strokeWidth={3} />
               <span className="font-black text-xl uppercase mt-1 leading-none">LEFT</span>
               <span className="font-bold text-[12px] text-rose-200 uppercase tracking-widest mt-1">(izq.)</span>
             </button>
             <button 
               onClick={() => move('down')}
               className="w-28 h-28 bg-green-500 border-b-8 border-green-700 rounded-3xl flex flex-col items-center justify-center text-white hover:-translate-y-1 active:translate-y-1 hover:border-b-4 transition-all shadow-md"
             >
               <ArrowDown size={40} strokeWidth={3} />
               <span className="font-black text-xl uppercase mt-1 leading-none">DOWN</span>
               <span className="font-bold text-[12px] text-green-200 uppercase tracking-widest mt-1">(abajo)</span>
             </button>
             <button 
               onClick={() => move('right')}
               className="w-28 h-28 bg-amber-500 border-b-8 border-amber-700 rounded-3xl flex flex-col items-center justify-center text-white hover:-translate-y-1 active:translate-y-1 hover:border-b-4 transition-all shadow-md"
             >
               <ArrowRight size={40} strokeWidth={3} />
               <span className="font-black text-xl uppercase mt-1 leading-none">RIGHT</span>
               <span className="font-bold text-[12px] text-amber-200 uppercase tracking-widest mt-1">(der.)</span>
             </button>
           </div>
        </div>

      </div>
    </ActivityLayout>
  );
}
