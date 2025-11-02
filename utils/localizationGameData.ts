
import { fantasyWorld } from './translations/worlds/fantasy';
import { sciFiWorld } from './translations/worlds/sci_fi';
import { postApocalypseWorld } from './translations/worlds/post_apocalypse';
import { urbanMythWorld } from './translations/worlds/modern';
import { europe13thCenturyWorld } from './translations/worlds/history/europe_13th_century';
import { antiquityWorld } from './translations/worlds/history/antiquity';
import { kingArthursBritainWorld } from './translations/worlds/myths/britain';
import { trojanWarWorld } from './translations/worlds/myths/trojan_war';

const standardCalendarStructure = {
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
  fantasy: { 
    ...fantasyWorld, 
    calendar: {
      startingYear: 1024,
      ...standardCalendarStructure
    } 
  },
  sci_fi: { 
    ...sciFiWorld, 
    calendar: {
      startingYear: 2384,
      ...standardCalendarStructure
    }
  },
  post_apocalypse: { 
    ...postApocalypseWorld, 
    calendar: {
      startingYear: 2088,
      ...standardCalendarStructure
    }
  },
  urban_myth: { 
    ...urbanMythWorld, 
    calendar: {
      startingYear: 2026,
      ...standardCalendarStructure
    }
  },
  history: {
    europe_13th_century: { 
      ...europe13thCenturyWorld, 
      calendar: {
        startingYear: 1250,
        ...standardCalendarStructure
      } 
    },
    antiquity: { 
      ...antiquityWorld, 
      calendar: {
        startingYear: 250,
        ...standardCalendarStructure
      } 
    },
  },
  myths: {
    king_arthurs_britain: { 
      ...kingArthursBritainWorld, 
      calendar: {
        startingYear: 480,
        ...standardCalendarStructure
      } 
    },
    trojan_war: { 
      ...trojanWarWorld, 
      calendar: {
        startingYear: -1194, // Representing 1194 BC
        ...standardCalendarStructure
      } 
    },
  },
  custom: {}
};
