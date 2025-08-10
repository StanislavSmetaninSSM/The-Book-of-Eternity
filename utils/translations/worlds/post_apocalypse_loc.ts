
// Import race-specific class localizations
import { survivorLoc } from './post_apocalypse/survivor_loc';
import { mutantLoc } from './post_apocalypse/mutant_loc';
import { synthLoc } from './post_apocalypse/synth_loc';
import { ghoulLoc } from './post_apocalypse/ghoul_loc';
import { purebloodLoc } from './post_apocalypse/pureblood_loc';
import { beastkinLoc } from './post_apocalypse/beastkin_loc';
import { molePeopleLoc } from './post_apocalypse/mole_people_loc';
import { theBlightedLoc } from './post_apocalypse/the_blighted_loc';
import { theSunScorchedLoc } from './post_apocalypse/the_sun_scorched_loc';
import { theForgedLoc } from './post_apocalypse/the_forged_loc';
import { crystallineLoc } from './post_apocalypse/crystalline_loc';
import { fungaloidLoc } from './post_apocalypse/fungaloid_loc';
import { scrapperGuilderLoc } from './post_apocalypse/scrapper_guilder_loc';
import { theMorphedLoc } from './post_apocalypse/the_morphed_loc';
import { chitinoidLoc } from './post_apocalypse/chitinoid_loc';
import { verdantLoc } from './post_apocalypse/verdant_loc';
import { theIrradiatedLoc } from './post_apocalypse/the_irradiated_loc';
import { theSunkenLoc } from './post_apocalypse/the_sunken_loc';
import { echoLoc } from './post_apocalypse/echo_loc';
import { sandSwimmerLoc } from './post_apocalypse/sand_swimmer_loc';

