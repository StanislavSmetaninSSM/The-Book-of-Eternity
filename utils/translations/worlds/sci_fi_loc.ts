
import { humanLoc } from './sci_fi/human_loc';
import { cyborgLoc } from './sci_fi/cyborg_loc';
import { zoltanLoc } from './sci_fi/zoltan_loc';
import { ktharrLoc } from './sci_fi/ktharr_loc';
import { rockmanLoc } from './sci_fi/rockman_loc';
import { mantisLoc } from './sci_fi/mantis_loc';
import { engiLoc } from './sci_fi/engi_loc';
import { voidTouchedLoc } from './sci_fi/void_touched_loc';
import { symbioteLoc } from './sci_fi/symbiote_loc';
import { archivistLoc } from './sci_fi/archivist_loc';
import { upliftedCephalopodLoc } from './sci_fi/uplifted_cephalopod_loc';
import { naniteCollectiveLoc } from './sci_fi/nanite_collective_loc';
import { highGravityHumanLoc } from './sci_fi/high_gravity_human_loc';
import { phaseWalkerLoc } from './sci_fi/phase_walker_loc';
import { dominionSymbioteLoc } from './sci_fi/dominion_symbiote_loc';
import { geodeLoc } from './sci_fi/geode_loc';
import { thranHivemindLoc } from './sci_fi/thran_hivemind_loc';
import { luminLoc } from './sci_fi/lumin_loc';
import { nautilidLoc } from './sci_fi/nautilid_loc';
import { silvaniteLoc } from './sci_fi/silvanite_loc';

