import React, { useEffect, useState, useRef } from 'react';
import { Player } from '../types';

interface WheelProps {
  players: Player[];
  isSpinning: boolean;
  onSpinEnd: (winnerIndex: number) => void;
}

export const Wheel: React.FC<WheelProps> = ({ players, isSpinning, onSpinEnd }) => {
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);

  // Calculate segment size
  const segmentAngle = 360 / players.length;

  useEffect(() => {
    if (isSpinning) {
      // Random spin between 5 and 10 full rotations + random offset
      const randomOffset = Math.floor(Math.random() * 360);
      const spins = 1800 + 360 * 3; // Minimum spins
      const newRotation = rotation + spins + randomOffset;
      
      setRotation(newRotation);

      // Determine winner after animation
      const duration = 4000; // 4 seconds matching CSS transition
      setTimeout(() => {
        // Calculate the actual angle within 0-360
        // CSS rotates clockwise. The pointer is at top (0 deg).
        // The segment at the top is determined by: (360 - (finalDeg % 360)) % 360
        const finalAngle = newRotation % 360;
        const pointerAngle = (360 - finalAngle) % 360;
        
        // Ensure index is valid
        const winningIndex = Math.floor(pointerAngle / segmentAngle);
        // Correct index boundaries just in case
        const safeIndex = Math.min(Math.max(winningIndex, 0), players.length - 1);
        
        onSpinEnd(safeIndex);
      }, duration);
    }
  }, [isSpinning, players.length, segmentAngle, onSpinEnd]); // Removed 'rotation' from deps to avoid loop logic issues, strictly controlled by parent 'isSpinning'

  // Create conic gradient string
  const gradientParts = players.map((player, index) => {
    const start = index * segmentAngle;
    const end = (index + 1) * segmentAngle;
    return `${player.color} ${start}deg ${end}deg`;
  });
  const backgroundStyle = `conic-gradient(${gradientParts.join(', ')})`;

  return (
    <div className="relative w-72 h-72 sm:w-80 sm:h-80 mx-auto my-8">
      {/* Pointer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20 w-8 h-10">
        <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[20px] border-t-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
      </div>

      {/* The Wheel */}
      <div
        ref={wheelRef}
        className="w-full h-full rounded-full border-4 border-neon-panel shadow-[0_0_30px_rgba(191,0,255,0.3)] overflow-hidden relative"
        style={{
          background: backgroundStyle,
          transform: `rotate(${rotation}deg)`,
          transition: isSpinning ? 'transform 4s cubic-bezier(0.1, 0, 0.2, 1)' : 'none'
        }}
      >
        {/* Labels */}
        {players.map((player, index) => {
          // Position text in the middle of the segment
          const angle = (index * segmentAngle) + (segmentAngle / 2);
          return (
            <div
              key={player.id}
              className="absolute top-1/2 left-1/2 text-white font-bold text-sm sm:text-base drop-shadow-md origin-left"
              style={{
                transform: `rotate(${angle - 90}deg) translate(20%, -50%)`, // -90 because 0deg is right in CSS rotation context for absolute positioning usually, but here we align to center
                width: '45%',
                textAlign: 'right'
              }}
            >
              <span className="block truncate px-2" style={{ transform: 'rotate(90deg)', transformOrigin: 'right center' }}>
                 {/* Adjust text orientation if needed, keeping it simple for now */}
                 {player.name}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* Center Cap */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-neon-dark rounded-full border-2 border-white flex items-center justify-center z-10 shadow-lg">
        <span className="text-xl">👑</span>
      </div>
    </div>
  );
};