const postApocalypseBaseLoc = {
  en: {
    // Post-Apocalypse Races
    "Survivor": "Survivor",
    "Tough and resourceful humans who endured the fall. +2 Constitution, +2 Luck, +1 Perception.": "Tough and resourceful humans who endured the fall. +2 Constitution, +2 Luck, +1 Perception.",
    "Mutant": "Mutant",
    "Twisted by radiation, unnaturally strong and resilient. +4 Strength, +1 Constitution.": "Twisted by radiation, unnaturally strong and resilient. +4 Strength, +1 Constitution.",
    "Synth": "Synth",
    "A pre-fall android, durable and logical. +2 Intelligence, +3 Constitution.": "A pre-fall android, durable and logical. +2 Intelligence, +3 Constitution.",
    "Ghoul": "Ghoul",
    "Irradiated humans, their bodies scarred but their minds sharp from centuries of survival. +3 Wisdom, +2 Constitution.": "Irradiated humans, their bodies scarred but their minds sharp from centuries of survival. +3 Wisdom, +2 Constitution.",
    "Pureblood": "Pureblood",
    "Descendants of those who weathered the apocalypse in sealed vaults, intelligent but unaccustomed to the harsh wastes. +3 Intelligence, +2 Trade.": "Descendants of those who weathered the apocalypse in sealed vaults, intelligent but unaccustomed to the harsh wastes. +3 Intelligence, +2 Trade.",
    "Beastkin": "Beastkin",
    "Descendants of genetic experiments, combining human intellect with animalistic senses and resilience. +3 Perception, +2 Constitution.": "Descendants of genetic experiments, combining human intellect with animalistic senses and resilience. +3 Perception, +2 Constitution.",
    "Mole People": "Mole People",
    "Generations of living underground have made them resilient to toxins and given them unparalleled senses in the dark, but they are frail in the sun. +3 Perception, +2 Dexterity.": "Generations of living underground have made them resilient to toxins and given them unparalleled senses in the dark, but they are frail in the sun. +3 Perception, +2 Dexterity.",
    "The Blighted": "The Blighted",
    "Survivors of a bio-chemical plague, their bodies are now immune to toxins and disease but marked by strange growths. +3 Constitution, +2 Wisdom.": "Survivors of a bio-chemical plague, their bodies are now immune to toxins and disease but marked by strange growths. +3 Constitution, +2 Wisdom.",
    "The Sun-Scorched": "The Sun-Scorched",
    "Descendants of surface dwellers who never sought shelter, their skin is leathery and tough, and they are incredibly resilient to radiation and heat. +4 Constitution, +1 Perception.": "Descendants of surface dwellers who never sought shelter, their skin is leathery and tough, and they are incredibly resilient to radiation and heat. +4 Constitution, +1 Perception.",
    "The Forged": "The Forged",
    "Survivors who have replaced lost limbs with crude, powerful, steam-powered prosthetics, becoming stronger but requiring constant maintenance. +3 Strength, +2 Constitution.": "Survivors who have replaced lost limbs with crude, powerful, steam-powered prosthetics, becoming stronger but requiring constant maintenance. +3 Strength, +2 Constitution.",
    "Crystalline": "Crystalline",
    "Humans partially transformed by a terraforming agent into glowing crystals. Beautiful but fragile, with innate energy manipulation. +3 Attractiveness, +2 Intelligence.": "Humans partially transformed by a terraforming agent into glowing crystals. Beautiful but fragile, with innate energy manipulation. +3 Attractiveness, +2 Intelligence.",
    "Fungaloid": "Fungaloid",
    "A human-fungus symbiont. Highly resistant to toxins and able to communicate through a mycelial network, but slow and shunned. +3 Constitution, +2 Wisdom.": "A human-fungus symbiont. Highly resistant to toxins and able to communicate through a mycelial network, but slow and shunned. +3 Constitution, +2 Wisdom.",
    "Scrapper Guilder": "Scrapper Guilder",
    "A culture of humans born to scavenge and build. Masters of improvisation and mechanics, often augmented with crude cybernetics. +3 Trade, +2 Intelligence.": "A culture of humans born to scavenge and build. Masters of improvisation and mechanics, often augmented with crude cybernetics. +3 Trade, +2 Intelligence.",
    "The Morphed": "The Morphed",
    "Descendants of humans exposed to a polymorphic virus. Unstable shapeshifters who struggle with a cohesive identity. +3 Attractiveness, +2 Dexterity.": "Descendants of humans exposed to a polymorphic virus. Unstable shapeshifters who struggle with a cohesive identity. +3 Attractiveness, +2 Dexterity.",
    "Chitinoid": "Chitinoid",
    "Through bizarre radiation-induced evolution, these humans have taken on the characteristics of hardy insects. Their mottled skin forms a tough exoskeleton, making them incredibly resilient and fast, but they are often viewed with suspicion and disgust by others. +3 Constitution, +2 Speed.": "Through bizarre radiation-induced evolution, these humans have taken on the characteristics of hardy insects. Their mottled skin forms a tough exoskeleton, making them incredibly resilient and fast, but they are often viewed with suspicion and disgust by others. +3 Constitution, +2 Speed.",
    "Verdant": "Verdant",
    "A rare mutation has intertwined human and plant DNA. The Verdant have bark-like skin and can draw sustenance from sunlight, reducing their need for food and water. They are incredibly hardy but tend towards slow, deliberate action. +3 Constitution, +2 Faith.": "A rare mutation has intertwined human and plant DNA. The Verdant have bark-like skin and can draw sustenance from sunlight, reducing their need for food and water. They are incredibly hardy but tend towards slow, deliberate action. +3 Constitution, +2 Faith.",
    "The Irradiated": "The Irradiated",
    "Born in the lethal glow of high-radiation zones, the Irradiated are immune to its effects, even finding a strange vitality within it. Their bodies often bear non-lethal mutations and a faint, eerie luminescence. +3 Faith, +2 Constitution.": "Born in the lethal glow of high-radiation zones, the Irradiated are immune to its effects, even finding a strange vitality within it. Their bodies often bear non-lethal mutations and a faint, eerie luminescence. +3 Faith, +2 Constitution.",
    "The Sunken": "The Sunken",
    "Generations of brutal survival have devolved these humans into a primal, non-verbal state. They operate on pure instinct and pack dynamics, possessing immense physical strength and razor-sharp senses honed for hunting in the ruins. +3 Strength, +2 Perception.": "Generations of brutal survival have devolved these humans into a primal, non-verbal state. They operate on pure instinct and pack dynamics, possessing immense physical strength and razor-sharp senses honed for hunting in the ruins. +3 Strength, +2 Perception.",
    "Echo": "Echo",
    "Semi-corporeal beings born from a psychic cataclysm or a rogue AI's death cry. They are insubstantial and perceptive, able to phase through small objects and sense emotional residues. +3 Wisdom, +2 Perception.": "Semi-corporeal beings born from a psychic cataclysm or a rogue AI's death cry. They are insubstantial and perceptive, able to phase through small objects and sense emotional residues. +3 Wisdom, +2 Perception.",
    "Sand-Swimmer": "Sand-Swimmer",
    "A human offshoot adapted to life in vast, irradiated sand seas. They have sleek bodies, excellent heat resistance, and an uncanny ability to navigate and move through loose sand and dunes. +3 Dexterity, +2 Constitution.": "A human offshoot adapted to life in vast, irradiated sand seas. They have sleek bodies, excellent heat resistance, and an uncanny ability to navigate and move through loose sand and dunes. +3 Dexterity, +2 Constitution.",
  },
  ru: {
    // Post-Apocalypse Races
    "Survivor": "Выживший",
    "Tough and resourceful humans who endured the fall. +2 Constitution, +2 Luck, +1 Perception.": "Крепкие и находчивые люди, пережившие падение. +2 к Телосложению, +2 к Удаче, +1 к Восприятию.",
    "Mutant": "Мутант",
    "Twisted by radiation, unnaturally strong and resilient. +4 Strength, +1 Constitution.": "Искаженные радиацией, неестественно сильные и стойкие. +4 к Силе, +1 к Телосложению.",
    "Synth": "Синт",
    "A pre-fall android, durable and logical. +2 Intelligence, +3 Constitution.": "Андроид до падения, прочный и логичный. +2 к Интеллекту, +3 к Телосложению.",
    "Ghoul": "Гуль",
    "Irradiated humans, their bodies scarred but their minds sharp from centuries of survival. +3 Wisdom, +2 Constitution.": "Облученные люди, их тела покрыты шрамами, но их умы остры от веков выживания. +3 к Мудрости, +2 к Телосложению.",
    "Pureblood": "Чистокровный",
    "Descendants of those who weathered the apocalypse in sealed vaults, intelligent but unaccustomed to the harsh wastes. +3 Intelligence, +2 Trade.": "Потомки тех, кто пережил апокалипсис в запечатанных убежищах, умные, но не привыкшие к суровым пустошам. +3 к Интеллекту, +2 к Торговле.",
    "Beastkin": "Зверолюд",
    "Descendants of genetic experiments, combining human intellect with animalistic senses and resilience. +3 Perception, +2 Constitution.": "Потомки генетических экспериментов, сочетающие человеческий интеллект с животными чувствами и стойкостью. +3 к Восприятию, +2 к Телосложению.",
    "Mole People": "Кротолюд",
    "Generations of living underground have made them resilient to toxins and given them unparalleled senses in the dark, but they are frail in the sun. +3 Perception, +2 Dexterity.": "Поколения жизни под землей сделали их устойчивыми к токсинам и дали им непревзойденные чувства в темноте, но они хрупки на солнце. +3 к Восприятию, +2 к Ловкости.",
    "The Blighted": "Пораженный Чумой",
    "Survivors of a bio-chemical plague, their bodies are now immune to toxins and disease but marked by strange growths. +3 Constitution, +2 Wisdom.": "Выжившие после биохимической чумы, их тела теперь невосприимчивы к токсинам и болезням, но отмечены странными наростами. +3 к Телосложению, +2 к Мудрости.",
    "The Sun-Scorched": "Обожженный Солнцем",
    "Descendants of surface dwellers who never sought shelter, their skin is leathery and tough, and they are incredibly resilient to radiation and heat. +4 Constitution, +1 Perception.": "Потомки жителей поверхности, которые никогда не искали убежища, их кожа грубая и прочная, и они невероятно устойчивы к радиации и жаре. +4 к Телосложению, +1 к Восприятию.",
    "The Forged": "Кованый",
    "Survivors who have replaced lost limbs with crude, powerful, steam-powered prosthetics, becoming stronger but requiring constant maintenance. +3 Strength, +2 Constitution.": "Выжившие, заменившие потерянные конечности грубыми, мощными паровыми протезами, становясь сильнее, но требуя постоянного обслуживания. +3 к Силе, +2 к Телосложению.",
    "Crystalline": "Кристаллический",
    "Humans partially transformed by a terraforming agent into glowing crystals. Beautiful but fragile, with innate energy manipulation. +3 Attractiveness, +2 Intelligence.": "Люди, частично превращенные терраформирующим агентом в светящиеся кристаллы. Красивые, но хрупкие, с врожденной способностью к манипуляции энергией. +3 к Привлекательности, +2 к Интеллекту.",
    "Fungaloid": "Фунгоид",
    "A human-fungus symbiont. Highly resistant to toxins and able to communicate through a mycelial network, but slow and shunned. +3 Constitution, +2 Wisdom.": "Симбионт человека и гриба. Высокоустойчив к токсинам и способен общаться через мицелиальную сеть, но медлителен и избегаем. +3 к Телосложению, +2 к Мудрости.",
    "Scrapper Guilder": "Гильдиец-мусорщик",
    "A culture of humans born to scavenge and build. Masters of improvisation and mechanics, often augmented with crude cybernetics. +3 Trade, +2 Intelligence.": "Культура людей, рожденных для сбора утиля и строительства. Мастера импровизации и механики, часто дополненные грубой кибернетикой. +3 к Торговле, +2 к Интеллекту.",
    "The Morphed": "Морф",
    "Descendants of humans exposed to a polymorphic virus. Unstable shapeshifters who struggle with a cohesive identity. +3 Attractiveness, +2 Dexterity.": "Потомки людей, подвергшихся воздействию полиморфного вируса. Нестабильные оборотни, борющиеся с целостностью своей личности. +3 к Привлекательности, +2 к Ловкости.",
    "Chitinoid": "Хитиноид",
    "Through bizarre radiation-induced evolution, these humans have taken on the characteristics of hardy insects. Their mottled skin forms a tough exoskeleton, making them incredibly resilient and fast, but they are often viewed with suspicion and disgust by others. +3 Constitution, +2 Speed.": "В результате причудливой радиационной эволюции эти люди приобрели черты выносливых насекомых. Их пятнистая кожа образует прочный экзоскелет, делая их невероятно стойкими и быстрыми, но на них часто смотрят с подозрением и отвращением. +3 к Телосложению, +2 к Скорости.",
    "Verdant": "Зеленый",
    "A rare mutation has intertwined human and plant DNA. The Verdant have bark-like skin and can draw sustenance from sunlight, reducing their need for food and water. They are incredibly hardy but tend towards slow, deliberate action. +3 Constitution, +2 Faith.": "Редкая мутация переплела ДНК человека и растения. У Зеленых кора-подобная кожа, и они могут получать пропитание от солнечного света, что снижает их потребность в еде и воде. Они невероятно выносливы, но склонны к медленным, обдуманным действиям. +3 к Телосложению, +2 к Вере.",
    "The Irradiated": "Облученный",
    "Born in the lethal glow of high-radiation zones, the Irradiated are immune to its effects, even finding a strange vitality within it. Their bodies often bear non-lethal mutations and a faint, eerie luminescence. +3 Faith, +2 Constitution.": "Рожденные в смертельном сиянии зон с высокой радиацией, Облученные невосприимчивы к ее воздействию, даже находя в ней странную жизненную силу. Их тела часто несут несмертельные мутации и слабое, жуткое свечение. +3 к Вере, +2 к Телосложению.",
    "The Sunken": "Затонувший",
    "Generations of brutal survival have devolved these humans into a primal, non-verbal state. They operate on pure instinct and pack dynamics, possessing immense physical strength and razor-sharp senses honed for hunting in the ruins. +3 Strength, +2 Perception.": "Поколения жестокого выживания деградировали этих людей до первобытного, невербального состояния. Они действуют на чистом инстинкте и динамике стаи, обладая огромной физической силой и острыми как бритва чувствами, отточенными для охоты в руинах. +3 к Силе, +2 к Восприятию.",
    "Echo": "Эхо",
    "Semi-corporeal beings born from a psychic cataclysm or a rogue AI's death cry. They are insubstantial and perceptive, able to phase through small objects and sense emotional residues. +3 Wisdom, +2 Perception.": "Полу-телесные существа, рожденные в результате психического катаклизма или предсмертного крика блуждающего ИИ. Они нематериальны и проницательны, способны проходить сквозь небольшие объекты и ощущать эмоциональные остатки. +3 к Мудрости, +2 к Восприятию.",
    "Sand-Swimmer": "Песчаный Пловец",
    "A human offshoot adapted to life in vast, irradiated sand seas. They have sleek bodies, excellent heat resistance, and an uncanny ability to navigate and move through loose sand and dunes. +3 Dexterity, +2 Constitution.": "Человеческий подвид, приспособленный к жизни в обширных, облученных песчаных морях. У них гладкие тела, отличная термостойкость и поразительная способность ориентироваться и передвигаться по рыхлому песку и дюнам. +3 к Ловкости, +2 к Телосложению.",
  }
};

