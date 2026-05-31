import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { playSound } from '../utils';

interface Props {
  text: string;
  className?: string;
}

export default function SpanishReveal({ text, className = '' }: Props) {
  const [revealed, setRevealed] = useState(false);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSound('click');
    setRevealed(!revealed);
  };

  if (!revealed) {
    return (
      <button 
        onClick={toggle}
        className={`inline-flex items-center justify-center gap-2 bg-amber-100 text-amber-500 px-3 py-1 rounded-2xl border-2 border-amber-200 hover:bg-amber-200 transition-colors ${className}`}
        title="Mostrar español"
      >
        <Eye size={20} />
      </button>
    );
  }

  return (
    <div 
      onClick={toggle}
      className={`inline-flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity ${className}`}
      title="Ocultar español"
    >
      <span>{text}</span>
      <EyeOff size={16} className="opacity-50" />
    </div>
  );
}
