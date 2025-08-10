
import { achaeanLoc } from './trojan_war/achaean_loc';
import { trojanLoc } from './trojan_war/trojan_loc';

const trojanWarBaseLoc = {
  en: {
    "Trojan War": "Trojan War",
    "An age of bronze-clad heroes and divine intervention. The epic conflict between the Achaean invaders and the proud defenders of Troy, where gods walk among mortals and legends are forged in blood and glory.": "An age of bronze-clad heroes and divine intervention. The epic conflict between the Achaean invaders and the proud defenders of Troy, where gods walk among mortals and legends are forged in blood and glory.",
    "Achaean": "Achaean",
    "A coalition of bronze-armored warriors from across the Hellenic world, driven by pride, glory, and the pursuit of arete (excellence). They are individualistic champions seeking immortal fame. +3 Strength, +2 Speed.": "A coalition of bronze-armored warriors from across the Hellenic world, driven by pride, glory, and the pursuit of arete (excellence). They are individualistic champions seeking immortal fame. +3 Strength, +2 Speed.",
    "Trojan": "Trojan",
    "The proud defenders of a magnificent city, blessed by the gods. They fight for their homes, their king, and their divine patrons with unwavering resolve and piety. +3 Constitution, +2 Faith.": "The proud defenders of a magnificent city, blessed by the gods. They fight for their homes, their king, and their divine patrons with unwavering resolve and piety. +3 Constitution, +2 Faith.",
    "Bronze Talent": "Bronze Talent",
    "Golden Stater": "Golden Stater",
  },
  ru: {
    "Trojan War": "Троянская война",
    "An age of bronze-clad heroes and divine intervention. The epic conflict between the Achaean invaders and the proud defenders of Troy, where gods walk among mortals and legends are forged in blood and glory.": "Эпоха героев в бронзовых доспехах и божественного вмешательства. Эпический конфликт между ахейскими захватчиками и гордыми защитниками Трои, где боги ходят среди смертных, а легенды выковываются в крови и славе.",
    "Achaean": "Ахеец",
    "A coalition of bronze-armored warriors from across the Hellenic world, driven by pride, glory, and the pursuit of arete (excellence). They are individualistic champions seeking immortal fame. +3 Strength, +2 Speed.": "Коалиция воинов в бронзовых доспехах со всего эллинского мира, движимых гордостью, славой и стремлением к арете (совершенству). Они — индивидуалистичные чемпионы, ищущие бессмертной славы. +3 к Силе, +2 к Скорости.",
    "Trojan": "Троянец",
    "The proud defenders of a magnificent city, blessed by the gods. They fight for their homes, their king, and their divine patrons with unwavering resolve and piety. +3 Constitution, +2 Faith.": "Гордые защитники великолепного города, благословленного богами. Они сражаются за свои дома, своего царя и своих божественных покровителей с непоколебимой решимостью и благочестием. +3 к Телосложению, +2 к Вере.",
    "Bronze Talent": "Бронзовый талант",
    "Golden Stater": "Золотой статер",
  }
};

export const trojanWarLoc = {
  en: {
    ...trojanWarBaseLoc.en,
    ...achaeanLoc.en,
    ...trojanLoc.en,
  },
  ru: {
    ...trojanWarBaseLoc.ru,
    ...achaeanLoc.ru,
    ...trojanLoc.ru,
  }
};