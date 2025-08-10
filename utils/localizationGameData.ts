

import { fantasyWorld } from './translations/worlds/fantasy';
import { sciFiWorld } from './translations/worlds/sci_fi';
import { postApocalypseWorld } from './translations/worlds/post_apocalypse';
import { urbanMythWorld } from './translations/worlds/modern';
import { europe13thCenturyWorld } from './translations/worlds/europe_13th_century';
import { antiquityWorld } from './translations/worlds/antiquity';
import { kingArthursBritainWorld } from './translations/worlds/myths/britain';
import { trojanWarWorld } from './translations/worlds/myths/trojan_war';

export const gameData = {
  fantasy: fantasyWorld,
  sci_fi: sciFiWorld,
  post_apocalypse: postApocalypseWorld,
  urban_myth: urbanMythWorld,
  history: {
    europe_13th_century: europe13thCenturyWorld,
    antiquity: antiquityWorld,
  },
  myths: {
    king_arthurs_britain: kingArthursBritainWorld,
    trojan_war: trojanWarWorld,
  },
};