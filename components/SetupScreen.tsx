
import React, { useState } from 'react';
import { Player, Intensity, GameMode, Language } from '../types';

interface SetupScreenProps {
  players: Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  intensity: Intensity;
  setIntensity: (i: Intensity) => void;
  gameMode: GameMode;
  setGameMode: (m: GameMode) => void;
  language: Language;
  setLanguage: (l: Language) => void;
  onStartGame: () => void;
}

const COLORS = [
  '#FF0055', '#0033FF', '#00CC44', '#FFCC00', '#9900FF', '#FF6600', '#00CCFF', '#FF00CC'
];

export const SetupScreen: React.FC<SetupScreenProps> = ({ 
  players, setPlayers, intensity, setIntensity, gameMode, setGameMode, language, setLanguage, onStartGame 
}) => {
  const [newName, setNewName] = useState('');

  const translations = {
    [Language.KO]: { title: '왕게임', mode: '게임 모드', intensity: '수위 조절', players: '참가자 & 커플 설정', add: '추가', start: '게임 시작', wheel: '룰렛', survival: '서바이벌', mild: '순한맛', spicy: '매운맛', extreme: '19금🔥', input: '이름 입력', partner: '커플/파트너' },
    [Language.EN]: { title: "King's Game", mode: 'Game Mode', intensity: 'Intensity', players: 'Players & Couples', add: 'Add', start: 'Start Game', wheel: 'Roulette', survival: 'Survival', mild: 'Mild', spicy: 'Spicy', extreme: '19+🔥', input: 'Enter Name', partner: 'Partner' },
    [Language.TL]: { title: "King's Game", mode: 'Laro Mode', intensity: 'Intensity', players: 'Manlalaro & Partner', add: 'Dagdag', start: 'Simulan', wheel: 'Roulette', survival: 'Survival', mild: 'Banayad', spicy: 'Maanghang', extreme: '19+🔥', input: 'Pangalan', partner: 'Partner' }
  };

  const t = translations[language];

  const addPlayer = () => {
    if (newName.trim()) {
      const color = COLORS[players.length % COLORS.length];
      setPlayers([...players, { id: Date.now().toString(), name: newName.trim(), color }]);
      setNewName('');
    }
  };

  const removePlayer = (id: string) => {
    // If player had a partner, clear the partner's link too
    setPlayers(players.filter(p => p.id !== id).map(p => 
      p.partnerId === id ? { ...p, partnerId: undefined } : p
    ));
  };

  const setPartner = (playerId: string, partnerId: string) => {
    const newPlayers = [...players];
    
    // Clear old links if any
    const playerIndex = newPlayers.findIndex(p => p.id === playerId);
    const oldPartnerId = newPlayers[playerIndex].partnerId;
    
    // If selecting "None" (empty string)
    if (!partnerId) {
       newPlayers[playerIndex].partnerId = undefined;
       // If they had a partner, clear that partner's link
       if (oldPartnerId) {
         const oldPartnerIndex = newPlayers.findIndex(p => p.id === oldPartnerId);
         if (oldPartnerIndex !== -1) newPlayers[oldPartnerIndex].partnerId = undefined;
       }
    } else {
       // Linking A and B
       
       // 1. Break A's old bond
       if (oldPartnerId) {
         const oldIdx = newPlayers.findIndex(p => p.id === oldPartnerId);
         if (oldIdx !== -1) newPlayers[oldIdx].partnerId = undefined;
       }

       // 2. Break B's old bond
       const targetIndex = newPlayers.findIndex(p => p.id === partnerId);
       const targetOldPartnerId = newPlayers[targetIndex].partnerId;
       if (targetOldPartnerId) {
          const targetOldIdx = newPlayers.findIndex(p => p.id === targetOldPartnerId);
          if (targetOldIdx !== -1) newPlayers[targetOldIdx].partnerId = undefined;
       }

       // 3. Link A and B
       newPlayers[playerIndex].partnerId = partnerId;
       newPlayers[targetIndex].partnerId = playerId;
    }

    setPlayers(newPlayers);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') addPlayer();
  };

  return (
    <div className="flex flex-col h-full max-w-md mx-auto p-4 sm:p-6 pb-24"> {/* Added padding bottom for scrolling */}
      
      {/* Language Switcher */}
      <div className="flex justify-end gap-2 mb-4">
        {(Object.keys(Language) as Array<keyof typeof Language>).map((lang) => (
          <button
            key={lang}
            onClick={() => setLanguage(Language[lang])}
            className={`px-3 py-1 rounded text-xs font-bold border ${
              language === Language[lang] 
              ? 'bg-neon-pink text-white border-neon-pink' 
              : 'bg-transparent text-gray-500 border-gray-700'
            }`}
          >
            {lang}
          </button>
        ))}
      </div>

      <h1 className="text-4xl font-extrabold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-neon-blue drop-shadow-[0_0_10px_rgba(255,0,255,0.5)]">
        {t.title} <span className="text-sm align-top bg-red-600 text-white px-1 rounded">19+</span>
      </h1>

      {/* Game Mode Selector */}
      <div className="bg-neon-panel p-3 rounded-xl mb-4 shadow-lg border border-gray-800">
        <h2 className="text-gray-300 mb-2 font-semibold text-xs uppercase tracking-wider">{t.mode}</h2>
        <div className="flex gap-2">
           <button
             onClick={() => setGameMode(GameMode.WHEEL)}
             className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all border ${
               gameMode === GameMode.WHEEL
                 ? 'bg-neon-dark border-neon-pink text-neon-pink shadow-[0_0_10px_rgba(255,0,255,0.3)]'
                 : 'bg-gray-800 border-transparent text-gray-500 hover:bg-gray-700'
             }`}
           >
             🎡 {t.wheel}
           </button>
           <button
             onClick={() => setGameMode(GameMode.SURVIVAL)}
             className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all border ${
               gameMode === GameMode.SURVIVAL
                 ? 'bg-neon-dark border-neon-blue text-neon-blue shadow-[0_0_10px_rgba(0,255,255,0.3)]'
                 : 'bg-gray-800 border-transparent text-gray-500 hover:bg-gray-700'
             }`}
           >
             💣 {t.survival}
           </button>
        </div>
      </div>

      {/* Intensity Selector */}
      <div className="bg-neon-panel p-3 rounded-xl mb-4 shadow-lg border border-gray-800">
        <h2 className="text-gray-300 mb-2 font-semibold text-xs uppercase tracking-wider">{t.intensity}</h2>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(Intensity) as Array<keyof typeof Intensity>).map((key) => (
            <button
              key={key}
              onClick={() => setIntensity(Intensity[key])}
              className={`py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                intensity === Intensity[key]
                  ? key === 'EXTREME' 
                    ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.6)]'
                    : 'bg-neon-blue text-black shadow-[0_0_15px_rgba(0,255,255,0.6)]'
                  : 'bg-gray-800 text-gray-500 hover:bg-gray-700'
              }`}
            >
              {key === 'MILD' ? t.mild : key === 'SPICY' ? t.spicy : t.extreme}
            </button>
          ))}
        </div>
      </div>

      {/* Player List */}
      <div className="flex-1 overflow-y-auto mb-4 custom-scrollbar min-h-0">
        <h2 className="text-gray-300 mb-2 font-semibold text-xs uppercase">{t.players}</h2>
        <div className="space-y-3">
          {players.map((p) => (
            <div key={p.id} className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full shadow-[0_0_8px]" style={{ backgroundColor: p.color, boxShadow: `0 0 8px ${p.color}` }} />
                  <span className="font-bold text-lg">{p.name}</span>
                </div>
                <button 
                  onClick={() => removePlayer(p.id)}
                  className="text-gray-500 hover:text-red-500 px-2"
                >
                  ✕
                </button>
              </div>
              
              {/* Partner Select */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">❤️ {t.partner}:</span>
                <select
                  value={p.partnerId || ""}
                  onChange={(e) => setPartner(p.id, e.target.value)}
                  className="bg-gray-900 text-xs text-white border border-gray-600 rounded px-2 py-1 flex-1 focus:outline-none focus:border-neon-pink"
                >
                  <option value="">-- None --</option>
                  {players.filter(other => other.id !== p.id).map(other => (
                    <option key={other.id} value={other.id}>
                      {other.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
          {players.length === 0 && (
            <div className="text-center text-gray-600 py-4">Add players to start.</div>
          )}
        </div>
      </div>

      {/* Add Player Input */}
      <div className="flex gap-2 mb-4 mt-auto">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t.input}
          className="flex-1 bg-gray-900 border border-neon-purple rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neon-pink text-white placeholder-gray-600"
        />
        <button
          onClick={addPlayer}
          className="bg-neon-purple hover:bg-fuchsia-700 text-white px-6 rounded-lg font-bold transition-colors"
        >
          {t.add}
        </button>
      </div>

      <button
        onClick={onStartGame}
        disabled={players.length < 2}
        className={`w-full py-4 rounded-xl text-xl font-black uppercase tracking-widest shadow-lg transition-all transform active:scale-95 ${
          players.length < 2 
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-neon-pink to-red-600 text-white hover:from-fuchsia-500 hover:to-red-500 shadow-[0_0_20px_rgba(255,0,128,0.4)]'
        }`}
      >
        {t.start}
      </button>
    </div>
  );
};
