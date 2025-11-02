
import { europe13thCenturyLoc } from './history/europe_13th_century_loc';
import { antiquityLoc } from './history/antiquity_loc';

export const historyLoc = {
  en: {
    ...europe13thCenturyLoc.en,
    ...antiquityLoc.en,
  },
  ru: {
    ...europe13thCenturyLoc.ru,
    ...antiquityLoc.ru,
  }
};
