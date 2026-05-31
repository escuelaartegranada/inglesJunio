import React, { useState, useRef, useEffect } from 'react';
import { Screen } from '../types';
import ActivityLayout from './ActivityLayout';
import { playSound, speak } from '../utils';
import { Pencil, Eraser, Trash2, Download, PaintBucket, Circle, Square } from 'lucide-react';
import { VOCABULARY } from '../data';
import { useScore } from '../ScoreContext';
import { fillCanvas } from './floodFill';

interface Props {
  onNavigate: (screen: Screen) => void;
}

export default function Drawing({ onNavigate }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [level, setLevel] = useState(1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState<'pencil' | 'eraser' | 'bucket' | 'circle' | 'square'>('pencil');
  const [color, setColor] = useState('#3b82f6'); // blue
  const [hasDrawn, setHasDrawn] = useState(false);
  const [startPos, setStartPos] = useState<{x: number, y: number} | null>(null);
  const [snapshot, setSnapshot] = useState<ImageData | null>(null);
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
    if (!canvasRef.current) return;
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

    if (mode === 'bucket') {
       fillCanvas(ctx, x, y, color);
       setHasDrawn(true);
       return;
    }

    if (mode === 'circle' || mode === 'square') {
       setSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height));
       setStartPos({x, y});
    }

    setIsDrawing(true);
    setHasDrawn(true);
    draw(e, true);
  };

  const endDrawing = () => {
    setIsDrawing(false);
    setStartPos(null);
    setSnapshot(null);
    if (canvasRef.current) {
       const ctx = canvasRef.current.getContext('2d');
       if (ctx) ctx.beginPath();
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent, isStart = false) => {
    if ((!isDrawing && !isStart) || !canvasRef.current || mode === 'bucket') return;
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

    if (mode === 'circle' || mode === 'square') {
        if (!startPos || !snapshot) return;
        ctx.putImageData(snapshot, 0, 0);
        ctx.lineWidth = 6;
        ctx.strokeStyle = color;
        ctx.beginPath();
        if (mode === 'square') {
           ctx.rect(startPos.x, startPos.y, x - startPos.x, y - startPos.y);
        } else if (mode === 'circle') {
           const radius = Math.sqrt(Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2));
           ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
        }
        ctx.stroke();
        return;
    }

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
      <div className="flex-1 w-full flex flex-col lg:flex-row gap-6 p-4 md:p-8 max-w-[1400px]">
        {/* Tools Palette */}
        <div className="flex flex-row lg:flex-col justify-center items-center gap-4 bg-white p-4 md:p-6 rounded-[32px] md:rounded-[48px] border-4 border-amber-200 shadow-xl shrink-0 flex-wrap">
          
          <button 
            onClick={() => { playSound('click'); setMode('pencil'); speak('Pencil'); }}
            className={`w-14 h-14 md:w-16 md:h-16 rounded-3xl flex items-center justify-center transition-all bg-white border-4 ${mode === 'pencil' ? 'border-amber-400 -translate-y-1' : 'border-slate-100 hover:border-slate-200'}`}
          >
            <Pencil size={24} className={mode === 'pencil' ? 'text-amber-500' : 'text-slate-400'} />
          </button>
          
          <button 
            onClick={() => { playSound('click'); setMode('eraser'); speak('Eraser'); }}
            className={`w-14 h-14 md:w-16 md:h-16 rounded-3xl flex items-center justify-center transition-all bg-white border-4 ${mode === 'eraser' ? 'border-pink-400 -translate-y-1' : 'border-slate-100 hover:border-slate-200'}`}
          >
            <Eraser size={24} className={mode === 'eraser' ? 'text-pink-500' : 'text-slate-400'} />
          </button>

          <button 
            onClick={() => { playSound('click'); setMode('bucket'); speak('Fill'); }}
            className={`w-14 h-14 md:w-16 md:h-16 rounded-3xl flex items-center justify-center transition-all bg-white border-4 ${mode === 'bucket' ? 'border-blue-400 -translate-y-1' : 'border-slate-100 hover:border-slate-200'}`}
          >
            <PaintBucket size={24} className={mode === 'bucket' ? 'text-blue-500' : 'text-slate-400'} />
          </button>

          <button 
            onClick={() => { playSound('click'); setMode('square'); speak('Square'); }}
            className={`w-14 h-14 md:w-16 md:h-16 rounded-3xl flex items-center justify-center transition-all bg-white border-4 ${mode === 'square' ? 'border-emerald-400 -translate-y-1' : 'border-slate-100 hover:border-slate-200'}`}
          >
            <Square size={24} className={mode === 'square' ? 'text-emerald-500' : 'text-slate-400'} />
          </button>

          <button 
            onClick={() => { playSound('click'); setMode('circle'); speak('Circle'); }}
            className={`w-14 h-14 md:w-16 md:h-16 rounded-3xl flex items-center justify-center transition-all bg-white border-4 ${mode === 'circle' ? 'border-purple-400 -translate-y-1' : 'border-slate-100 hover:border-slate-200'}`}
          >
            <Circle size={24} className={mode === 'circle' ? 'text-purple-500' : 'text-slate-400'} />
          </button>

          <div className="h-1 md:h-2 w-full bg-amber-100 rounded-full my-1"></div>

          {/* Color palette */}
          <div className="flex md:flex-col gap-4 items-center mt-2">
            {colors.map(c => (
              <button
                key={c}
                onClick={() => { playSound('click'); setColor(c); if(mode==='eraser') setMode('pencil'); }}
                className={`w-10 h-10 md:w-14 md:h-14 rounded-full border-b-4 transition-all ${color === c && mode !== 'eraser' ? 'scale-110 border-transparent shadow-lg -translate-y-1' : 'border-black/20 hover:-translate-y-1 shadow-sm'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <div className="flex-1"></div>

          {/* Actions */}
          <div className="flex lg:flex-col gap-4 lg:mt-auto pt-0 lg:pt-4 items-center">
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
