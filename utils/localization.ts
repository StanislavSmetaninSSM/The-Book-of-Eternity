
import { gameData } from './localizationGameData';
import { translations } from './localizationTranslations';
import { Language } from '../types';

export const translate = (lang: Language, key: string, replacements?: Record<string, string | number>): string => {
  let translation = translations[lang]?.[key] || translations['en']?.[key] || key;
  
  if (replacements) {
    Object.keys(replacements).forEach(rKey => {
      translation = translation.replace(`{${rKey}}`, String(replacements[rKey]));
    });
  }

  return translation;
};

export { gameData };
