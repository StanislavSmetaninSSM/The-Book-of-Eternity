
// Import race-specific class localizations
import { frankLoc } from './europe_13th_century/frank_loc';
import { byzantineLoc } from './europe_13th_century/byzantine_loc';
import { saracenLoc } from './europe_13th_century/saracen_loc';
import { vikingLoc } from './europe_13th_century/viking_loc';
import { kievanRusLoc } from './europe_13th_century/kievan_rus_loc';
import { holyRomanImperialLoc } from './europe_13th_century/holy_roman_imperial_loc';

// Define translations for races and general terms
const europe13thCenturyBaseLoc = {
  en: {
    "Frank": "Frank",
    "A knightly people from the heart of Western Europe, known for their heavy cavalry and feudal devotion. +3 Strength, +2 Faith.": "A knightly people from the heart of Western Europe, known for their heavy cavalry and feudal devotion. +3 Strength, +2 Faith.",
    "Byzantine": "Byzantine",
    "Heirs to the Roman Empire, cultured and cunning, masters of diplomacy and intrigue. +3 Persuasion, +2 Intelligence.": "Heirs to the Roman Empire, cultured and cunning, masters of diplomacy and intrigue. +3 Persuasion, +2 Intelligence.",
    "Saracen": "Saracen",
    "Warriors and scholars of the sun-scorched lands, famed for their light cavalry, sharp scimitars, and advanced knowledge. +3 Dexterity, +2 Wisdom.": "Warriors and scholars of the sun-scorched lands, famed for their light cavalry, sharp scimitars, and advanced knowledge. +3 Dexterity, +2 Wisdom.",
    "Viking": "Viking",
    "Seafarers and raiders from the cold north, driven by a thirst for adventure and glory. +3 Strength, +2 Constitution.": "Seafarers and raiders from the cold north, driven by a thirst for adventure and glory. +3 Strength, +2 Constitution.",
    "KievanRus": "Kievan Rus'",
    "Hardy people from the vast eastern plains, skilled traders and resilient warriors. +2 Constitution, +2 Trade, +1 Strength.": "Hardy people from the vast eastern plains, skilled traders and resilient warriors. +2 Constitution, +2 Trade, +1 Strength.",
    "HolyRomanImperial": "Holy Roman Imperial",
    "A subject of the vast and decentralized Holy Roman Empire, defined by a complex web of feudal loyalties, religious authority, and the burgeoning power of free cities. +2 Strength, +2 Faith, +1 Intelligence.": "A subject of the vast and decentralized Holy Roman Empire, defined by a complex web of feudal loyalties, religious authority, and the burgeoning power of free cities. +2 Strength, +2 Faith, +1 Intelligence.",
    
    // Common Classes
    "Knight": "Knight",
    "A mounted warrior clad in mail, sworn to a lord and a code of chivalry. Bonus: +2 Strength, +1 Constitution.": "A mounted warrior clad in mail, sworn to a lord and a code of chivalry. Bonus: +2 Strength, +1 Constitution.",
    "Merchant": "Merchant",
    "A shrewd trader who travels the world's roads and sea lanes, seeking profit and opportunity. Bonus: +3 Trade.": "A shrewd trader who travels the world's roads and sea lanes, seeking profit and opportunity. Bonus: +3 Trade.",
    "Monk": "Monk",
    "A devout member of a religious order, dedicated to study, prayer, and labor. Bonus: +2 Faith, +1 Wisdom.": "A devout member of a religious order, dedicated to study, prayer, and labor. Bonus: +2 Faith, +1 Wisdom.",
    "Crossbowman": "Crossbowman",
    "A disciplined soldier armed with a powerful crossbow, capable of piercing heavy armor from a distance. Bonus: +2 Dexterity, +1 Perception.": "A disciplined soldier armed with a powerful crossbow, capable of piercing heavy armor from a distance. Bonus: +2 Dexterity, +1 Perception.",
    "Crusader": "Crusader",
    "A warrior driven by religious zeal, journeying to foreign lands to fight for their faith. Bonus: +2 Faith, +1 Strength.": "A warrior driven by religious zeal, journeying to foreign lands to fight for their faith. Bonus: +2 Faith, +1 Strength.",
    "Plague Doctor": "Plague Doctor",
    "A grim physician who studies the art of medicine in a time of widespread disease. They are knowledgeable about poultices, anatomy, and the grim realities of medieval health. Bonus: +2 Wisdom, +1 Intelligence.": "A grim physician who studies the art of medicine in a time of widespread disease. They are knowledgeable about poultices, anatomy, and the grim realities of medieval health. Bonus: +2 Wisdom, +1 Intelligence.",

    // Currencies
    "Livre": "Livre",
    "Hyperpyron": "Hyperpyron",
    "Dinar": "Dinar",
    "Penning": "Penning",
    "Grivna": "Grivna",
    "Pfennig": "Pfennig",
    
    // Era Name
    "Europe, 13th Century": "Europe, 13th Century",
    "History": "History",
    "A time of crusades, feudal lords, and nascent kingdoms. Faith, steel, and trade shape the world.": "A time of crusades, feudal lords, and nascent kingdoms. Faith, steel, and trade shape the world.",
  },
  ru: {
    "Frank": "Франк",
    "A knightly people from the heart of Western Europe, known for their heavy cavalry and feudal devotion. +3 Strength, +2 Faith.": "Рыцарский народ из сердца Западной Европы, известный своей тяжелой кавалерией и феодальной преданностью. +3 к Силе, +2 к Вере.",
    "Byzantine": "Византиец",
    "Heirs to the Roman Empire, cultured and cunning, masters of diplomacy and intrigue. +3 Persuasion, +2 Intelligence.": "Наследники Римской империи, культурные и хитрые, мастера дипломатии и интриг. +3 к Убеждению, +2 к Интеллекту.",
    "Saracen": "Сарацин",
    "Warriors and scholars of the sun-scorched lands, famed for their light cavalry, sharp scimitars, and advanced knowledge. +3 Dexterity, +2 Wisdom.": "Воины и ученые из выжженных солнцем земель, знаменитые своей легкой кавалерией, острыми ятаганами и передовыми знаниями. +3 к Ловкости, +2 к Мудрости.",
    "Viking": "Викинг",
    "Seafarers and raiders from the cold north, driven by a thirst for adventure and glory. +3 Strength, +2 Constitution.": "Мореходы и налетчики с холодного севера, движимые жаждой приключений и славы. +3 к Силе, +2 к Телосложению.",
    "KievanRus": "Русич",
    "Hardy people from the vast eastern plains, skilled traders and resilient warriors. +2 Constitution, +2 Trade, +1 Strength.": "Выносливый народ с бескрайних восточных равнин, умелые торговцы и стойкие воины. +2 к Телосложению, +2 к Торговле, +1 к Силе.",
    "HolyRomanImperial": "Житель Священной Римской Империи",
    "A subject of the vast and decentralized Holy Roman Empire, defined by a complex web of feudal loyalties, religious authority, and the burgeoning power of free cities. +2 Strength, +2 Faith, +1 Intelligence.": "Подданный обширной и децентрализованной Священной Римской империи, определяемый сложной паутиной феодальных зависимостей, религиозной власти и растущей мощи свободных городов. +2 к Силе, +2 к Вере, +1 к Интеллекту.",
    
    // Common Classes
    "Knight": "Рыцарь",
    "A mounted warrior clad in mail, sworn to a lord and a code of chivalry. Bonus: +2 Strength, +1 Constitution.": "Конный воин в кольчуге, присягнувший лорду и кодексу чести. Бонус: +2 к Силе, +1 к Телосложению.",
    "Merchant": "Купец",
    "A shrewd trader who travels the world's roads and sea lanes, seeking profit and opportunity. Bonus: +3 Trade.": "Проницательный торговец, путешествующий по дорогам и морским путям мира в поисках прибыли и возможностей. Бонус: +3 к Торговле.",
    "Monk": "Монах",
    "A devout member of a religious order, dedicated to study, prayer, and labor. Bonus: +2 Faith, +1 Wisdom.": "Благочестивый член религиозного ордена, посвятивший себя учебе, молитве и труду. Бонус: +2 к Вере, +1 к Мудрости.",
    "Crossbowman": "Арбалетчик",
    "A disciplined soldier armed with a powerful crossbow, capable of piercing heavy armor from a distance. Bonus: +2 Dexterity, +1 Perception.": "Дисциплинированный солдат, вооруженный мощным арбалетом, способным пробивать тяжелую броню на расстоянии. Бонус: +2 к Ловкости, +1 к Восприятию.",
    "Crusader": "Крестоносец",
    "A warrior driven by religious zeal, journeying to foreign lands to fight for their faith. Bonus: +2 Faith, +1 Strength.": "Воин, движимый религиозным рвением, отправляющийся в чужие земли, чтобы сражаться за свою веру. Бонус: +2 к Вере, +1 к Силе.",
    "Plague Doctor": "Чумной доктор",
    "A grim physician who studies the art of medicine in a time of widespread disease. They are knowledgeable about poultices, anatomy, and the grim realities of medieval health. Bonus: +2 Wisdom, +1 Intelligence.": "Мрачный лекарь, изучающий искусство медицины во времена повальных болезней. Он сведущ в припарках, анатомии и суровых реалиях средневекового здоровья. Бонус: +2 к Мудрости, +1 к Интеллекту.",

    // Currencies
    "Livre": "Ливр",
    "Hyperpyron": "Иперпир",
    "Dinar": "Динар",
    "Penning": "Пеннинг",
    "Grivna": "Гривна",
    "Pfennig": "Пфенниг",
    
    // Era Name
    "Europe, 13th Century": "Европа, XIII век",
    "History": "История",
    "A time of crusades, feudal lords, and nascent kingdoms. Faith, steel, and trade shape the world.": "Время крестовых походов, феодалов и зарождающихся королевств. Вера, сталь и торговля формируют мир.",
  }
};

// Combine base localizations with all class localizations
export const europe13thCenturyLoc = {
  en: {
    ...europe13thCenturyBaseLoc.en,
    ...frankLoc.en,
    ...byzantineLoc.en,
    ...saracenLoc.en,
    ...vikingLoc.en,
    ...kievanRusLoc.en,
    ...holyRomanImperialLoc.en
  },
  ru: {
    ...europe13thCenturyBaseLoc.ru,
    ...frankLoc.ru,
    ...byzantineLoc.ru,
    ...saracenLoc.ru,
    ...vikingLoc.ru,
    ...kievanRusLoc.ru,
    ...holyRomanImperialLoc.ru
  }
};
