
import { gameData } from './localizationGameData';
import { translations } from './localizationTranslations';
import { Language } from '../types';

export const translate = (lang: Language, key: string, replacements?: Record<string, string | number>): string => {
  if (typeof key !== 'string' || !key) {
    return '';
  }
  let translation = translations[lang]?.[key] || translations['en']?.[key] || key;
  
  if (replacements) {
    Object.keys(replacements).forEach(rKey => {
      translation = translation.replace(`{${rKey}}`, String(replacements[rKey]));
    });
  }

  // Defensive patch for malformed newline characters in translation files.
  if (translation.includes('|n')) {
    translation = translation.replace(/\|n/g, '\n');
  }

  return translation;
};

export { gameData };