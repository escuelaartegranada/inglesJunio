import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Screen } from '../types';
import ActivityLayout from './ActivityLayout';
import { playSound, speak } from '../utils';
import { Pencil, Eraser, Trash2, Download, PaintBucket, Circle, Square, Wand2 } from 'lucide-react';
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
  const [mode, setMode] = useState<'pencil' | 'eraser' | 'bucket' | 'circle' | 'square' | 'rainbow'>('pencil');
  const [color, setColor] = useState('#3b82f6'); // blue
  const [hasDrawn, setHasDrawn] = useState(false);
  const [startPos, setStartPos] = useState<{x: number, y: number} | null>(null);
  const [snapshot, setSnapshot] = useState<ImageData | null>(null);
  const hueRef = useRef(0);
  const { addScore } = useScore();

  const [strokeWidth, setStrokeWidth] = useState<'thin' | 'medium' | 'thick'>('medium');

  const gameItems = useMemo(() => {
    return [...VOCABULARY].sort(() => Math.random() - 0.5);
  }, []);
  
  const currentItem = gameItems[level - 1];

  const colors = [
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#1e293b',
    '#f43f5e', '#06b6d4', '#8b5cf6', '#14b8a6', '#64748b'
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

    const baseWidth = strokeWidth === 'thin' ? 4 : strokeWidth === 'medium' ? 12 : 24;
    
    if (mode === 'circle' || mode === 'square') {
        if (!startPos || !snapshot) return;
        ctx.putImageData(snapshot, 0, 0);
        ctx.lineWidth = baseWidth;
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

    ctx.lineWidth = mode === 'eraser' ? 40 : baseWidth;
    
    if (mode === 'rainbow') {
        hueRef.current = (hueRef.current + 2) % 360;
        ctx.strokeStyle = `hsl(${hueRef.current}, 100%, 50%)`;
    } else {
        ctx.strokeStyle = mode === 'eraser' ? '#ffffff' : color;
    }

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
        <div className="flex flex-row lg:flex-col w-full lg:w-48 bg-white p-3 lg:p-6 rounded-[24px] lg:rounded-[48px] border-4 border-amber-200 shadow-xl shrink-0 flex-wrap justify-center items-center gap-3 lg:gap-0">
          
          <div className="flex flex-row lg:flex-col justify-center items-center gap-2 lg:gap-4 shrink-0 flex-wrap">
            <button 
              onClick={() => { playSound('click'); setMode('pencil'); speak('Pencil'); }}
              className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all bg-white border-4 shrink-0 ${mode === 'pencil' ? 'border-amber-400 -translate-y-1' : 'border-slate-100 hover:border-slate-200'}`}
            >
              <Pencil size={24} className={mode === 'pencil' ? 'text-amber-500' : 'text-slate-400'} />
            </button>
            
            <button 
              onClick={() => { playSound('click'); setMode('eraser'); speak('Eraser'); }}
              className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all bg-white border-4 shrink-0 ${mode === 'eraser' ? 'border-pink-400 -translate-y-1' : 'border-slate-100 hover:border-slate-200'}`}
            >
              <Eraser size={24} className={mode === 'eraser' ? 'text-pink-500' : 'text-slate-400'} />
            </button>

            <button 
              onClick={() => { playSound('click'); setMode('bucket'); speak('Fill'); }}
              className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all bg-white border-4 shrink-0 ${mode === 'bucket' ? 'border-blue-400 -translate-y-1' : 'border-slate-100 hover:border-slate-200'}`}
            >
              <PaintBucket size={24} className={mode === 'bucket' ? 'text-blue-500' : 'text-slate-400'} />
            </button>

            <button 
              onClick={() => { playSound('click'); setMode('square'); speak('Square'); }}
              className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all bg-white border-4 shrink-0 ${mode === 'square' ? 'border-emerald-400 -translate-y-1' : 'border-slate-100 hover:border-slate-200'}`}
            >
              <Square size={24} className={mode === 'square' ? 'text-emerald-500' : 'text-slate-400'} />
            </button>

            <button 
              onClick={() => { playSound('click'); setMode('circle'); speak('Circle'); }}
              className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all bg-white border-4 shrink-0 ${mode === 'circle' ? 'border-purple-400 -translate-y-1' : 'border-slate-100 hover:border-slate-200'}`}
            >
              <Circle size={24} className={mode === 'circle' ? 'text-purple-500' : 'text-slate-400'} />
            </button>

            <button 
              onClick={() => { playSound('click'); setMode('rainbow'); speak('Rainbow'); }}
              className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all bg-white border-4 shrink-0 ${mode === 'rainbow' ? 'border-pink-400 -translate-y-1' : 'border-slate-100 hover:border-slate-200'} overflow-hidden relative`}
            >
              {mode === 'rainbow' && <div className="absolute inset-0 bg-gradient-to-br from-rose-100 via-fuchsia-100 to-indigo-100 opacity-50" />}
              <Wand2 size={24} className={`relative z-10 ${mode === 'rainbow' ? 'text-rose-500' : 'text-slate-400'}`} />
            </button>
          </div>

          <div className="hidden lg:block w-1 max-h-12 lg:h-1 lg:w-full bg-amber-100 rounded-full mx-1 lg:mx-0 lg:my-4 shrink-0"></div>

          {/* Line widths */}
          <div className="flex flex-row lg:flex-col gap-2 lg:gap-3 items-center justify-center shrink-0">
             <button onClick={() => { playSound('click'); setStrokeWidth('thin'); }} className={`w-10 h-10 flex items-center justify-center rounded-xl border-2 transition-all shrink-0 ${strokeWidth === 'thin' ? 'border-amber-400 bg-amber-50' : 'border-transparent'}`}>
                <div className="bg-slate-800 rounded-full w-2 h-2"></div>
             </button>
             <button onClick={() => { playSound('click'); setStrokeWidth('medium'); }} className={`w-10 h-10 flex items-center justify-center rounded-xl border-2 transition-all shrink-0 ${strokeWidth === 'medium' ? 'border-amber-400 bg-amber-50' : 'border-transparent'}`}>
                <div className="bg-slate-800 rounded-full w-4 h-4"></div>
             </button>
             <button onClick={() => { playSound('click'); setStrokeWidth('thick'); }} className={`w-10 h-10 flex items-center justify-center rounded-xl border-2 transition-all shrink-0 ${strokeWidth === 'thick' ? 'border-amber-400 bg-amber-50' : 'border-transparent'}`}>
                <div className="bg-slate-800 rounded-full w-6 h-6"></div>
             </button>
          </div>

          <div className="hidden lg:block w-1 max-h-12 lg:h-1 lg:w-full bg-amber-100 rounded-full mx-1 lg:mx-0 lg:my-4 shrink-0"></div>

          {/* Color palette */}
          <div className="flex flex-row lg:grid lg:grid-cols-2 gap-2 justify-items-center relative shrink-0 flex-wrap">
            {colors.map(c => (
              <button
                key={c}
                onClick={() => { playSound('click'); setColor(c); if(mode==='eraser' || mode==='rainbow') setMode('pencil'); }}
                className={`w-10 h-10 rounded-full border-b-4 transition-all shrink-0 ${color === c && mode !== 'eraser' && mode !== 'rainbow' ? 'scale-110 border-transparent shadow-lg -translate-y-1' : 'border-black/20 hover:-translate-y-1 shadow-sm'}`}
                style={{ backgroundColor: c }}
              />
            ))}
            <label 
               className={`w-10 h-10 rounded-full border-b-4 transition-all cursor-pointer flex items-center justify-center bg-[conic-gradient(from_0deg,red,yellow,lime,aqua,blue,magenta,red)] overflow-hidden relative shrink-0 ${!colors.includes(color) && mode !== 'eraser' && mode !== 'rainbow' ? 'scale-110 border-transparent shadow-lg -translate-y-1' : 'border-black/20 hover:-translate-y-1 shadow-sm'}`}
            >
              <input 
                type="color" 
                value={color} 
                onChange={(e) => { setColor(e.target.value); if(mode==='eraser' || mode==='rainbow') setMode('pencil'); }}
                className="opacity-0 w-[200%] h-[200%] cursor-pointer absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              />
            </label>
          </div>

          <div className="hidden lg:block flex-1 mt-6"></div>

          {/* Actions */}
          <div className="flex flex-row lg:flex-col gap-2 lg:gap-4 lg:mt-auto items-center justify-center shrink-0">
             <button 
               onClick={handleClear}
               className="w-12 h-12 lg:w-16 lg:h-16 bg-rose-50 text-rose-500 border-2 border-rose-200 rounded-2xl lg:rounded-3xl flex items-center justify-center hover:bg-rose-100 hover:border-rose-300 transition-colors shrink-0"
             >
               <Trash2 size={24} />
             </button>
             <button 
               onClick={handleSave}
               className="flex w-12 h-12 lg:w-16 lg:h-16 bg-emerald-50 text-emerald-600 border-2 border-emerald-200 rounded-2xl lg:rounded-3xl items-center justify-center hover:bg-emerald-100 hover:border-emerald-300 transition-colors shrink-0"
             >
               <Download size={24} />
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
