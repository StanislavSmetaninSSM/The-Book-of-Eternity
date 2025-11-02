
// Import race-specific class localizations
import { romanLoc } from './antiquity/roman_loc';
import { carthaginianLoc } from './antiquity/carthaginian_loc';
import { persianLoc } from './antiquity/persian_loc';
import { helleneLoc } from './antiquity/hellene_loc';
import { macedonianLoc } from './antiquity/macedonian_loc';
import { egyptianLoc } from './antiquity/egyptian_loc';
import { seleucidLoc } from './antiquity/seleucid_loc';
import { gaulLoc } from './antiquity/gaul_loc';
import { germanLoc } from './antiquity/german_loc';
import { iberianLoc } from './antiquity/iberian_loc';
import { scythianLoc } from './antiquity/scythian_loc';

// Define translations for races and general terms for the Antiquity world
const antiquityBaseLoc = {
    en: {
        "Antiquity": "Antiquity",
        "An age of legendary empires, clashing philosophies, and iconic warriors. From the disciplined legions of Rome to the phalanxes of Alexander's successors, history is forged in bronze and iron.": "An age of legendary empires, clashing philosophies, and iconic warriors. From the disciplined legions of Rome to the phalanxes of Alexander's successors, history is forged in bronze and iron.",
        "Roman": "Roman",
        "Disciplined, pragmatic, and militaristic, the Romans are master engineers and soldiers, forging an empire through legions and law. +2 Strength, +2 Persuasion, +1 Constitution.": "Disciplined, pragmatic, and militaristic, the Romans are master engineers and soldiers, forging an empire through legions and law. +2 Strength, +2 Persuasion, +1 Constitution.",
        "Carthaginian": "Carthaginian",
        "A seafaring and mercantile power from North Africa, Carthage rivals Rome with its vast wealth, powerful navy, and elite Sacred Band. +3 Trade, +2 Speed.": "A seafaring and mercantile power from North Africa, Carthage rivals Rome with its vast wealth, powerful navy, and elite Sacred Band. +3 Trade, +2 Speed.",
        "Persian": "Persian",
        "Heirs to a vast and ancient empire, the Persians are known for their immense armies, cavalry, and the elite Immortals who guard the King of Kings. +2 Attractiveness, +2 Trade, +1 Faith.": "Heirs to a vast and ancient empire, the Persians are known for their immense armies, cavalry, and the elite Immortals who guard the King of Kings. +2 Attractiveness, +2 Trade, +1 Faith.",
        "Hellene": "Hellene",
        "A collection of proud city-states, the Hellenes are famed for their philosophy, democracy, and the disciplined hoplite phalanx. +2 Intelligence, +2 Wisdom, +1 Persuasion.": "A collection of proud city-states, the Hellenes are famed for their philosophy, democracy, and the disciplined hoplite phalanx. +2 Intelligence, +2 Wisdom, +1 Persuasion.",
        "Macedonian": "Macedonian",
        "Forged by Philip II and Alexander the Great, the Macedonians are military innovators, wielding the deadly sarissa in disciplined phalanxes and backed by the legendary Companion cavalry. +3 Strength, +2 Speed.": "Forged by Philip II and Alexander the Great, the Macedonians are military innovators, wielding the deadly sarissa in disciplined phalanxes and backed by the legendary Companion cavalry. +3 Strength, +2 Speed.",
        "Egyptian": "Egyptian",
        "A civilization rooted in millennia of tradition, ruled by a divine Pharaoh and a powerful priesthood. Their culture revolves around the life-giving Nile and a complex pantheon of gods. +3 Faith, +2 Intelligence.": "A civilization rooted in millennia of tradition, ruled by a divine Pharaoh and a powerful priesthood. Their culture revolves around the life-giving Nile and a complex pantheon of gods. +3 Faith, +2 Intelligence.",
        "Seleucid": "Seleucid",
        "A Hellenistic successor state ruling over the former Persian heartlands, blending Greek military traditions with Eastern influences, famous for their war elephants and diverse armies. +2 Strength, +2 Trade, +1 Intelligence.": "A Hellenistic successor state ruling over the former Persian heartlands, blending Greek military traditions with Eastern influences, famous for their war elephants and diverse armies. +2 Strength, +2 Trade, +1 Intelligence.",
        "Gaul": "Gaul",
        "Fierce and independent tribal peoples from Western Europe, known for their warrior ethos, druidic priests, and ferocious charges into battle. +3 Strength, +2 Constitution.": "Fierce and independent tribal peoples from Western Europe, known for their warrior ethos, druidic priests, and ferocious charges into battle. +3 Strength, +2 Constitution.",
        "German": "German",
        "Hardy and warlike tribes from the dense forests north of the Roman frontier. They value loyalty and martial prowess above all else. +2 Strength, +3 Constitution.": "Hardy and warlike tribes from the dense forests north of the Roman frontier. They value loyalty and martial prowess above all else. +2 Strength, +3 Constitution.",
        "Iberian": "Iberian",
        "Agile and resilient peoples from the Iberian peninsula, masters of guerrilla warfare, known for their deadly falcata swords. +3 Dexterity, +2 Speed.": "Agile and resilient peoples from the Iberian peninsula, masters of guerrilla warfare, known for their deadly falcata swords. +3 Dexterity, +2 Speed.",
        "Scythian": "Scythian",
        "Nomadic horse-lords of the vast Eurasian steppes, peerless mounted archers who live and die in the saddle. +3 Dexterity, +2 Perception.": "Nomadic horse-lords of the vast Eurasian steppes, peerless mounted archers who live and die in the saddle. +3 Dexterity, +2 Perception.",
        "Denarius": "Denarius", "Shekel": "Shekel", "Daric": "Daric", "Drachma": "Drachma", "Stater": "Stater", "Deben": "Deben", "Seleucid Stater": "Seleucid Stater", "Gallic Stater": "Gallic Stater", "Hacksilver": "Hacksilver", "As": "As", "Ingot": "Ingot",
    },
    ru: {
        "Antiquity": "Античность",
        "An age of legendary empires, clashing philosophies, and iconic warriors. From the disciplined legions of Rome to the phalanxes of Alexander's successors, history is forged in bronze and iron.": "Эпоха легендарных империй, столкновения философий и знаменитых воинов. От дисциплинированных легионов Рима до фаланг наследников Александра, история выковывается в бронзе и железе.",
        "Roman": "Римлянин",
        "Disciplined, pragmatic, and militaristic, the Romans are master engineers and soldiers, forging an empire through legions and law. +2 Strength, +2 Persuasion, +1 Constitution.": "Дисциплинированные, прагматичные и милитаристские римляне — мастера-инженеры и солдаты, создающие империю с помощью легионов и законов. +2 к Силе, +2 к Убеждению, +1 к Телосложению.",
        "Carthaginian": "Карфагенянин",
        "A seafaring and mercantile power from North Africa, Carthage rivals Rome with its vast wealth, powerful navy, and elite Sacred Band. +3 Trade, +2 Speed.": "Морская и торговая держава из Северной Африки, Карфаген соперничает с Римом своим огромным богатством, мощным флотом и элитным Священным отрядом. +3 к Торговле, +2 к Скорости.",
        "Persian": "Перс",
        "Heirs to a vast and ancient empire, the Persians are known for their immense armies, cavalry, and the elite Immortals who guard the King of Kings. +2 Attractiveness, +2 Trade, +1 Faith.": "Наследники огромной и древней империи, персы известны своими многочисленными армиями, кавалерией и элитными Бессмертными, охраняющими Царя Царей. +2 к Привлекательности, +2 к Торговле, +1 к Вере.",
        "Hellene": "Эллин",
        "A collection of proud city-states, the Hellenes are famed for their philosophy, democracy, and the disciplined hoplite phalanx. +2 Intelligence, +2 Wisdom, +1 Persuasion.": "Совокупность гордых городов-государств, эллины славятся своей философией, демократией и дисциплинированной фалангой гоплитов. +2 к Интеллекту, +2 к Мудрости, +1 к Убеждению.",
        "Macedonian": "Македонянин",
        "Forged by Philip II and Alexander the Great, the Macedonians are military innovators, wielding the deadly sarissa in disciplined phalanxes and backed by the legendary Companion cavalry. +3 Strength, +2 Speed.": "Созданные Филиппом II и Александром Великим, македоняне являются военными новаторами, владеющими смертоносной сариссой в дисциплинированных фалангах и поддерживаемыми легендарной кавалерией гетайров. +3 к Силе, +2 к Скорости.",
        "Egyptian": "Египтянин",
        "A civilization rooted in millennia of tradition, ruled by a divine Pharaoh and a powerful priesthood. Their culture revolves around the life-giving Nile and a complex pantheon of gods. +3 Faith, +2 Intelligence.": "Цивилизация, уходящая корнями в тысячелетия традиций, управляемая божественным фараоном и могущественным жречеством. Их культура вращается вокруг животворного Нила и сложного пантеона богов. +3 к Вере, +2 к Интеллекту.",
        "Seleucid": "Селевкид",
        "A Hellenistic successor state ruling over the former Persian heartlands, blending Greek military traditions with Eastern influences, famous for their war elephants and diverse armies. +2 Strength, +2 Trade, +1 Intelligence.": "Эллинистическое государство-преемник, правящее бывшими персидскими землями, сочетающее греческие военные традиции с восточными влияниями, известное своими боевыми слонами и разнообразными армиями. +2 к Силе, +2 к Торговле, +1 к Интеллекту.",
        "Gaul": "Галл",
        "Fierce and independent tribal peoples from Western Europe, known for their warrior ethos, druidic priests, and ferocious charges into battle. +3 Strength, +2 Constitution.": "Свирепые и независимые племенные народы из Западной Европы, известные своим воинским этосом, друидическими жрецами и яростными атаками в бою. +3 к Силе, +2 к Телосложению.",
        "German": "Германец",
        "Hardy and warlike tribes from the dense forests north of the Roman frontier. They value loyalty and martial prowess above all else. +2 Strength, +3 Constitution.": "Выносливые и воинственные племена из густых лесов к северу от римской границы. Они ценят верность и воинскую доблесть превыше всего. +2 к Силе, +3 к Телосложению.",
        "Iberian": "Ибер",
        "Agile and resilient peoples from the Iberian peninsula, masters of guerrilla warfare, known for their deadly falcata swords. +3 Dexterity, +2 Speed.": "Проворные и стойкие народы с Пиренейского полуострова, мастера партизанской войны, известные своими смертоносными мечами-фалькатами. +3 к Ловкости, +2 к Скорости.",
        "Scythian": "Скиф",
        "Nomadic horse-lords of the vast Eurasian steppes, peerless mounted archers who live and die in the saddle. +3 Dexterity, +2 Perception.": "Кочевые конные владыки бескрайних евразийских степей, несравненные конные лучники, живущие и умирающие в седле. +3 к Ловкости, +2 к Восприятию.",
        "Denarius": "Денарий", "Shekel": "Шекель", "Daric": "Дарик", "Drachma": "Драхма", "Stater": "Статер", "Deben": "Дебен", "Seleucid Stater": "Селевкидский статер", "Gallic Stater": "Галльский статер", "Hacksilver": "Рубленое серебро", "As": "Асс", "Ingot": "Слиток",
    }
};

// Combine base localizations with all class localizations
export const antiquityLoc = {
  en: {
    ...antiquityBaseLoc.en,
    ...romanLoc.en,
    ...carthaginianLoc.en,
    ...persianLoc.en,
    ...helleneLoc.en,
    ...macedonianLoc.en,
    ...egyptianLoc.en,
    ...seleucidLoc.en,
    ...gaulLoc.en,
    ...germanLoc.en,
    ...iberianLoc.en,
    ...scythianLoc.en
  },
  ru: {
    ...antiquityBaseLoc.ru,
    ...romanLoc.ru,
    ...carthaginianLoc.ru,
    ...persianLoc.ru,
    ...helleneLoc.ru,
    ...macedonianLoc.ru,
    ...egyptianLoc.ru,
    ...seleucidLoc.ru,
    ...gaulLoc.ru,
    ...germanLoc.ru,
    ...iberianLoc.ru,
    ...scythianLoc.ru
  }
};