export const postApocalypseLoc = {
  en: {
    ...postApocalypseBaseLoc.en,
    ...survivorLoc.en,
    ...mutantLoc.en,
    ...synthLoc.en,
    ...ghoulLoc.en,
    ...purebloodLoc.en,
    ...beastkinLoc.en,
    ...molePeopleLoc.en,
    ...theBlightedLoc.en,
    ...theSunScorchedLoc.en,
    ...theForgedLoc.en,
    ...crystallineLoc.en,
    ...fungaloidLoc.en,
    ...scrapperGuilderLoc.en,
    ...theMorphedLoc.en,
    ...chitinoidLoc.en,
    ...verdantLoc.en,
    ...theIrradiatedLoc.en,
    ...theSunkenLoc.en,
    ...echoLoc.en,
    ...sandSwimmerLoc.en,
  },
  ru: {
    ...postApocalypseBaseLoc.ru,
    ...survivorLoc.ru,
    ...mutantLoc.ru,
    ...synthLoc.ru,
    ...ghoulLoc.ru,
    ...purebloodLoc.ru,
    ...beastkinLoc.ru,
    ...molePeopleLoc.ru,
    ...theBlightedLoc.ru,
    ...theSunScorchedLoc.ru,
    ...theForgedLoc.ru,
    ...crystallineLoc.ru,
    ...fungaloidLoc.ru,
    ...scrapperGuilderLoc.ru,
    ...theMorphedLoc.ru,
    ...chitinoidLoc.ru,
    ...verdantLoc.ru,
    ...theIrradiatedLoc.ru,
    ...theSunkenLoc.ru,
    ...echoLoc.ru,
    ...sandSwimmerLoc.ru,
  }
};
