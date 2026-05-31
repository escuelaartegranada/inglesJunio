import React, { useState, useEffect, useRef } from 'react';
import { Screen } from '../types';
import ActivityLayout from './ActivityLayout';
import { playSound, speak } from '../utils';
import { VOCABULARY } from '../data';
import { useScore } from '../ScoreContext';
import SpanishReveal from './SpanishReveal';

interface Props {
  onNavigate: (screen: Screen) => void;
}

export default function WordSearch({ onNavigate }: Props) {
  const [level, setLevel] = useState(1);
  const [grid, setGrid] = useState<string[][]>([]);
  const [words, setWords] = useState<{en: string, es: string}[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [selectedCells, setSelectedCells] = useState<{r: number, c: number, id: string}[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const { addScore } = useScore();

  useEffect(() => {
    generateLevel();
    speak(`Level ${level}. Find the words!`);
  }, [level]);

  const generateLevel = () => {
    // Pick 4 random words <= 6 chars
    const pool = VOCABULARY.filter(v => v.en.length <= 6 && !v.en.includes(' '));
    const chosen: {en: string, es: string}[] = [];
    while (chosen.length < 4) {
      const item = pool[Math.floor(Math.random() * pool.length)];
      if (!chosen.find(c => c.en === item.en)) chosen.push(item);
    }
    
    setWords(chosen);
    setFoundWords([]);
    
    const size = 8;
    const newGrid = Array(size).fill('').map(() => Array(size).fill(''));
    // Simple placement
    chosen.forEach(wordObj => {
        const uppercaseWord = wordObj.en.toUpperCase();
        let placed = false;
        let attempts = 0;
        while (!placed && attempts < 200) {
          attempts++;
          const isHorizontal = Math.random() > 0.5;
          if (isHorizontal) {
             const row = Math.floor(Math.random() * size);
             const col = Math.floor(Math.random() * (size - uppercaseWord.length + 1));
             let canPlace = true;
             for(let i=0; i<uppercaseWord.length; i++) {
                if (newGrid[row][col+i] !== '' && newGrid[row][col+i] !== uppercaseWord[i]) canPlace = false;
             }
             if (canPlace) {
                for(let i=0; i<uppercaseWord.length; i++) newGrid[row][col+i] = uppercaseWord[i];
                placed = true;
             }
          } else {
             const col = Math.floor(Math.random() * size);
             const row = Math.floor(Math.random() * (size - uppercaseWord.length + 1));
             let canPlace = true;
             for(let i=0; i<uppercaseWord.length; i++) {
                if (newGrid[row+i][col] !== '' && newGrid[row+i][col] !== uppercaseWord[i]) canPlace = false;
             }
             if (canPlace) {
                for(let i=0; i<uppercaseWord.length; i++) newGrid[row+i][col] = uppercaseWord[i];
                placed = true;
             }
          }
        }
    });

    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for(let r=0; r<size; r++){
      for(let c=0; c<size; c++){
         if (newGrid[r][c] === '') newGrid[r][c] = letters.charAt(Math.floor(Math.random() * letters.length));
      }
    }
    setGrid(newGrid);
  };

  const handleNextLevel = () => {
    if (level < 100) {
      playSound('pop');
      setLevel(l => l + 1);
    }
  };

  const handleRepeat = () => {
    speak(`Can you find, ${words.map(w => w.en).join(', ')}?`);
  };

  const getCellFromEvent = (e: React.TouchEvent | React.MouseEvent): HTMLElement | null => {
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    const element = document.elementFromPoint(clientX, clientY);
    return element?.closest('div[data-row]') as HTMLElement;
  };

  const addCell = (el: HTMLElement) => {
    if (!el) return;
    const r = parseInt(el.dataset.row!);
    const c = parseInt(el.dataset.col!);
    const id = `${r}-${c}`;
    
    setSelectedCells(prev => {
      if (!prev.find(p => p.id === id)) {
        playSound('click');
        return [...prev, {r, c, id}];
      }
      return prev;
    });
  };

  const startSelection = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    setIsSelecting(true);
    setSelectedCells([]);
    const el = getCellFromEvent(e);
    if (el) addCell(el);
  };

  const moveSelection = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isSelecting) return;
    e.preventDefault();
    const el = getCellFromEvent(e);
    if (el) addCell(el);
  };

  const endSelection = () => {
    setIsSelecting(false);
    const selectedWord1 = selectedCells.map(cell => grid[cell.r][cell.c]).join('');
    const selectedWord2 = [...selectedCells].reverse().map(cell => grid[cell.r][cell.c]).join('');
    
    let found = false;
    for (const w of words) {
      const uw = w.en.toUpperCase();
      if ((selectedWord1 === uw || selectedWord2 === uw) && !foundWords.includes(w.en)) {
        playSound('correct');
        speak(w.en);
        addScore(15);
        setFoundWords(prev => [...prev, w.en]);
        found = true;
        break;
      }
    }

    if (!found) {
      playSound('wrong');
    }
    setSelectedCells([]);
  };

  const allFound = foundWords.length === words.length && words.length > 0;

  return (
    <ActivityLayout 
      title="Word Search" 
      instructionText={allFound ? "You found them all!" : "Find the words!"}
      instructionEs="¡Encuentra las palabras en inglés! Desliza el dedo."
      onNavigate={onNavigate}
      onRepeatAudio={handleRepeat}
      onNext={allFound && level < 100 ? handleNextLevel : undefined}
      currentLevel={level}
      totalLevels={100}
    >
      <div className="flex-1 w-full flex flex-col lg:flex-row items-center justify-center p-4 md:p-8 gap-8 md:gap-12">
        
        {/* Word List */}
        <div className="flex flex-row lg:flex-col gap-4 lg:gap-6 bg-white p-4 md:p-8 rounded-[40px] border-4 border-amber-200 shadow-xl shrink-0 flex-wrap justify-center items-center w-full lg:w-auto">
          <button 
            onClick={() => { playSound('pop'); speak('Help! Find these words.'); }}
            className="hidden md:flex flex-col items-center justify-center mb-4 py-4 px-8 bg-blue-500 text-white rounded-3xl border-b-8 border-blue-700 active:translate-y-1 hover:border-b-4 hover:translate-y-1 transition-all shadow-lg"
          >
            <span className="font-black text-2xl leading-none">HELP</span>
            <div className="mt-1"><SpanishReveal text="(Ayuda)" className="text-sm !text-blue-200 mt-1 uppercase tracking-wider" /></div>
          </button>
          
          {words.map(w => (
            <div 
              key={w.en} 
              className={`flex flex-col mb-2 ${foundWords.includes(w.en) ? 'opacity-50' : ''}`}
            >
              <span className={`text-4xl md:text-5xl font-black uppercase tracking-widest ${foundWords.includes(w.en) ? 'text-emerald-500 line-through' : 'text-blue-900'}`}>
                {w.en}
              </span>
              <SpanishReveal text={`(${w.es})`} className="text-xl md:text-2xl font-bold text-amber-600 italic" />
            </div>
          ))}
        </div>

        {/* Grid */}
        <div 
          ref={gridRef}
          className="bg-white p-6 rounded-[48px] border-4 border-amber-200 shadow-xl touch-none select-none relative inline-block"
          onMouseDown={startSelection}
          onMouseMove={moveSelection}
          onMouseUp={endSelection}
          onMouseLeave={() => setIsSelecting(false)}
          onTouchStart={startSelection}
          onTouchMove={moveSelection}
          onTouchEnd={endSelection}
        >
          {allFound && (
            <div className="absolute inset-0 bg-white/90 rounded-[48px] z-20 flex items-center justify-center pointer-events-none backdrop-blur-sm">
              <div className="flex flex-col items-center text-emerald-500 -rotate-12 drop-shadow-lg">
                <span className="text-6xl md:text-8xl font-black uppercase tracking-tight">WELL DONE!</span>
                <div className="mt-2"><SpanishReveal text="(¡BIEN HECHO!)" className="text-3xl md:text-4xl font-bold tracking-tight text-emerald-600" /></div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-8 gap-2 bg-blue-50 p-6 rounded-[32px]">
            {grid.map((row, r) => (
              row.map((letter, c) => {
                const id = `${r}-${c}`;
                const isSelected = selectedCells.some(cell => cell.id === id);
                return (
                  <div 
                    key={id} 
                    data-row={r} 
                    data-col={c}
                    className={`w-12 h-12 md:w-16 md:h-16 flex items-center justify-center text-3xl md:text-[40px] font-black rounded-2xl transition-colors cursor-pointer uppercase select-none
                      ${isSelected ? 'bg-amber-400 text-white shadow-inner' : 'bg-white text-blue-900 shadow-md border-b-4 border-slate-200'}`}
                  >
                    {letter}
                  </div>
                );
              })
            ))}
          </div>
        </div>

      </div>
    </ActivityLayout>
  );
}
