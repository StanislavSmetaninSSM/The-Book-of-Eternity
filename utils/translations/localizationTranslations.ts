import { general } from './general';
import { itemQualities } from './itemQualities';
import { damageTypes } from './damageTypes';
import { characteristics } from './characteristics';
import { startScreen } from './startScreen';
import { ui } from './ui';
import { help } from './help';
import { settings } from './settings';
import { fantasyLoc } from './worlds/fantasy_loc';
import { sciFiLoc } from './worlds/sci_fi_loc';
import { postApocalypseLoc } from './worlds/post_apocalypse_loc';
import { modernLoc } from './worlds/modern_loc';

export const translations: Record<string, Record<string, string>> = {
  en: {
    ...general.en,
    ...itemQualities.en,
    ...damageTypes.en,
    ...characteristics.en,
    ...startScreen.en,
    ...ui.en,
    ...help.en,
    ...settings.en,
    ...fantasyLoc.en,
    ...sciFiLoc.en,
    ...postApocalypseLoc.en,
    ...modernLoc.en,
  },
  ru: {
    ...general.ru,
    ...itemQualities.ru,
    ...damageTypes.ru,
    ...characteristics.ru,
    ...startScreen.ru,
    ...ui.ru,
    ...help.ru,
    ...settings.ru,
    ...fantasyLoc.ru,
    ...sciFiLoc.ru,
    ...postApocalypseLoc.ru,
    ...modernLoc.ru,
  }
};