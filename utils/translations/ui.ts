import { common } from './ui/common';
import { details } from './ui/details';
import { item } from './ui/item';
import { quest } from './ui/quest';
import { skill } from './ui/skill';
import { combat } from './ui/combat';
import { npc } from './ui/npc';
import { location } from './ui/location';
import { status } from './ui/status';
import { about } from './ui/about';
import { help } from './ui/help';
import { weather } from './ui/weather';

export const ui = {
  en: {
    ...common.en,
    ...details.en,
    ...item.en,
    ...quest.en,
    ...skill.en,
    ...combat.en,
    ...npc.en,
    ...location.en,
    ...status.en,
    ...about.en,
    ...help.en,
    ...weather.en,
  },
  ru: {
    ...common.ru,
    ...details.ru,
    ...item.ru,
    ...quest.ru,
    ...skill.ru,
    ...combat.ru,
    ...npc.ru,
    ...location.ru,
    ...status.ru,
    ...about.ru,
    ...help.ru,
    ...weather.ru,
  }
};