import { britonLoc } from './britain/briton_loc';
import { saxonLoc } from './britain/saxon_loc';
import { pictLoc } from './britain/pict_loc';
import { irishLoc } from './britain/irish_loc';

const britainBaseLoc = {
    en: {
        "King Arthur's Britain": "King Arthur's Britain",
        "Briton": "Briton",
        "The Romano-Celtic heirs to Britain, struggling to preserve civilization and faith against the pagan tide. They value chivalry, law, and the memory of Rome. +2 Persuasion, +2 Faith, +1 Strength.": "The Romano-Celtic heirs to Britain, struggling to preserve civilization and faith against the pagan tide. They value chivalry, law, and the memory of Rome. +2 Persuasion, +2 Faith, +1 Strength.",
        "Saxon": "Saxon",
        "Fierce Germanic warriors from across the sea, carving out new kingdoms with axe and shield. They value strength, loyalty to their chieftain, and the spoils of war. +3 Strength, +2 Constitution.": "Fierce Germanic warriors from across the sea, carving out new kingdoms with axe and shield. They value strength, loyalty to their chieftain, and the spoils of war. +3 Strength, +2 Constitution.",
        "Pict": "Pict",
        "The enigmatic 'painted people' of the northern mists. Masters of ambush and wilderness survival, they guard ancient secrets and fight to remain unconquered. +3 Dexterity, +2 Perception.": "The enigmatic 'painted people' of the northern mists. Masters of ambush and wilderness survival, they guard ancient secrets and fight to remain unconquered. +3 Dexterity, +2 Perception.",
        "Irish": "Irish",
        "Raiders and saints from the isle of Erin. Known for their fierce warriors who storm the coasts and the devout monks who preserve knowledge in isolated monasteries. +2 Faith, +2 Speed, +1 Luck.": "Raiders and saints from the isle of Erin. Known for their fierce warriors who storm the coasts and the devout monks who preserve knowledge in isolated monasteries. +2 Faith, +2 Speed, +1 Luck.",
        "Silver Penny": "Silver Penny",
        "Sceat": "Sceat",
        "Silver Brooch": "Silver Brooch",
        "Screpul": "Screpul",
    },
    ru: {
        "King Arthur's Britain": "Британия Короля Артура",
        "Briton": "Бритт",
        "The Romano-Celtic heirs to Britain, struggling to preserve civilization and faith against the pagan tide. They value chivalry, law, and the memory of Rome. +2 Persuasion, +2 Faith, +1 Strength.": "Романо-кельтские наследники Британии, борющиеся за сохранение цивилизации и веры против языческой волны. Они ценят рыцарство, закон и память о Риме. +2 к Убеждению, +2 к Вере, +1 к Силе.",
        "Saxon": "Сакс",
        "Fierce Germanic warriors from across the sea, carving out new kingdoms with axe and shield. They value strength, loyalty to their chieftain, and the spoils of war. +3 Strength, +2 Constitution.": "Свирепые германские воины из-за моря, вырезающие новые королевства топором и щитом. Они ценят силу, верность вождю и военную добычу. +3 к Силе, +2 к Телосложению.",
        "Pict": "Пикт",
        "The enigmatic 'painted people' of the northern mists. Masters of ambush and wilderness survival, they guard ancient secrets and fight to remain unconquered. +3 Dexterity, +2 Perception.": "Загадочные «раскрашенные люди» северных туманов. Мастера засад и выживания в дикой природе, они хранят древние тайны и сражаются, чтобы остаться непокоренными. +3 к Ловкости, +2 к Восприятию.",
        "Irish": "Ирландец",
        "Raiders and saints from the isle of Erin. Known for their fierce warriors who storm the coasts and the devout monks who preserve knowledge in isolated monasteries. +2 Faith, +2 Speed, +1 Luck.": "Налетчики и святые с острова Эрин. Известны своими свирепыми воинами, штурмующими побережья, и благочестивыми монахами, сохраняющими знания в уединенных монастырях. +2 к Вере, +2 к Скорости, +1 к Удаче.",
        "Silver Penny": "Серебряный пенни",
        "Sceat": "Скеат",
        "Silver Brooch": "Серебряная брошь",
        "Screpul": "Скрепул",
    }
};

export const britainLoc = {
    en: {
        ...britainBaseLoc.en,
        ...britonLoc.en,
        ...saxonLoc.en,
        ...pictLoc.en,
        ...irishLoc.en,
    },
    ru: {
        ...britainBaseLoc.ru,
        ...britonLoc.ru,
        ...saxonLoc.ru,
        ...pictLoc.ru,
        ...irishLoc.ru,
    }
};