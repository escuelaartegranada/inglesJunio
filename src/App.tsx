import { useState } from 'react';
import { Screen } from './types';
import Home from './components/Home';
import Lessons from './components/Lessons';
import TickCross from './components/TickCross';
import DragDrop from './components/DragDrop';
import Arrows from './components/Arrows';
import WordSearch from './components/WordSearch';
import Drawing from './components/Drawing';
import { Volume2 } from 'lucide-react';
import { speak } from './utils';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [showOrientationHint, setShowOrientationHint] = useState(true);

  // Auto-hide hint after 5 seconds
  if (showOrientationHint) {
    setTimeout(() => setShowOrientationHint(false), 5000);
  }

  const navigate = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  return (
    <div className="min-h-screen bg-amber-50 text-slate-900 font-sans selection:bg-blue-200 select-none overflow-x-hidden">
      {/* Orientation Hint Overlay */}
      {showOrientationHint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-500/90 text-white p-6 transition-opacity duration-1000"
             onClick={() => setShowOrientationHint(false)}>
          <div className="text-center max-w-lg bg-white/10 p-8 rounded-3xl backdrop-blur-sm border border-white/20 shadow-2xl">
            <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-4">
              Turn your tablet sideways <br/> for the best game!
              <button onClick={(e) => { e.stopPropagation(); speak('Turn your tablet sideways for the best game!'); }} className="p-3 bg-white/20 rounded-full hover:bg-white/30 active:scale-95 transition-all">
                 <Volume2 size={32} />
              </button>
            </h2>
            <p className="text-xl text-blue-100">
              Para una mejor experiencia, usa la tablet en horizontal.
            </p>
            <p className="mt-8 text-sm opacity-60 uppercase tracking-widest font-bold">Tap to continue</p>
          </div>
        </div>
      )}

      {currentScreen === 'home' && <Home onNavigate={navigate} />}
      {currentScreen === 'lessons' && <Lessons onNavigate={navigate} />}
      {currentScreen === 'tick-cross' && <TickCross onNavigate={navigate} />}
      {currentScreen === 'drag-drop' && <DragDrop onNavigate={navigate} />}
      {currentScreen === 'arrows' && <Arrows onNavigate={navigate} />}
      {currentScreen === 'word-search' && <WordSearch onNavigate={navigate} />}
      {currentScreen === 'drawing' && <Drawing onNavigate={navigate} />}
    </div>
  );
}
