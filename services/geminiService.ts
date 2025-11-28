
import { GoogleGenAI, Type } from "@google/genai";
import { Intensity, PunishmentResponse, GameMode, Language, Player } from "../types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
const modelName = "gemini-2.5-flash";

export const generatePunishment = async (
  intensity: Intensity, 
  winner: Player, 
  allPlayers: Player[],
  history: string[],
  gameMode: GameMode,
  language: Language
): Promise<PunishmentResponse> => {
  
  // Identify Partner
  const partner = winner.partnerId ? allPlayers.find(p => p.id === winner.partnerId) : null;
  
  // Identify Potential Targets (excluding self)
  let targetName = "Random Person";
  let relationshipContext = "";

  if (partner) {
    targetName = partner.name;
    relationshipContext = `CRITICAL RULE: ${winner.name} is a COUPLE with ${partner.name}. The punishment MUST involve ONLY these two interacting. Do NOT involve others in physical contact.`;
  } else {
    const others = allPlayers.filter(p => p.id !== winner.id);
    const randomOther = others.length > 0 ? others[Math.floor(Math.random() * others.length)] : null;
    targetName = randomOther ? randomOther.name : "Anyone";
    relationshipContext = `${winner.name} is SINGLE. They can interact with ${targetName}.`;
  }

  // Intensity Context
  let promptContext = "";
  switch (intensity) {
    case Intensity.MILD:
      promptContext = "Funny, light physical challenge, drinking penalty, or embarrassing confession. Nothing sexual. Focus on laughter.";
      break;
    case Intensity.SPICY:
      promptContext = "Flirty, romantic, physical closeness (hugs, whispering, touching faces, love shot). Rated PG-13.";
      break;
    case Intensity.EXTREME:
      promptContext = "Risque, '19+' adult party game challenge. Intense physical contact, moans, sexy poses, or deep secrets. Bold and hot.";
      break;
  }

  const prompt = `
    Context: We are playing an adult party game (King's Game / Roulette).
    Winner/Victim: ${winner.name}
    Partner/Target: ${targetName}
    Relationship Status: ${relationshipContext}
    Intensity Level: ${intensity} (Description: ${promptContext})
    
    Previous Punishments (AVOID THESE):
    ${JSON.stringify(history.slice(-10))} 

    Instructions:
    1. Create a unique punishment for the Winner.
    2. Ideally, it involves the Partner/Target.
    3. Occasionally (10% chance), make EVERYONE do something.
    4. Provide the result in 3 languages: Korean (ko), English (en), and Tagalog (tl).
    5. Keep it short and clear.

    Return JSON with 'ko', 'en', 'tl', and 'emoji'.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ko: { type: Type.STRING },
            en: { type: Type.STRING },
            tl: { type: Type.STRING },
            emoji: { type: Type.STRING }
          },
          required: ["ko", "en", "tl", "emoji"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return {
      ko: result.ko || "다같이 한잔해!",
      en: result.en || "Everyone drink!",
      tl: result.tl || "Tagay tayong lahat!",
      emoji: result.emoji || "🍻"
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      ko: "다같이 한잔해! (오류 발생)",
      en: "Everyone drink! (Error occurred)",
      tl: "Tagay tayong lahat! (May Error)",
      emoji: "🍻"
    };
  }
};
