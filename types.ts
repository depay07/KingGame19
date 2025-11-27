
export interface Player {
  id: string;
  name: string;
  color: string;
  partnerId?: string; // ID of the partner
}

export enum GamePhase {
  SETUP = 'SETUP',
  PLAYING = 'PLAYING', 
  RESULT = 'RESULT',
}

export enum GameMode {
  WHEEL = 'WHEEL',       
  SURVIVAL = 'SURVIVAL', 
}

export enum Intensity {
  MILD = 'MILD',
  SPICY = 'SPICY', 
  EXTREME = 'EXTREME'
}

export enum Language {
  KO = 'KO',
  EN = 'EN',
  TL = 'TL' // Tagalog
}

export interface PunishmentResponse {
  ko: string;
  en: string;
  tl: string;
  emoji: string;
}
