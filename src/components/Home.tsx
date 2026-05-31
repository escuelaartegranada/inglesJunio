import { Screen } from '../types';
import { playSound, speak } from '../utils';
import { 
  BookOpen, 
  CheckSquare, 
  Hand, 
  Move, 
  Type, 
  Palette,
  Volume2,
  Star,
  Maximize
} from 'lucide-react';
import { useScore } from '../ScoreContext';
import SpanishReveal from './SpanishReveal';

interface HomeProps {
  onNavigate: (screen: Screen) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const { score } = useScore();
  const games = [
    { id: 'lessons', name: 'Lessons', desc: 'Aprender palabras', icon: BookOpen, color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { id: 'tick-cross', name: 'Tick / Cross', desc: 'Puedo / No puedo', icon: CheckSquare, color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
    { id: 'drag-drop', name: 'Stickers', desc: 'Arrastrar palabras', icon: Hand, color: 'bg-amber-100 text-amber-700 border-amber-300' },
    { id: 'arrows', name: 'Arrows', desc: 'Atrapa las estrellas', icon: Move, color: 'bg-purple-100 text-purple-700 border-purple-300' },
    { id: 'word-search', name: 'Search', desc: 'Sopa de letras', icon: Type, color: 'bg-rose-100 text-rose-700 border-rose-300' },
    { id: 'drawing', name: 'Drawing', desc: '¡A dibujar!', icon: Palette, color: 'bg-cyan-100 text-cyan-700 border-cyan-300' },
  ] as const;

  const handleSelect = (id: Screen, name: string) => {
    playSound('click');
    speak(name);
    setTimeout(() => onNavigate(id), 600); // Wait for speech to start
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 bg-amber-50 overflow-y-auto overflow-x-hidden">
      <div className="w-full flex justify-between items-start mb-8 z-10 gap-2">
        <button
          onClick={() => {
            playSound('click');
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen().catch(e => console.error(e));
            } else {
              document.exitFullscreen().catch(e => console.error(e));
            }
          }}
          className="bg-white px-3 py-2 md:px-4 md:py-2 rounded-2xl md:rounded-3xl border-4 border-amber-200 shadow-lg text-amber-600 hover:bg-amber-50 active:translate-y-1 transition-all flex flex-col items-center shrink-0"
        >
          <Maximize size={24} className="md:w-8 md:h-8 mb-1" />
          <span className="text-[10px] md:text-xs font-black uppercase leading-none text-center">Pantalla<br/>Completa</span>
        </button>
      
        <div className="flex items-center gap-2 md:gap-3 bg-white px-4 py-2 md:px-6 md:py-4 rounded-full md:rounded-3xl border-2 md:border-4 border-amber-200 shadow-lg shrink-0">
           <Star className="text-amber-500 w-6 h-6 md:w-10 md:h-10 fill-amber-500" />
           <span className="text-2xl md:text-4xl font-black text-amber-700 leading-none">{score}</span>
        </div>
      </div>

      <div className="text-center mb-8 flex flex-col justify-center items-center mt-4">
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-blue-900 mb-2 drop-shadow-sm flex items-center justify-center gap-3 md:gap-6 uppercase tracking-tight flex-wrap w-full">
          <span>English Playbook</span>
          <button 
            onClick={() => { playSound('click'); speak('English Playbook. Choose a game!'); }}
            className="w-12 h-12 md:w-20 md:h-20 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg active:translate-y-1 active:shadow-md transition-all border-b-4 md:border-b-8 border-blue-700 hover:border-b-2 md:hover:border-b-4 hover:translate-y-1 shrink-0"
          >
            <Volume2 size={24} className="md:w-10 md:h-10" />
          </button>
        </h1>
        <h2 className="text-xl sm:text-2xl md:text-3xl text-blue-500 font-bold mb-4 md:mb-6 tracking-wide uppercase px-4 justify-center flex"><SpanishReveal text="(Juegos en Inglés)" /></h2>
        <div className="flex justify-center"><SpanishReveal text="¡Elige un juego! (Choose a game)" className="text-xl sm:text-2xl md:text-3xl text-amber-600 font-bold italic px-4" /></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 max-w-5xl w-full pb-12">
        {games.map((game) => (
          <button
            key={game.id}
            onClick={() => handleSelect(game.id as Screen, game.name)}
            className="flex flex-col flex-1 aspect-square items-center justify-center rounded-[48px] border-4 shadow-xl active:scale-95 transition-all p-4 bg-white border-amber-200 relative overflow-hidden group"
          >
            <div className={`p-8 rounded-[32px] mb-4 transition-transform group-hover:scale-110 ${game.color.split(' ')[0]}`}>
               <game.icon size={64} className={`${game.color.split(' ')[1]}`} strokeWidth={3} />
            </div>
            <span className="text-3xl font-black mb-2 tracking-widest uppercase text-blue-900 text-center leading-none">{game.name}</span>
            <span className="text-lg font-bold text-amber-600">{game.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
