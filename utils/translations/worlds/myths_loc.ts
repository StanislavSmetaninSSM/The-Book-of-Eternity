
import { britainLoc } from './myths/britain_loc';
import { trojanWarLoc } from './myths/trojan_war_loc';

export const mythsLoc = {
  en: {
    ...britainLoc.en,
    ...trojanWarLoc.en,
  },
  ru: {
    ...britainLoc.ru,
    ...trojanWarLoc.ru,
  }
};