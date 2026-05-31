import React, { useState, useRef, useEffect } from 'react';
import { Screen } from '../types';
import ActivityLayout from './ActivityLayout';
import { playSound, speak } from '../utils';
import { Pencil, Eraser, Trash2, Download } from 'lucide-react';
import { VOCABULARY } from '../data';
import { useScore } from '../ScoreContext';

interface Props {
  onNavigate: (screen: Screen) => void;
}

export default function Drawing({ onNavigate }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [level, setLevel] = useState(1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState<'pencil' | 'eraser'>('pencil');
  const [color, setColor] = useState('#3b82f6'); // blue
  const [hasDrawn, setHasDrawn] = useState(false);
  const { addScore } = useScore();
  
  const currentItem = VOCABULARY[level - 1];

  const colors = [
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#1e293b'
  ];

  useEffect(() => {
    speak(`Draw a ${currentItem.en}!`);
    initCanvas();
    setHasDrawn(false);
    window.addEventListener('resize', initCanvas);
    return () => window.removeEventListener('resize', initCanvas);
  }, [level, currentItem.en]); // Re-init on level to clear canvas optionally, or keep it. Let's clear on new prompt.

  const initCanvas = () => {
    if (!canvasRef.current || !containerRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleNext = () => {
    if (level < 100) {
      playSound('pop');
      if (hasDrawn) {
        addScore(10); // Reward for completing a drawing
      }
      setLevel(l => l + 1);
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    setHasDrawn(true);
    draw(e);
  };

  const endDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current) {
       const ctx = canvasRef.current.getContext('2d');
       if (ctx) ctx.beginPath();
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !canvasRef.current) return;
    e.preventDefault();
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineWidth = mode === 'eraser' ? 40 : 12;
    ctx.strokeStyle = mode === 'eraser' ? '#ffffff' : color;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleClear = () => {
    playSound('pop');
    setHasDrawn(false);
    initCanvas();
  };

  const handleSave = () => {
    playSound('correct');
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `my-${currentItem.en}-drawing.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
    speak('Drawing saved!');
  };

  return (
    <ActivityLayout 
      title="Drawing" 
      instructionText={`Draw a ${currentItem.en}!`}
      instructionEs={`¡Dibuja: ${currentItem.es.toUpperCase()}!`}
      onNavigate={onNavigate}
      onRepeatAudio={() => speak(`Draw a ${currentItem.en}!`)}
      currentLevel={level}
      totalLevels={100}
      onNext={level < 100 ? handleNext : undefined}
    >
      <div className="flex-1 w-full flex flex-col md:flex-row gap-6 p-4 md:p-8 max-w-[1400px]">
        {/* Tools Palette */}
        <div className="flex justify-center md:flex-col gap-4 bg-white p-6 rounded-[48px] border-4 border-amber-200 shadow-xl shrink-0">
          
          <button 
            onClick={() => { playSound('click'); setMode('pencil'); speak('Pencil'); }}
            className={`w-16 h-16 md:w-20 md:h-20 rounded-3xl flex items-center justify-center transition-all bg-white border-8 ${mode === 'pencil' ? 'border-amber-400 -translate-y-1' : 'border-slate-100 hover:border-slate-200'}`}
          >
            <Pencil size={36} className={mode === 'pencil' ? 'text-amber-500' : 'text-slate-400'} />
          </button>
          
          <button 
            onClick={() => { playSound('click'); setMode('eraser'); speak('Eraser'); }}
            className={`w-16 h-16 md:w-20 md:h-20 rounded-3xl flex items-center justify-center transition-all bg-white border-8 ${mode === 'eraser' ? 'border-pink-400 -translate-y-1' : 'border-slate-100 hover:border-slate-200'}`}
          >
            <Eraser size={36} className={mode === 'eraser' ? 'text-pink-500' : 'text-slate-400'} />
          </button>

          <div className="h-1 md:h-2 w-full bg-amber-100 rounded-full my-2"></div>

          {/* Color palette */}
          <div className="flex md:flex-col gap-4 items-center mt-2">
            {colors.map(c => (
              <button
                key={c}
                onClick={() => { playSound('click'); setColor(c); setMode('pencil'); }}
                className={`w-12 h-12 md:w-16 md:h-16 rounded-[24px] border-b-8 transition-all ${color === c && mode === 'pencil' ? 'scale-110 border-transparent shadow-lg -translate-y-1' : 'border-black/20 hover:-translate-y-1 shadow-sm'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <div className="flex-1"></div>

          {/* Actions */}
          <div className="flex md:flex-col gap-4 mt-auto pt-4">
             <button 
               onClick={handleClear}
               className="w-16 h-16 md:w-20 md:h-20 bg-rose-50 text-rose-500 border-2 border-rose-200 rounded-3xl flex items-center justify-center hover:bg-rose-100 hover:border-rose-300 transition-colors"
             >
               <Trash2 size={32} />
             </button>
             <button 
               onClick={handleSave}
               className="hidden md:flex w-16 h-16 md:w-20 md:h-20 bg-emerald-50 text-emerald-600 border-2 border-emerald-200 rounded-3xl items-center justify-center hover:bg-emerald-100 hover:border-emerald-300 transition-colors"
             >
               <Download size={32} />
             </button>
          </div>

        </div>

        {/* Canvas Area */}
        <div ref={containerRef} className="flex-1 w-full bg-white rounded-[48px] shadow-xl border-4 border-amber-200 overflow-hidden relative touch-none">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseUp={endDrawing}
            onMouseOut={endDrawing}
            onMouseMove={draw}
            onTouchStart={startDrawing}
            onTouchEnd={endDrawing}
            onTouchCancel={endDrawing}
            onTouchMove={draw}
            className="w-full h-full cursor-crosshair bg-white"
          />
        </div>
      </div>
    </ActivityLayout>
  );
}