const sciFiBaseLoc = {
  en: {
    // Sci-Fi Races
    "Human": "Human",
    "Adaptable colonists, skilled in diplomacy. +2 Trade, +2 Persuasion, +1 Intelligence.": "Adaptable colonists, skilled in diplomacy. +2 Trade, +2 Persuasion, +1 Intelligence.",
    "Cyborg": "Cyborg",
    "Enhanced by technology, a blend of flesh and steel. +3 Strength, +2 Intelligence.": "Enhanced by technology, a blend of flesh and steel. +3 Strength, +2 Intelligence.",
    "Zoltan": "Zoltan",
    "Beings of pure energy, fast and brilliant. +3 Intelligence, +2 Speed.": "Beings of pure energy, fast and brilliant. +3 Intelligence, +2 Speed.",
    "K'tharr": "K'tharr",
    "A feline warrior race, agile and perceptive. +3 Dexterity, +2 Perception.": "A feline warrior race, agile and perceptive. +3 Dexterity, +2 Perception.",
    "Rockman": "Rockman",
    "Crystalline silicon-based lifeforms, incredibly durable but slow. +4 Constitution, +1 Strength.": "Crystalline silicon-based lifeforms, incredibly durable but slow. +4 Constitution, +1 Strength.",
    "Mantis": "Mantis",
    "Insectoid hunters, revered for their lightning-fast reflexes and combat prowess. +3 Speed, +2 Dexterity.": "Insectoid hunters, revered for their lightning-fast reflexes and combat prowess. +3 Speed, +2 Dexterity.",
    "Engi": "Engi",
    "A symbiotic race of organic beings and nanites, the Engi are unparalleled engineers and problem-solvers. +3 Intelligence, +2 Trade.": "A symbiotic race of organic beings and nanites, the Engi are unparalleled engineers and problem-solvers. +3 Intelligence, +2 Trade.",
    "The Void-Touched": "The Void-Touched",
    "Beings forever changed by exposure to raw hyperspace, their minds are powerful but their bodies are frail. +3 Wisdom, +2 Intelligence.": "Beings forever changed by exposure to raw hyperspace, their minds are powerful but their bodies are frail. +3 Wisdom, +2 Intelligence.",
    "Symbiote": "Symbiote",
    "A composite being of two organisms in perfect harmony, one providing brute strength, the other tactical intellect. +3 Strength, +2 Intelligence.": "A composite being of two organisms in perfect harmony, one providing brute strength, the other tactical intellect. +3 Strength, +2 Intelligence.",
    "The Archivist": "The Archivist",
    "A crystalline, silicon-based lifeform dedicated to preserving all universal knowledge, possessing immense memory and processing power. +4 Intelligence, +1 Wisdom.": "A crystalline, silicon-based lifeform dedicated to preserving all universal knowledge, possessing immense memory and processing power. +4 Intelligence, +1 Wisdom.",
    "Uplifted Cephalopod": "Uplifted Cephalopod",
    "A cephalopod species granted sapience through advanced genetic engineering. They perceive the world through a unique lens, possessing multiple brains and incredible problem-solving skills, but their aquatic origins make them clumsy outside of low-gravity environments. +3 Intelligence, +2 Wisdom.": "A cephalopod species granted sapience through advanced genetic engineering. They perceive the world through a unique lens, possessing multiple brains and incredible problem-solving skills, but their aquatic origins make them clumsy outside of low-gravity environments. +3 Intelligence, +2 Wisdom.",
    "Nanite Collective": "Nanite Collective",
    "Not a single organism, but a sapient swarm of nanites that can form a humanoid shape. They are incredibly resilient and can reconfigure their bodies, but lack the nuance of organic emotion. +3 Constitution, +2 Intelligence.": "Not a single organism, but a sapient swarm of nanites that can form a humanoid shape. They are incredibly resilient and can reconfigure their bodies, but lack the nuance of organic emotion. +3 Constitution, +2 Intelligence.",
    "High-Gravity Human": "High-Gravity Human",
    "Humans born and raised on a high-gravity world. Their bodies are dense and powerfully built, making them exceptionally strong and durable, though their reflexes can be slower in standard gravity. +3 Strength, +2 Constitution.": "Humans born and raised on a high-gravity world. Their bodies are dense and powerfully built, making them exceptionally strong and durable, though their reflexes can be slower in standard gravity. +3 Strength, +2 Constitution.",
    "Phase-Walker": "Phase-Walker",
    "Beings with a natural, unstable connection to other dimensions. They can briefly phase out of reality, making them incredibly elusive and difficult to track, but this instability makes them physically fragile. +3 Dexterity, +2 Luck.": "Beings with a natural, unstable connection to other dimensions. They can briefly phase out of reality, making them incredibly elusive and difficult to track, but this instability makes them physically fragile. +3 Dexterity, +2 Luck.",
    "Dominion Symbiote": "Dominion Symbiote",
    "A parasitic species that takes control of a host body. While the host provides physical form, the symbiote possesses a cunning, manipulative intellect and a thirst for power. +3 Persuasion, +2 Intelligence.": "A parasitic species that takes control of a host body. While the host provides physical form, the symbiote possesses a cunning, manipulative intellect and a thirst for power. +3 Persuasion, +2 Intelligence.",
    "Geode": "Geode",
    "Silicon-based lifeforms with crystalline bodies. Geodes are incredibly durable and process information with cold, deliberate logic, making them thoughtful but slow to act. +3 Constitution, +2 Wisdom.": "Silicon-based lifeforms with crystalline bodies. Geodes are incredibly durable and process information with cold, deliberate logic, making them thoughtful but slow to act. +3 Constitution, +2 Wisdom.",
    "Thran Hivemind": "Thran Hivemind",
    "Insectoid beings linked by a collective consciousness. While individuals are simple, the hive acts as one, excelling at coordinated tasks and understanding complex systems. +3 Perception, +2 Trade.": "Insectoid beings linked by a collective consciousness. While individuals are simple, the hive acts as one, excelling at coordinated tasks and understanding complex systems. +3 Perception, +2 Trade.",
    "Lumin": "Lumin",
    "Beings of sentient plasma held within sophisticated containment suits. They are incredibly fast and seem to bend probability, but their physical forms are inherently unstable. +3 Speed, +2 Luck.": "Beings of sentient plasma held within sophisticated containment suits. They are incredibly fast and seem to bend probability, but their physical forms are inherently unstable. +3 Speed, +2 Luck.",
    "Nautilid": "Nautilid",
    "Amphibious humanoids evolved in the crushing depths of high-pressure oceans. Their bodies are dense and powerful, built to withstand extreme environments. +3 Constitution, +2 Strength.": "Amphibious humanoids evolved in the crushing depths of high-pressure oceans. Their bodies are dense and powerful, built to withstand extreme environments. +3 Constitution, +2 Strength.",
    "Silvanite": "Silvanite",
    "Mobile, sentient plant-based organisms. They have a deep, almost spiritual connection to the life cycles of the galaxy and possess immense patience and insight. +3 Faith, +2 Wisdom.": "Mobile, sentient plant-based organisms. They have a deep, almost spiritual connection to the life cycles of the galaxy and possess immense patience and insight. +3 Faith, +2 Wisdom.",
  },
  ru: {
    // Sci-Fi Races
    "Human": "Человек",
    "Adaptable colonists, skilled in diplomacy. +2 Trade, +2 Persuasion, +1 Intelligence.": "Адаптивные колонисты, искусные в дипломатии. +2 к Торговле, +2 к Убеждению, +1 к Интеллекту.",
    "Cyborg": "Киборг",
    "Enhanced by technology, a blend of flesh and steel. +3 Strength, +2 Intelligence.": "Улучшенные технологиями, смесь плоти и стали. +3 к Силе, +2 к Интеллекту.",
    "Zoltan": "Золтан",
    "Beings of pure energy, fast and brilliant. +3 Intelligence, +2 Speed.": "Существа из чистой энергии, быстрые и гениальные. +3 к Интеллекту, +2 к Скорости.",
    "K'tharr": "К'тарр",
    "A feline warrior race, agile and perceptive. +3 Dexterity, +2 Perception.": "Кошачья раса воинов, ловкая и проницательная. +3 к Ловкости, +2 к Восприятию.",
    "Rockman": "Рокмэн",
    "Crystalline silicon-based lifeforms, incredibly durable but slow. +4 Constitution, +1 Strength.": "Кристаллические кремниевые формы жизни, невероятно прочные, но медленные. +4 к Телосложению, +1 к Силе.",
    "Mantis": "Мантис",
    "Insectoid hunters, revered for their lightning-fast reflexes and combat prowess. +3 Speed, +2 Dexterity.": "Инсектоидные охотники, почитаемые за молниеносные рефлексы и боевое мастерство. +3 к Скорости, +2 к Ловкости.",
    "Engi": "Энджи",
    "A symbiotic race of organic beings and nanites, the Engi are unparalleled engineers and problem-solvers. +3 Intelligence, +2 Trade.": "Симбиотическая раса органических существ и нанитов, Энджи — непревзойденные инженеры и решатели проблем. +3 к Интеллекту, +2 к Торговле.",
    "The Void-Touched": "Коснувшийся Пустоты",
    "Beings forever changed by exposure to raw hyperspace, their minds are powerful but their bodies are frail. +3 Wisdom, +2 Intelligence.": "Существа, навсегда измененные воздействием чистого гиперпространства, их разум могущественен, но тела хрупки. +3 к Мудрости, +2 к Интеллекту.",
    "Symbiote": "Симбиот",
    "A composite being of two organisms in perfect harmony, one providing brute strength, the other tactical intellect. +3 Strength, +2 Intelligence.": "Составное существо из двух организмов в полной гармонии, один из которых обеспечивает грубую силу, а другой — тактический интеллект. +3 к Силе, +2 к Интеллекту.",
    "The Archivist": "Архивариус",
    "A crystalline, silicon-based lifeform dedicated to preserving all universal knowledge, possessing immense memory and processing power. +4 Intelligence, +1 Wisdom.": "Кристаллическая кремниевая форма жизни, посвященная сохранению всех вселенских знаний, обладающая огромной памятью и вычислительной мощностью. +4 к Интеллекту, +1 к Мудрости.",
    "Uplifted Cephalopod": "Возвышенный Цефалопод",
    "A cephalopod species granted sapience through advanced genetic engineering. They perceive the world through a unique lens, possessing multiple brains and incredible problem-solving skills, but their aquatic origins make them clumsy outside of low-gravity environments. +3 Intelligence, +2 Wisdom.": "Вид головоногих, получивший разум благодаря продвинутой генной инженерии. Они воспринимают мир через уникальную призму, обладая несколькими мозгами и невероятными способностями к решению проблем, но их водное происхождение делает их неуклюжими вне сред с низкой гравитацией. +3 к Интеллекту, +2 к Мудрости.",
    "Nanite Collective": "Нанитный Коллектив",
    "Not a single organism, but a sapient swarm of nanites that can form a humanoid shape. They are incredibly resilient and can reconfigure their bodies, but lack the nuance of organic emotion. +3 Constitution, +2 Intelligence.": "Не единый организм, а разумный рой нанитов, способный принимать гуманоидную форму. Они невероятно стойкие и могут изменять свои тела, но им не хватает тонкости органических эмоций. +3 к Телосложению, +2 к Интеллекту.",
    "High-Gravity Human": "Человек с высокой гравитации",
    "Humans born and raised on a high-gravity world. Their bodies are dense and powerfully built, making them exceptionally strong and durable, though their reflexes can be slower in standard gravity. +3 Strength, +2 Constitution.": "Люди, рожденные и выросшие на планете с высокой гравитацией. Их тела плотные и мощные, что делает их исключительно сильными и выносливыми, хотя их рефлексы могут быть медленнее в стандартной гравитации. +3 к Силе, +2 к Телосложению.",
    "Phase-Walker": "Фазовый Странник",
    "Beings with a natural, unstable connection to other dimensions. They can briefly phase out of reality, making them incredibly elusive and difficult to track, but this instability makes them physically fragile. +3 Dexterity, +2 Luck.": "Существа с естественной, нестабильной связью с другими измерениями. Они могут на короткое время выпадать из реальности, что делает их невероятно неуловимыми и трудными для отслеживания, но эта нестабильность делает их физически хрупкими. +3 к Ловкости, +2 к Удаче.",
    "Dominion Symbiote": "Симбиот Доминиона",
    "A parasitic species that takes control of a host body. While the host provides physical form, the symbiote possesses a cunning, manipulative intellect and a thirst for power. +3 Persuasion, +2 Intelligence.": "Паразитический вид, который берет под контроль тело хозяина. В то время как хозяин обеспечивает физическую форму, симбиот обладает хитрым, манипулятивным интеллектом и жаждой власти. +3 к Убеждению, +2 к Интеллекту.",
    "Geode": "Геод",
    "Silicon-based lifeforms with crystalline bodies. Geodes are incredibly durable and process information with cold, deliberate logic, making them thoughtful but slow to act. +3 Constitution, +2 Wisdom.": "Кремниевые формы жизни с кристаллическими телами. Геоды невероятно прочны и обрабатывают информацию с холодной, обдуманной логикой, что делает их вдумчивыми, но медленными в действиях. +3 к Телосложению, +2 к Мудрости.",
    "Thran Hivemind": "Улей Тран",
    "Insectoid beings linked by a collective consciousness. While individuals are simple, the hive acts as one, excelling at coordinated tasks and understanding complex systems. +3 Perception, +2 Trade.": "Инсектоидные существа, связанные коллективным сознанием. Хотя отдельные особи просты, улей действует как единое целое, преуспевая в скоординированных задачах и понимании сложных систем. +3 к Восприятию, +2 к Торговле.",
    "Lumin": "Люмин",
    "Beings of sentient plasma held within sophisticated containment suits. They are incredibly fast and seem to bend probability, but their physical forms are inherently unstable. +3 Speed, +2 Luck.": "Существа из разумной плазмы, удерживаемые в сложных защитных костюмах. Они невероятно быстры и, кажется, искажают вероятность, но их физические формы по своей природе нестабильны. +3 к Скорости, +2 к Удаче.",
    "Nautilid": "Наутилид",
    "Amphibious humanoids evolved in the crushing depths of high-pressure oceans. Their bodies are dense and powerful, built to withstand extreme environments. +3 Constitution, +2 Strength.": "Земноводные гуманоиды, эволюционировавшие в сокрушительных глубинах океанов с высоким давлением. Их тела плотные и мощные, созданные для выживания в экстремальных условиях. +3 к Телосложению, +2 к Силе.",
    "Silvanite": "Сильванит",
    "Mobile, sentient plant-based organisms. They have a deep, almost spiritual connection to the life cycles of the galaxy and possess immense patience and insight. +3 Faith, +2 Wisdom.": "Подвижные, разумные организмы на основе растений. У них глубокая, почти духовная связь с жизненными циклами галактики, и они обладают огромным терпением и проницательностью. +3 к Вере, +2 к Мудрости.",
  }
};

