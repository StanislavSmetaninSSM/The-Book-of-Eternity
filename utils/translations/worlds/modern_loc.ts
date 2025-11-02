import { humanLoc } from './modern/human_loc';
import { awakenedLoc } from './modern/awakened_loc';
import { adamuCloneLoc } from './modern/adamu_clone_loc';
import { rogueDroneLoc } from './modern/rogue_drone_loc';
import { royalBloodlineLoc } from './modern/royal_bloodline_loc';
import { reptilianLoc } from './modern/reptilian_loc';
import { agentLoc } from './modern/agent_loc';
import { doppelgangerLoc } from './modern/doppelganger_loc';
import { shadowPersonLoc } from './modern/shadow_person_loc';
import { slenderLoc } from './modern/slender_loc';
import { vampireLoc } from './modern/vampire_loc';
import { replicantLoc } from './modern/replicant_loc';
import { chronologicallyDisplacedLoc } from './modern/chronologically_displaced_loc';
import { echoLoc } from './modern/echo_loc';
import { ancientLoc } from './modern/ancient_loc';
import { werewolfLoc } from './modern/werewolf_loc';
import { yetiLoc } from './modern/yeti_loc';
import { shiftedLoc } from './modern/shifted_loc';
import { greyLoc } from './modern/grey_loc';
import { shinigamiLoc } from './modern/shinigami_loc';
import { deathNoteLoc } from './modern/death_note_loc';

