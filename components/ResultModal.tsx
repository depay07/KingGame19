
import React from 'react';
import { PunishmentResponse, Language } from '../types';

interface ResultModalProps {
  winnerName: string;
  punishment: PunishmentResponse | null;
  loading: boolean;
  onNext: () => void;
  onBack: () => void;
  language: Language;
  setLanguage: (l: Language) => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({ 
  winnerName, punishment, loading, onNext, onBack, language, setLanguage 
}) => {
  
  const getDisplayText = () => {
    if (!punishment) return "";
    switch (language) {
      case Language.KO: return punishment.ko;
      case Language.EN: return punishment.en;
      case Language.TL: return punishment.tl;
      default: return punishment.en;
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="bg-neon-panel border-2 border-neon-blue w-full max-w-sm rounded-2xl p-6 shadow-[0_0_50px_rgba(0,255,255,0.3)] flex flex-col items-center text-center relative overflow-hidden">
        
        {/* Background Glow */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-pink via-neon-purple to-neon-blue"></div>

        {/* Back Button */}
        <button 
          onClick={onBack}
          className="absolute top-4 right-4 text-gray-500 hover:text-white"
        >
          ✕
        </button>

        <div className="mb-2 text-neon-blue font-bold tracking-widest uppercase text-sm animate-pulse">Winner</div>
        <h2 className="text-4xl font-black text-white mb-6 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">{winnerName}</h2>

        {/* Language Tabs */}
        {!loading && punishment && (
          <div className="flex gap-2 mb-4">
            {(Object.keys(Language) as Array<keyof typeof Language>).map((langKey) => (
              <button
                key={langKey}
                onClick={() => setLanguage(Language[langKey])}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
                  language === Language[langKey]
                    ? 'bg-neon-pink text-white shadow-[0_0_10px_rgba(255,0,255,0.5)]'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {langKey}
              </button>
            ))}
          </div>
        )}

        <div className="w-full bg-gray-900/90 rounded-xl p-6 min-h-[180px] flex flex-col items-center justify-center border border-gray-700 mb-6 shadow-inner relative">
          {loading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-neon-pink border-t-transparent rounded-full animate-spin"></div>
              <p className="text-neon-pink animate-pulse text-sm font-semibold tracking-wider">GENERATING PUNISHMENT...</p>
            </div>
          ) : (
            <>
              <div className="text-6xl mb-4 animate-bounce">{punishment?.emoji}</div>
              <p className="text-xl font-bold text-gray-100 leading-relaxed break-keep">
                {getDisplayText()}
              </p>
            </>
          )}
        </div>

        <button
          onClick={onNext}
          disabled={loading}
          className="w-full bg-gradient-to-r from-neon-purple to-neon-pink hover:from-fuchsia-600 hover:to-pink-600 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(255,0,255,0.4)] transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 uppercase tracking-wider"
        >
          {language === Language.KO ? '다음 라운드' : (language === Language.TL ? 'Susunod na Round' : 'Next Round')}
        </button>
      </div>
    </div>
  );
};
