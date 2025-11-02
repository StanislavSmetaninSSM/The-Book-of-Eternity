import { general } from './translations/general';
import { itemQualities } from './translations/itemQualities';
import { damageTypes } from './translations/damageTypes';
import { characteristics } from './translations/characteristics';
import { ui } from './translations/ui/ui';
import { fantasyLoc } from './translations/worlds/fantasy_loc';
import { sciFiLoc } from './translations/worlds/sci_fi_loc';
import { postApocalypseLoc } from './translations/worlds/post_apocalypse_loc';
import { modernLoc } from './translations/worlds/modern_loc';
import { historyLoc } from './translations/worlds/history_loc';
import { mythsLoc } from './translations/worlds/myths_loc';

export const translations: Record<string, Record<string, string>> = {
  en: {
    ...general.en,
    ...itemQualities.en,
    ...damageTypes.en,
    ...characteristics.en,
    ...ui.en,
    ...fantasyLoc.en,
    ...sciFiLoc.en,
    ...postApocalypseLoc.en,
    ...modernLoc.en,
    ...historyLoc.en,
    ...mythsLoc.en,
  },
  ru: {
    ...general.ru,
    ...itemQualities.ru,
    ...damageTypes.ru,
    ...characteristics.ru,
    ...ui.ru,
    ...fantasyLoc.ru,
    ...sciFiLoc.ru,
    ...postApocalypseLoc.ru,
    ...modernLoc.ru,
    ...historyLoc.ru,
    ...mythsLoc.ru,
  }
};