const modernBaseLoc = {
  en: {
    "Human": "Human",
    "The dominant species, diverse in all aspects. +1 to Trade, Persuasion, Intelligence, Luck, and Perception.": "The dominant species, diverse in all aspects. +1 to Trade, Persuasion, Intelligence, Luck, and Perception.",
    "The Awakened": "The Awakened",
    "Descendants of a secret bloodline touched by the 'Prometheus' engineer, Enki. They lack the genetic 'veil' that clouds the perception of most of humanity, allowing them to sense the hidden structures of reality and the 'null-space' beyond. +3 Wisdom, +2 Luck.": "Descendants of a secret bloodline touched by the 'Prometheus' engineer, Enki. They lack the genetic 'veil' that clouds the perception of most of humanity, allowing them to sense the hidden structures of reality and the 'null-space' beyond. +3 Wisdom, +2 Luck.",
    "Adamu Clone": "Adamu Clone",
    "A bio-engineered human based on the primordial 'Adamu' template, created by the Anunnaki as a perfect worker. Possessing immense strength and resilience, you have broken free from your programmed purpose and now seek your own destiny in a world that sees you as a product. +3 Strength, +2 Constitution.": "A bio-engineered human based on the primordial 'Adamu' template, created by the Anunnaki as a perfect worker. Possessing immense strength and resilience, you have broken free from your programmed purpose and now seek your own destiny in a world that sees you as a product. +3 Strength, +2 Constitution.",
    "Rogue Drone": "Rogue Drone",
    "Once a cybernetic enforcer for the Anunnaki, known to ancient humans as a Nephilim. A logic cascade or a stray signal severed your connection to the hive mind. Now, you operate as an independent entity, your advanced logic and durable chassis making you a formidable, if alien, presence. +3 Intelligence, +2 Constitution.": "Once a cybernetic enforcer for the Anunnaki, known to ancient humans as a Nephilim. A logic cascade or a stray signal severed your connection to the hive mind. Now, you operate as an independent entity, your advanced logic and durable chassis making you a formidable, if alien, presence. +3 Intelligence, +2 Constitution.",
    "Royal Bloodline": "Royal Bloodline",
    "You carry the diluted but potent genes of the Anunnaki 'god-kings' who ruled antiquity. This lineage grants you a natural, almost hypnotic charisma and an air of authority that makes others instinctively want to follow or obey. But this heritage is both a gift and a target. +3 Persuasion, +2 Attractiveness.": "You carry the diluted but potent genes of the Anunnaki 'god-kings' who ruled antiquity. This lineage grants you a natural, almost hypnotic charisma and an air of authority that makes others instinctively want to follow or obey. But this heritage is both a gift and a target. +3 Persuasion, +2 Attractiveness.",
    "Reptilian": "Reptilian",
    "A shapeshifting reptilian humanoid from a hidden lineage, skilled in manipulation and influence. +3 Persuasion, +2 Intelligence.": "A shapeshifting reptilian humanoid from a hidden lineage, skilled in manipulation and influence. +3 Persuasion, +2 Intelligence.",
    "Agent": "Agent",
    "A genetically or technologically altered human agent of a clandestine organization, possessing a commanding presence and an unnerving gaze. +3 Persuasion, +2 Perception.": "A genetically or technologically altered human agent of a clandestine organization, possessing a commanding presence and an unnerving gaze. +3 Persuasion, +2 Perception.",
    "Doppelgänger": "Doppelgänger",
    "A being with the uncanny ability to perfectly replicate others, a master of infiltration and social engineering. +3 Attractiveness, +2 Persuasion.": "A being with the uncanny ability to perfectly replicate others, a master of infiltration and social engineering. +3 Attractiveness, +2 Persuasion.",
    "Shadow Person": "Shadow Person",
    "A fleeting entity of pure shadow, able to move unseen and unheard, their very presence causing a sense of dread. +3 Dexterity, +2 Luck.": "A fleeting entity of pure shadow, able to move unseen and unheard, their very presence causing a sense of dread. +3 Dexterity, +2 Luck.",
    "The Slender": "The Slender",
    "An unnaturally tall, faceless entity in a dark suit, whose mere presence can fray the sanity of those nearby. +3 Persuasion, +2 Wisdom.": "An unnaturally tall, faceless entity in a dark suit, whose mere presence can fray the sanity of those nearby. +3 Persuasion, +2 Wisdom.",
    "Vampire": "Vampire",
    "An immortal predator living in the shadows of modern society, possessing supernatural charm and resilience. +3 Attractiveness, +2 Constitution.": "An immortal predator living in the shadows of modern society, possessing supernatural charm and resilience. +3 Attractiveness, +2 Constitution.",
    "The Replicant": "The Replicant",
    "Bio-engineered androids, nearly indistinguishable from humans, built for specific tasks. They possess superior strength and speed but often grapple with questions of identity. +3 Strength, +2 Speed.": "Bio-engineered androids, nearly indistinguishable from humans, built for specific tasks. They possess superior strength and speed but often grapple with questions of identity. +3 Strength, +2 Speed.",
    "The Chronologically Displaced": "The Chronologically Displaced",
    "An individual accidentally thrown through time, possessing knowledge of a different era but struggling with the modern world. +3 Luck, +2 Wisdom.": "An individual accidentally thrown through time, possessing knowledge of a different era but struggling with the modern world. +3 Luck, +2 Wisdom.",
    "The Echo": "The Echo",
    "A psychic imprint of a deceased person, a ghost bound to a specific place or object, able to perceive things others cannot. +3 Wisdom, +2 Perception.": "A psychic imprint of a deceased person, a ghost bound to a specific place or object, able to perceive things others cannot. +3 Wisdom, +2 Perception.",
    "Ancient": "Ancient",
    "Legends whisper of them as Atlanteans, the first true civilization to rise on Earth. Long before recorded history, their society bent the laws of physics to its will, navigating the void between worlds and wielding energies that could reshape continents. Their minds, evolved over countless generations, were their greatest achievement—powerful psionic instruments capable of touching other thoughts and moving the physical world with sheer will. Yet, for all their mastery, they were humbled by a silent, cosmic force. A cataclysm from the heavens shattered their golden age, erasing their empire from the face of the Earth in a single, fiery moment. In their final, desperate hours, a chosen few were sealed in subterranean arks, intended to outlast the ensuing winter. They were meant to sleep for generations, not eons. Damaged by the very impact they sought to escape, their long slumber stretched into an abyss of time, preserving them as living fossils of a world that is now nothing but dust and myth. Bonus: +3 Intelligence, +2 Wisdom.": "Legends whisper of them as Atlanteans, the first true civilization to rise on Earth. Long before recorded history, their society bent the laws of physics to its will, navigating the void between worlds and wielding energies that could reshape continents. Their minds, evolved over countless generations, were their greatest achievement—powerful psionic instruments capable of touching other thoughts and moving the physical world with sheer will. Yet, for all their mastery, they were humbled by a silent, cosmic force. A cataclysm from the heavens shattered their golden age, erasing their empire from the face of the Earth in a single, fiery moment. In their final, desperate hours, a chosen few were sealed in subterranean arks, intended to outlast the ensuing winter. They were meant to sleep for generations, not eons. Damaged by the very impact they sought to escape, their long slumber stretched into an abyss of time, preserving them as living fossils of a world that is now nothing but dust and myth. Bonus: +3 Intelligence, +2 Wisdom.",
    "Werewolf": "Werewolf",
    "A human cursed with a primal, bestial nature that surfaces under duress or the full moon. They live in a constant struggle, hiding their secret while benefiting from enhanced strength, senses, and resilience. +3 Strength, +1 Constitution, +1 Perception.": "A human cursed with a primal, bestial nature that surfaces under duress or the full moon. They live in a constant struggle, hiding their secret while benefiting from enhanced strength, senses, and resilience. +3 Strength, +1 Constitution, +1 Perception.",
    "Yeti": "Yeti",
    "A relict hominid, a surviving branch of an ancient lineage. Incredibly strong and resilient, adapted to harsh, remote environments. Elusive and misunderstood, often mistaken for a myth. They possess a simple, profound wisdom of the natural world. +4 Strength, +1 Constitution.": "A relict hominid, a surviving branch of an ancient lineage. Incredibly strong and resilient, adapted to harsh, remote environments. Elusive and misunderstood, often mistaken for a myth. They possess a simple, profound wisdom of the natural world. +4 Strength, +1 Constitution.",
    "The Shifted": "The Shifted",
    "A human from a nearly identical reality, but with key differences. They are haunted by 'glitches'—memories of a world that is almost, but not quite, this one. This gives them a strange insight and an uncanny ability to notice discrepancies. +3 Wisdom, +2 Perception.": "A human from a nearly identical reality, but with key differences. They are haunted by 'glitches'—memories of a world that is almost, but not quite, this one. This gives them a strange insight and an uncanny ability to notice discrepancies. +3 Wisdom, +2 Perception.",
    "The Grey": "The Grey",
    "An alien species operating in the shadows of human society for decades. Physically frail, they possess enormous intellects and advanced psionic capabilities, focusing on research, abduction, and information gathering. Their motives are inscrutable. +4 Intelligence, +1 Wisdom.": "An alien species operating in the shadows of human society for decades. Physically frail, they possess enormous intellects and advanced psionic capabilities, focusing on research, abduction, and information gathering. Their motives are inscrutable. +4 Intelligence, +1 Wisdom.",
    "Shinigami": "Shinigami",
    "A god of death from another realm, bound to observe and guide the flow of mortal lives. You exist beyond normal human perception, able to phase between the material and spiritual worlds. Your very essence is tied to death itself, giving you an otherworldly understanding of mortality. +3 Perception, +2 Wisdom.": "A god of death from another realm, bound to observe and guide the flow of mortal lives. You exist beyond normal human perception, able to phase between the material and spiritual worlds. Your very essence is tied to death itself, giving you an otherworldly understanding of mortality. +3 Perception, +2 Wisdom.",
    "Death Note User": "Death Note User",
    "A human who has obtained a Death Note, a supernatural artifact that grants the power to kill anyone whose name you write in it. This immense power has fundamentally changed you, whether awakening a god complex or burdening you with the weight of ultimate responsibility. You walk the line between justice and madness. +3 Intelligence, +2 Faith.": "A human who has obtained a Death Note, a supernatural artifact that grants the power to kill anyone whose name you write in it. This immense power has fundamentally changed you, whether awakening a god complex or burdening you with the weight of ultimate responsibility. You walk the line between justice and madness. +3 Intelligence, +2 Faith.",
  },
  ru: {
    "Human": "Человек",
    "The dominant species, diverse in all aspects. +1 to Trade, Persuasion, Intelligence, Luck, and Perception.": "Доминирующий вид, разнообразный во всех аспектах. +1 к Торговле, Убеждению, Интеллекту, Удаче и Восприятию.",
    "The Awakened": "Пробуждённый",
    "Descendants of a secret bloodline touched by the 'Prometheus' engineer, Enki. They lack the genetic 'veil' that clouds the perception of most of humanity, allowing them to sense the hidden structures of reality and the 'null-space' beyond. +3 Wisdom, +2 Luck.": "Потомки тайной родословной, затронутой инженером-«Прометеем» Энки. У них отсутствует генетическая «завеса», которая затуманивает восприятие большей части человечества, что позволяет им ощущать скрытые структуры реальности и «нуль-пространство» за её пределами. +3 к Мудрости, +2 к Удаче.",
    "Adamu Clone": "Клон Адаму",
    "A bio-engineered human based on the primordial 'Adamu' template, created by the Anunnaki as a perfect worker. Possessing immense strength and resilience, you have broken free from your programmed purpose and now seek your own destiny in a world that sees you as a product. +3 Strength, +2 Constitution.": "Биоинженерный человек, основанный на первоначальном шаблоне «Адаму», созданном Аннунаками как идеальный работник. Обладая огромной силой и выносливостью, вы вырвались из своего запрограммированного предназначения и теперь ищете свою судьбу в мире, который видит в вас лишь продукт. +3 к Силе, +2 к Телосложению.",
    "Rogue Drone": "Дрон-отступник",
    "Once a cybernetic enforcer for the Anunnaki, known to ancient humans as a Nephilim. A logic cascade or a stray signal severed your connection to the hive mind. Now, you operate as an independent entity, your advanced logic and durable chassis making you a formidable, if alien, presence. +3 Intelligence, +2 Constitution.": "Некогда кибернетический силовик Аннунаков, известный древним людям как Нефилим. Логический каскад или случайный сигнал разорвал вашу связь с коллективным разумом. Теперь вы действуете как независимая сущность, а ваша продвинутая логика и прочное шасси делают вас грозным, хоть и чуждым, созданием. +3 к Интеллекту, +2 к Телосложению.",
    "Royal Bloodline": "Королевская кровь",
    "You carry the diluted but potent genes of the Anunnaki 'god-kings' who ruled antiquity. This lineage grants you a natural, almost hypnotic charisma and an air of authority that makes others instinctively want to follow or obey. But this heritage is both a gift and a target. +3 Persuasion, +2 Attractiveness.": "Вы несёте в себе разбавленные, но мощные гены «царей-богов» Аннунаков, правивших в древности. Эта родословная даёт вам природную, почти гипнотическую харизму и ауру власти, заставляющую других инстинктивно следовать за вами или подчиняться. Но это наследие — и дар, и мишень. +3 к Убеждению, +2 к Привлекательности.",
    "Reptilian": "Рептилоид",
    "A shapeshifting reptilian humanoid from a hidden lineage, skilled in manipulation and influence. +3 Persuasion, +2 Intelligence.": "Человекоподобный рептилоид-оборотень из скрытого рода, искусный в манипуляциях и влиянии. +3 к Убеждению, +2 к Интеллекту.",
    "Agent": "Агент",
    "A genetically or technologically altered human agent of a clandestine organization, possessing a commanding presence and an unnerving gaze. +3 Persuasion, +2 Perception.": "Генетически или технологически измененный человек, агент тайной организации, обладающий властным присутствием и тревожным взглядом. +3 к Убеждению, +2 к Восприятию.",
    "Doppelgänger": "Доппельгангер",
    "A being with the uncanny ability to perfectly replicate others, a master of infiltration and social engineering. +3 Attractiveness, +2 Persuasion.": "Существо с поразительной способностью идеально копировать других, мастер инфильтрации и социальной инженерии. +3 к Привлекательности, +2 к Убеждению.",
    "Shadow Person": "Человек-тень",
    "A fleeting entity of pure shadow, able to move unseen and unheard, their very presence causing a sense of dread. +3 Dexterity, +2 Luck.": "Мимолетное существо из чистой тени, способное двигаться невидимо и неслышно, чье само присутствие вызывает чувство ужаса. +3 к Ловкости, +2 к Удаче.",
    "The Slender": "Слендер",
    "An unnaturally tall, faceless entity in a dark suit, whose mere presence can fray the sanity of those nearby. +3 Persuasion, +2 Wisdom.": "Неестественно высокое, безликое существо в темном костюме, чье простое присутствие может подорвать рассудок окружающих. +3 к Убеждению, +2 к Мудрости.",
    "Vampire": "Вампир",
    "An immortal predator living in the shadows of modern society, possessing supernatural charm and resilience. +3 Attractiveness, +2 Constitution.": "Бессмертный хищник, живущий в тени современного общества, обладающий сверхъестественным обаянием и стойкостью. +3 к Привлекательности, +2 к Телосложению.",
    "The Replicant": "Репликант",
    "Bio-engineered androids, nearly indistinguishable from humans, built for specific tasks. They possess superior strength and speed but often grapple with questions of identity. +3 Strength, +2 Speed.": "Биоинженерные андроиды, почти неотличимые от людей, созданные для выполнения конкретных задач. Они обладают превосходной силой и скоростью, но часто борются с вопросами идентичности. +3 к Силе, +2 к Скорости.",
    "The Chronologically Displaced": "Смещенный во времени",
    "An individual accidentally thrown through time, possessing knowledge of a different era but struggling with the modern world. +3 Luck, +2 Wisdom.": "Человек, случайно попавший в другое время, обладающий знаниями другой эпохи, но с трудом приспосабливающийся к современному миру. +3 к Удаче, +2 к Мудрости.",
    "The Echo": "Эхо",
    "A psychic imprint of a deceased person, a ghost bound to a specific place or object, able to perceive things others cannot. +3 Wisdom, +2 Perception.": "Психический отпечаток умершего человека, призрак, привязанный к определенному месту или предмету, способный воспринимать то, что недоступно другим. +3 к Мудрости, +2 к Восприятию.",
    "Ancient": "Древний",
    "Legends whisper of them as Atlanteans, the first true civilization to rise on Earth. Long before recorded history, their society bent the laws of physics to its will, navigating the void between worlds and wielding energies that could reshape continents. Their minds, evolved over countless generations, were their greatest achievement—powerful psionic instruments capable of touching other thoughts and moving the physical world with sheer will. Yet, for all their mastery, they were humbled by a silent, cosmic force. A cataclysm from the heavens shattered their golden age, erasing their empire from the face of the Earth in a single, fiery moment. In their final, desperate hours, a chosen few were sealed in subterranean arks, intended to outlast the ensuing winter. They were meant to sleep for generations, not eons. Damaged by the very impact they sought to escape, their long slumber stretched into an abyss of time, preserving them as living fossils of a world that is now nothing but dust and myth. Bonus: +3 Intelligence, +2 Wisdom.": "Легенды шепчут о них как об Атлантах, первой истинной цивилизации, возникшей на Земле. Задолго до начала писаной истории их общество подчинило себе законы физики, путешествуя в пустоте между мирами и владея энергиями, способными изменять континенты. Их разум, развивавшийся на протяжении бесчисленных поколений, был их величайшим достижением — мощные псионические инструменты, способные касаться чужих мыслей и перемещать физический мир одной лишь силой воли. Однако, несмотря на все их могущество, они были смирены безмолвной космической силой. Катаклизм с небес разрушил их золотой век, стерев их империю с лица Земли в один огненный миг. В свои последние, отчаянные часы избранные были запечатаны в подземных ковчегах, чтобы пережить наступившую зиму. Они должны были спать поколения, а не эоны. Поврежденные тем самым ударом, от которого они пытались спастись, их долгий сон растянулся в бездну времени, сохранив их как живые ископаемые мира, который теперь не более чем прах и миф. Бонус: +3 к Интеллекту, +2 к Мудрости.",
    "Werewolf": "Оборотень",
    "A human cursed with a primal, bestial nature that surfaces under duress or the full moon. They live in a constant struggle, hiding their secret while benefiting from enhanced strength, senses, and resilience. +3 Strength, +1 Constitution, +1 Perception.": "Человек, проклятый первобытной звериной натурой, которая проявляется в моменты стресса или в полнолуние. Он живет в постоянной борьбе, скрывая свою тайну и пользуясь повышенной силой, чувствами и выносливостью. +3 к Силе, +1 к Телосложению, +1 к Восприятию.",
    "Yeti": "Йети",
    "A relict hominid, a surviving branch of an ancient lineage. Incredibly strong and resilient, adapted to harsh, remote environments. Elusive and misunderstood, often mistaken for a myth. They possess a simple, profound wisdom of the natural world. +4 Strength, +1 Constitution.": "Реликтовый гоминид, уцелевшая ветвь древнего рода. Невероятно сильный и выносливый, приспособленный к суровым, удаленным условиям. Неуловим и неправильно понят, часто принимаемый за миф. Обладает простой, но глубокой мудростью природы. +4 к Силе, +1 к Телосложению.",
    "The Shifted": "Сдвинутый",
    "A human from a nearly identical reality, but with key differences. They are haunted by 'glitches'—memories of a world that is almost, but not quite, this one. This gives them a strange insight and a uncanny ability to notice discrepancies. +3 Wisdom, +2 Perception.": "Человек из почти идентичной реальности, но с ключевыми отличиями. Его преследуют «сбои» — воспоминания о мире, который почти, но не совсем, такой же, как этот. Это дает ему странную проницательность и поразительную способность замечать несоответствия. +3 к Мудрости, +2 к Восприятию.",
    "The Grey": "Серый",
    "An alien species operating in the shadows of human society for decades. Physically frail, they possess enormous intellects and advanced psionic capabilities, focusing on research, abduction, and information gathering. Their motives are inscrutable. +4 Intelligence, +1 Wisdom.": "Инопланетный вид, десятилетиями действующий в тени человеческого общества. Физически хрупкие, они обладают огромным интеллектом и продвинутыми псионическими способностями, сосредоточенными на исследованиях, похищениях и сборе информации. Их мотивы непостижимы. +4 к Интеллекту, +1 к Мудрости.",
    "Shinigami": "Синигами",
    "A god of death from another realm, bound to observe and guide the flow of mortal lives. You exist beyond normal human perception, able to phase between the material and spiritual worlds. Your very essence is tied to death itself, giving you an otherworldly understanding of mortality. +3 Perception, +2 Wisdom.": "Бог смерти из иного мира, обязанный наблюдать и направлять поток смертных жизней. Вы существуете за пределами обычного человеческого восприятия, способны переходить между материальным и духовным мирами. Ваша сущность связана с самой смертью, даря вам потустороннее понимание смертности. +3 к Восприятию, +2 к Мудрости.",
    "Death Note User": "Пользователь Тетради Смерти",
    "A human who has obtained a Death Note, a supernatural artifact that grants the power to kill anyone whose name you write in it. This immense power has fundamentally changed you, whether awakening a god complex or burdening you with the weight of ultimate responsibility. You walk the line between justice and madness. +3 Intelligence, +2 Faith.": "Человек, получивший Тетрадь Смерти, сверхъестественный артефакт, дающий силу убить любого, чье имя вы в неё запишете. Эта огромная власть кардинально изменила вас, либо пробудив комплекс бога, либо обременив весом абсолютной ответственности. Вы балансируете между справедливостью и безумием. +3 к Интеллекту, +2 к Вере.",
  }
};

