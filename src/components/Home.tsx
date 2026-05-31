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
  Star
} from 'lucide-react';
import { useScore } from '../ScoreContext';

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
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-amber-50">
      <div className="absolute top-8 left-8">
        {/* Simple title for parents, invisible to kids mostly or just welcoming */}
      </div>
      
      <div className="absolute top-8 right-8 flex items-center gap-3 bg-white px-6 py-4 rounded-3xl border-4 border-amber-200 shadow-lg">
         <Star className="text-amber-500 w-10 h-10 fill-amber-500" />
         <span className="text-4xl font-black text-amber-700">{score}</span>
      </div>

      <div className="text-center mb-16">
        <h1 className="text-5xl md:text-7xl font-black text-blue-900 mb-2 drop-shadow-sm flex items-center justify-center gap-6 uppercase tracking-tight">
          English Playbook
          <button 
            onClick={() => { playSound('click'); speak('English Playbook. Choose a game!'); }}
            className="w-20 h-20 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg active:translate-y-1 active:shadow-md transition-all border-b-8 border-blue-700 hover:border-b-4 hover:translate-y-1"
          >
            <Volume2 size={40} />
          </button>
        </h1>
        <h2 className="text-3xl text-blue-500 font-bold mb-6 tracking-wide uppercase">(Juegos en Inglés)</h2>
        <p className="text-3xl text-amber-600 font-bold italic">¡Elige un juego! (Choose a game)</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-10 max-w-5xl w-full">
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
