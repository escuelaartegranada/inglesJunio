import React, { createContext, useContext, useState, useEffect } from 'react';

type ScoreContextType = {
  score: number;
  addScore: (points: number) => void;
};

export const ScoreContext = createContext<ScoreContextType>({ score: 0, addScore: () => {} });

export const ScoreProvider = ({ children }: { children: React.ReactNode }) => {
  const [score, setScore] = useState(() => {
    const saved = localStorage.getItem('playbook_score');
    return saved ? parseInt(saved) : 0;
  });

  useEffect(() => {
    localStorage.setItem('playbook_score', score.toString());
  }, [score]);

  return (
    <ScoreContext.Provider value={{ score, addScore: (p) => setScore(s => s + p) }}>
      {children}
    </ScoreContext.Provider>
  );
};

export const useScore = () => useContext(ScoreContext);
