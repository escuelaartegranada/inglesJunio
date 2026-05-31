import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ScoreProvider } from './ScoreContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ScoreProvider>
      <App />
    </ScoreProvider>
  </StrictMode>,
);