export const modernLoc = {
  en: {
    ...modernBaseLoc.en,
    ...humanLoc.en,
    ...awakenedLoc.en,
    ...adamuCloneLoc.en,
    ...rogueDroneLoc.en,
    ...royalBloodlineLoc.en,
    ...reptilianLoc.en,
    ...agentLoc.en,
    ...doppelgangerLoc.en,
    ...shadowPersonLoc.en,
    ...slenderLoc.en,
    ...vampireLoc.en,
    ...replicantLoc.en,
    ...chronologicallyDisplacedLoc.en,
    ...echoLoc.en,
    ...ancientLoc.en,
    ...werewolfLoc.en,
    ...yetiLoc.en,
    ...shiftedLoc.en,
    ...greyLoc.en,
    ...shinigamiLoc.en,
    ...deathNoteLoc.en,
  },
  ru: {
    ...modernBaseLoc.ru,
    ...humanLoc.ru,
    ...awakenedLoc.ru,
    ...adamuCloneLoc.ru,
    ...rogueDroneLoc.ru,
    ...royalBloodlineLoc.ru,
    ...reptilianLoc.ru,
    ...agentLoc.ru,
    ...doppelgangerLoc.ru,
    ...shadowPersonLoc.ru,
    ...slenderLoc.ru,
    ...vampireLoc.ru,
    ...replicantLoc.ru,
    ...chronologicallyDisplacedLoc.ru,
    ...echoLoc.ru,
    ...ancientLoc.ru,
    ...werewolfLoc.ru,
    ...yetiLoc.ru,
    ...shiftedLoc.ru,
    ...greyLoc.ru,
    ...shinigamiLoc.ru,
    ...deathNoteLoc.ru,
  }
};