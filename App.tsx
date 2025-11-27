
import React, { useState } from 'react';
import { Player, GamePhase, GameMode, Intensity, PunishmentResponse, Language } from './types';
import { SetupScreen } from './components/SetupScreen';
import { Wheel } from './components/Wheel';
import { SurvivalGame } from './components/SurvivalGame';
import { ResultModal } from './components/ResultModal';
import { generatePunishment } from './services/geminiService';

const App: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: '철수 (Chulsoo)', color: '#FF0055' },
    { id: '2', name: '영희 (Younghee)', color: '#0033FF' },
  ]);
  const [intensity, setIntensity] = useState<Intensity>(Intensity.SPICY);
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.WHEEL);
  const [language, setLanguage] = useState<Language>(Language.KO);
  const [gamePhase, setGamePhase] = useState<GamePhase>(GamePhase.SETUP);
  
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
  const [currentPunishment, setCurrentPunishment] = useState<PunishmentResponse | null>(null);
  const [loadingPunishment, setLoadingPunishment] = useState(false);
  
  // History of punishments
  const [punishmentHistory, setPunishmentHistory] = useState<string[]>([]);

  // Round counter to force reset of game components
  const [roundCount, setRoundCount] = useState(0);

  // Wheel specific state
  const [isWheelSpinning, setIsWheelSpinning] = useState(false);

  const handleStartGame = () => {
    setGamePhase(GamePhase.PLAYING);
    setIsWheelSpinning(false);
    setRoundCount(prev => prev + 1);
  };

  const handleGameEnd = async (index: number) => {
    setIsWheelSpinning(false);
    setWinnerIndex(index);
    setGamePhase(GamePhase.RESULT);
    
    setLoadingPunishment(true);
    const winner = players[index];
    
    const punishment = await generatePunishment(
      intensity, 
      winner, 
      players, 
      punishmentHistory,
      gameMode,
      language
    );
    
    setCurrentPunishment(punishment);
    setPunishmentHistory(prev => [...prev, punishment.en]); // Store English version for consistency in history
    setLoadingPunishment(false);
  };

  const spinWheel = () => {
    if (isWheelSpinning) return;
    setIsWheelSpinning(true);
    setWinnerIndex(null);
    setCurrentPunishment(null);
  };

  const nextRound = () => {
    setGamePhase(GamePhase.PLAYING);
    setWinnerIndex(null);
    setCurrentPunishment(null);
    setIsWheelSpinning(false);
    setRoundCount(prev => prev + 1); // Increment round to reset Survival/Wheel states
  };

  const goBackToSetup = () => {
    setGamePhase(GamePhase.SETUP);
    setIsWheelSpinning(false);
    setRoundCount(0);
  };

  const getLabel = (key: string) => {
    const labels: Record<Language, Record<string, string>> = {
      [Language.KO]: { setting: '설정', wheel: '룰렛', survival: '서바이벌', mild: '순한맛', spicy: '매운맛', extreme: '19금', wheelTitle: '누가 왕이 될까?', survivalTitle: '지뢰를 피하세요!', spin: '돌리기!' },
      [Language.EN]: { setting: 'Setup', wheel: 'Roulette', survival: 'Survival', mild: 'Mild', spicy: 'Spicy', extreme: '19+', wheelTitle: 'Who is the King?', survivalTitle: 'Avoid the Mine!', spin: 'SPIN!' },
      [Language.TL]: { setting: 'Setup', wheel: 'Roulette', survival: 'Survival', mild: 'Banayad', spicy: 'Maanghang', extreme: '19+', wheelTitle: 'Sino ang Hari?', survivalTitle: 'Iwasan ang Bomba!', spin: 'IKOT!' },
    };
    return labels[language][key] || key;
  };

  return (
    <div className="min-h-screen w-full bg-neon-dark text-white flex flex-col overflow-hidden relative font-sans">
      
      {/* Dynamic Background Pattern */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none perspective-grid"></div>
      <div className="fixed inset-0 z-0 bg-gradient-to-t from-black via-transparent to-black opacity-80 pointer-events-none"></div>

      {gamePhase === GamePhase.SETUP && (
        <div className="relative z-10 w-full h-full">
          <SetupScreen 
            players={players} 
            setPlayers={setPlayers} 
            intensity={intensity} 
            setIntensity={setIntensity}
            gameMode={gameMode}
            setGameMode={setGameMode}
            language={language}
            setLanguage={setLanguage}
            onStartGame={handleStartGame}
          />
        </div>
      )}

      {(gamePhase === GamePhase.PLAYING || gamePhase === GamePhase.RESULT) && (
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 w-full h-full">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20 bg-gradient-to-b from-black/80 to-transparent">
             <button onClick={goBackToSetup} className="text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
               <span className="text-lg">↩</span> <span className="text-sm font-bold">{getLabel('setting')}</span>
             </button>
             <div className="flex gap-2">
                <div className="bg-gray-800/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold border border-gray-600 shadow-md">
                  {gameMode === GameMode.WHEEL ? `🎡 ${getLabel('wheel')}` : `💣 ${getLabel('survival')}`}
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold border shadow-md ${
                    intensity === Intensity.EXTREME ? 'border-red-600 text-red-500 bg-red-900/30' : 'border-neon-blue text-neon-blue bg-blue-900/30'
                  }`}>
                  {intensity === Intensity.MILD ? `🟢 ${getLabel('mild')}` : intensity === Intensity.SPICY ? `🟡 ${getLabel('spicy')}` : `🔴 ${getLabel('extreme')}`}
                </div>
             </div>
          </div>

          <div className="mt-16 mb-6 w-full text-center relative z-10">
             <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-white to-neon-purple drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">
               {gameMode === GameMode.WHEEL 
                 ? (isWheelSpinning ? "..." : getLabel('wheelTitle')) 
                 : getLabel('survivalTitle')}
             </h2>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center w-full max-w-lg">
            {gameMode === GameMode.WHEEL ? (
              <>
                <div className="transform scale-90 sm:scale-100 transition-transform">
                  <Wheel 
                    key={roundCount} // Force re-render on new round
                    players={players} 
                    isSpinning={isWheelSpinning} 
                    onSpinEnd={handleGameEnd} 
                  />
                </div>
                <div className="mt-10 w-full px-8">
                  <button
                    onClick={spinWheel}
                    disabled={isWheelSpinning}
                    className={`w-full py-4 rounded-2xl text-2xl font-black uppercase tracking-widest shadow-[0_0_25px_rgba(191,0,255,0.4)] transition-all transform active:scale-95 ${
                      isWheelSpinning 
                        ? 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700'
                        : 'bg-gradient-to-r from-neon-blue to-neon-purple text-white hover:brightness-110 border border-white/20'
                    }`}
                  >
                    {isWheelSpinning ? '...' : getLabel('spin')}
                  </button>
                </div>
              </>
            ) : (
              <SurvivalGame 
                key={roundCount} // Force re-render (reset mines) on new round
                players={players}
                onGameOver={handleGameEnd}
                language={language}
              />
            )}
          </div>
        </div>
      )}

      {gamePhase === GamePhase.RESULT && winnerIndex !== null && (
        <ResultModal
          winnerName={players[winnerIndex].name}
          punishment={currentPunishment}
          loading={loadingPunishment}
          onNext={nextRound}
          onBack={goBackToSetup}
          language={language}
          setLanguage={setLanguage}
        />
      )}
    </div>
  );
};

export default App;
