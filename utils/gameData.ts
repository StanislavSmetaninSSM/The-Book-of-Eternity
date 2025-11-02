import { fantasyWorld } from './translations/worlds/fantasy';
import { sciFiWorld } from './translations/worlds/sci_fi';
import { postApocalypseWorld } from './translations/worlds/post_apocalypse';
import { urbanMythWorld } from './translations/worlds/modern';
import { europe13thCenturyWorld } from './translations/worlds/history/europe_13th_century';
import { antiquityWorld } from './translations/worlds/history/antiquity';
import { kingArthursBritainWorld } from './translations/worlds/myths/britain';
import { trojanWarWorld } from './translations/worlds/myths/trojan_war';

const defaultCalendar = {
  startingYear: 1024,
  months: [
    { name: 'January', days: 31 }, { name: 'February', days: 28 }, { name: 'March', days: 31 },
    { name: 'April', days: 30 }, { name: 'May', days: 31 }, { name: 'June', days: 30 },
    { name: 'July', days: 31 }, { name: 'August', days: 31 }, { name: 'September', days: 30 },
    { name: 'October', days: 31 }, { name: 'November', days: 30 }, { name: 'December', days: 31 }
  ],
  daysInWeek: 7,
  dayNames: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
};

export const gameData = {
  fantasy: { ...fantasyWorld, calendar: defaultCalendar },
  sci_fi: { ...sciFiWorld, calendar: defaultCalendar },
  post_apocalypse: { ...postApocalypseWorld, calendar: defaultCalendar },
  urban_myth: { ...urbanMythWorld, calendar: defaultCalendar },
  history: {
    europe_13th_century: { ...europe13thCenturyWorld, calendar: defaultCalendar },
    antiquity: { ...antiquityWorld, calendar: defaultCalendar },
  },
  myths: {
    king_arthurs_britain: { ...kingArthursBritainWorld, calendar: defaultCalendar },
    trojan_war: { ...trojanWarWorld, calendar: defaultCalendar },
  },
  custom: {}
};
