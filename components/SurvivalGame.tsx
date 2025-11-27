
import React, { useState, useEffect } from 'react';
import { Player, Language } from '../types';

interface SurvivalGameProps {
  players: Player[];
  onGameOver: (loserIndex: number) => void;
  language: Language;
}

export const SurvivalGame: React.FC<SurvivalGameProps> = ({ players, onGameOver, language }) => {
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [fuses, setFuses] = useState<boolean[]>(Array(12).fill(false)); // 12 circular fuses
  const [trapIndex, setTrapIndex] = useState<number>(0);
  const [exploded, setExploded] = useState(false);

  useEffect(() => {
    // Reset game
    setFuses(Array(12).fill(false));
    setTrapIndex(Math.floor(Math.random() * 12));
    setExploded(false);
    setCurrentPlayerIndex(0);
  }, [players]);

  const handleFuseClick = (index: number) => {
    if (exploded || fuses[index]) return;

    if (index === trapIndex) {
      // Boom!
      setExploded(true);
      const newFuses = [...fuses];
      newFuses[index] = true;
      setFuses(newFuses);
      
      // Delay for explosion animation
      setTimeout(() => {
        onGameOver(currentPlayerIndex);
      }, 1500);
    } else {
      // Safe
      const newFuses = [...fuses];
      newFuses[index] = true;
      setFuses(newFuses);
      // Next player
      setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
    }
  };

  const getLabel = () => {
     if (exploded) {
       switch(language) {
         case Language.KO: return "폭발 감지!";
         case Language.TL: return "Sumabog na!";
         default: return "EXPLOSION DETECTED!";
       }
     }
     switch(language) {
       case Language.KO: return "코어 안정화 중...";
       case Language.TL: return "Pumili ng fuse...";
       default: return "Stabilizing Core...";
     }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative min-h-[400px]">
      
      {/* Turn Indicator */}
      <div className="absolute top-0 z-20 flex flex-col items-center animate-fade-in">
        <span className="text-gray-400 text-xs uppercase tracking-widest mb-1">
          {language === Language.KO ? '현재 순서' : (language === Language.TL ? 'Turno ni' : 'Current Turn')}
        </span>
        <div 
          className="px-6 py-2 rounded-full border border-neon-blue bg-black/50 backdrop-blur-md flex items-center gap-3 shadow-[0_0_15px_rgba(0,255,255,0.3)] transition-all duration-300"
          style={{ borderColor: players[currentPlayerIndex].color }}
        >
          <div 
            className="w-3 h-3 rounded-full animate-pulse" 
            style={{ backgroundColor: players[currentPlayerIndex].color, boxShadow: `0 0 10px ${players[currentPlayerIndex].color}` }} 
          />
          <span className="font-bold text-lg" style={{ color: players[currentPlayerIndex].color }}>
            {players[currentPlayerIndex].name}
          </span>
        </div>
      </div>

      {/* The Reactor Core (Central Game) */}
      <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center mt-12">
        
        {/* Central Core */}
        <div className={`absolute w-32 h-32 rounded-full z-10 flex items-center justify-center transition-all duration-500
          ${exploded 
            ? 'bg-red-600 shadow-[0_0_100px_red] animate-pulse scale-110' 
            : 'bg-gray-900 shadow-[0_0_50px_rgba(0,255,255,0.2)]'
          } border-4 border-gray-700`}
        >
           <div className={`text-4xl transition-transform duration-200 ${exploded ? 'scale-150' : 'scale-100'}`}>
             {exploded ? '☢️' : '⚡'}
           </div>
        </div>

        {/* Fuses / Nodes arranged in a circle */}
        {fuses.map((isCut, index) => {
          // Calculate position on circle
          const total = 12;
          const radius = 130; // Distance from center
          const angle = (index / total) * 2 * Math.PI - (Math.PI / 2); // Start from top
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          const isTrap = index === trapIndex && exploded;

          return (
            <button
              key={index}
              onClick={() => handleFuseClick(index)}
              disabled={isCut || exploded}
              className={`absolute w-12 h-12 rounded-full border-2 transition-all duration-300 flex items-center justify-center z-20
                ${isCut 
                  ? isTrap 
                    ? 'bg-red-500 border-red-500 shadow-[0_0_30px_red] scale-125' // Exploded Trap
                    : 'bg-gray-800 border-gray-700 opacity-40 scale-90' // Safe & Cut
                  : 'bg-gray-900 border-neon-blue shadow-[0_0_10px_rgba(0,255,255,0.5)] hover:bg-neon-blue hover:text-black hover:scale-110 cursor-pointer' // Active
                }
              `}
              style={{
                transform: `translate(${x}px, ${y}px)`,
              }}
            >
              <span className="text-xs font-bold">
                 {isCut ? (isTrap ? '!!!' : 'OFF') : index + 1}
              </span>
            </button>
          );
        })}

        {/* Connecting Lines (Decorative) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30 z-0">
          <circle cx="50%" cy="50%" r="130" fill="none" stroke="#00ffff" strokeWidth="1" strokeDasharray="4 4" className={exploded ? 'stroke-red-500' : 'animate-spin-slow'} />
          <circle cx="50%" cy="50%" r="65" fill="none" stroke={exploded ? 'red' : '#bf00ff'} strokeWidth="2" className="animate-pulse" />
        </svg>

      </div>

      <div className={`mt-10 text-lg font-bold tracking-widest ${exploded ? 'text-red-500 animate-bounce' : 'text-neon-blue animate-pulse'}`}>
        {getLabel()}
      </div>
    </div>
  );
};