export const sciFiLoc = {
  en: {
    ...sciFiBaseLoc.en,
    ...humanLoc.en,
    ...cyborgLoc.en,
    ...zoltanLoc.en,
    ...ktharrLoc.en,
    ...rockmanLoc.en,
    ...mantisLoc.en,
    ...engiLoc.en,
    ...voidTouchedLoc.en,
    ...symbioteLoc.en,
    ...archivistLoc.en,
    ...upliftedCephalopodLoc.en,
    ...naniteCollectiveLoc.en,
    ...highGravityHumanLoc.en,
    ...phaseWalkerLoc.en,
    ...dominionSymbioteLoc.en,
    ...geodeLoc.en,
    ...thranHivemindLoc.en,
    ...luminLoc.en,
    ...nautilidLoc.en,
    ...silvaniteLoc.en,
  },
  ru: {
    ...sciFiBaseLoc.ru,
    ...humanLoc.ru,
    ...cyborgLoc.ru,
    ...zoltanLoc.ru,
    ...ktharrLoc.ru,
    ...rockmanLoc.ru,
    ...mantisLoc.ru,
    ...engiLoc.ru,
    ...voidTouchedLoc.ru,
    ...symbioteLoc.ru,
    ...archivistLoc.ru,
    ...upliftedCephalopodLoc.ru,
    ...naniteCollectiveLoc.ru,
    ...highGravityHumanLoc.ru,
    ...phaseWalkerLoc.ru,
    ...dominionSymbioteLoc.ru,
    ...geodeLoc.ru,
    ...thranHivemindLoc.ru,
    ...luminLoc.ru,
    ...nautilidLoc.ru,
    ...silvaniteLoc.ru,
  }
};
