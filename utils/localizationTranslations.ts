import { general } from './translations/general';
import { itemQualities } from './translations/itemQualities';
import { damageTypes } from './translations/damageTypes';
import { characteristics } from './translations/characteristics';
import { startScreen } from './translations/startScreen';
import { ui } from './translations/ui';
import { help } from './translations/help';
import { settings } from './translations/settings';
import { fantasyLoc } from './translations/worlds/fantasy_loc';
import { sciFiLoc } from './translations/worlds/sci_fi_loc';
import { postApocalypseLoc } from './translations/worlds/post_apocalypse_loc';
import { modernLoc } from './translations/worlds/modern_loc';

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