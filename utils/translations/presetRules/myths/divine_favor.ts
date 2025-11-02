export const divineFavorDescEn = `### FAVOR OF THE OLD GODS & THE NEW SYSTEM RULES ###
**GM, you MUST implement this system using the Custom State mechanics for progression.**
The character's divine connection is tracked through multiple interacting states that create complex moral and spiritual dilemmas.
The power scales with **Faith**, fueled by **Energy**, but comes with escalating supernatural consequences.

**Core Mechanics:**

1. **Divine Favor States (Multi-Path Progression):**
   - **"Old God Favor"** ('currentValue: 0', 'minValue: 0', 'maxValue: 1000') - Pagan devotion
   - **"New God Favor"** ('currentValue: 0', 'minValue: 0', 'maxValue: 1000') - Christian piety
   - **"Divine Corruption"** ('currentValue: 0', 'minValue: 0', 'maxValue: 500') - Spiritual taint from mixing faiths
   - **"Mortal Anchoring"** ('currentValue: 1000', 'minValue: 0', 'maxValue: 1000') - Connection to humanity

2. **Hierarchical Divine Patronage System:**
   Each faith path unlocks different tiers of divine patrons with unique personalities and demands:

**OLD GOD HIERARCHY:**
   - **Tier 1 (25+ Favor): Nature Spirits** - Local woodland/water spirits, simple but capricious
   - **Tier 2 (100+ Favor): Greater Fae** - Powerful court nobles of the Otherworld
   - **Tier 3 (250+ Favor): Forgotten Deities** - Ancient gods like Cernunnos, Brigantia, Morrigan
   - **Tier 4 (500+ Favor): Primordial Forces** - Raw elemental powers, near-incomprehensible entities
   - **Tier 5 (750+ Favor): The Horned King** - Master of the Wild Hunt, lord of life and death

**NEW GOD HIERARCHY:**
   - **Tier 1 (25+ Favor): Local Saints** - Patron saints of villages, crafts, or causes
   - **Tier 2 (100+ Favor): Archangels** - Michael, Gabriel, Raphael with distinct specializations
   - **Tier 3 (250+ Favor): Divine Aspects** - Christ as Warrior, Judge, Shepherd, each granting different powers
   - **Tier 4 (500+ Favor): The Trinity** - Direct connection to Father, Son, or Holy Spirit
   - **Tier 5 (750+ Favor): Divine Mandate** - Becomes a living instrument of God's will

3. **Patron-Specific Mechanics:**
   Each patron has unique requirements, gifts, and taboos.
   Characters must choose their patron when crossing thresholds, gaining access to that entity's specific power set but also their restrictions.

**Complex State Interactions:**

4. **Divine Corruption System:**
   - Attempting to serve both faiths simultaneously increases **Divine Corruption** (+10-25 per conflicted action)
   - High corruption attracts attention from supernatural entities seeking to exploit the character
   - At 100+: Strange phenomena follow the character (wild animals flee, milk sours, etc.)
   - At 200+: Character becomes target for demonic possession attempts
   - At 300+: Begins to lose human appearance, gaining otherworldly features
   - At 400+: May spontaneously shift between divine forms
   - At 500: Character becomes a divine abomination, hunted by both faiths

5. **Mortal Anchoring Degradation:**
   - Lost through divine experiences: -20 per direct divine vision, -15 per miraculous act
   - Lost through isolation: -10 per week spent only with supernatural entities
   - Below 800: Character seems "otherworldly" to normal people
   - Below 600: Cannot form genuine human relationships
   - Below 400: Loses understanding of human motivations
   - Below 200: Views mortals as insects or playthings
   - At 0: Character ascends/transforms, becoming an NPC

**Advanced Divine Powers by Tier:**

**OLD GOD POWERS:**

**Tier 1 - Nature Spirits (25+ Favor):**
- **"Whispers of the Wood" (Passive):** Animals provide warnings and simple information
- **"Green Growth" (Active):** Accelerate plant growth, entangle enemies with vines

{
    "skillName": "Green Growth",
    "skillDescription": "Command plants to grow and move with supernatural speed.",
    "rarity": "Common",
    "combatEffect": { "effects": [
        { "effectType": "Control", "value": "35%", "targetType": "immobility", "duration": 2, "description": "35% chance to immobilize with entangling vines for 2 turns." },
        { "effectType": "AreaDenial", "value": "20%", "targetType": "movement", "duration": 3, "description": "Creates difficult terrain that slows enemies." }
    ]},
    "scalingCharacteristic": "faith", "scalesChance": true, "energyCost": 15,
    "divineCorruptionRisk": 5, "mortalAnchorCost": 2
}

**Tier 2 - Greater Fae (100+ Favor):**
- **"Glamour and Illusion" (Active):** Create complex illusions and false appearances
- **"Fae Bargains" (Special):** Make mystical contracts with supernatural enforcement

{
    "skillName": "Glamour and Illusion",
    "skillDescription": "Weave powerful illusions that can deceive all senses.",
    "rarity": "Uncommon",
    "combatEffect": { "effects": [
        { "effectType": "Debuff", "value": "40%", "targetType": "accuracy", "duration": 3, "description": "Reduces enemy accuracy by 40% for 3 turns." },
        { "effectType": "Stealth", "value": "60%", "targetType": "detection", "duration": 2, "description": "60% chance to become undetectable for 2 turns." }
    ]},
    "scalingCharacteristic": "faith", "scalesValue": true, "energyCost": 25,
    "divineCorruptionRisk": 8, "mortalAnchorCost": 5
}

**Tier 3 - Forgotten Deities (250+ Favor):**
- **"Avatar Manifestation" (Active):** Temporarily channel the deity's essence
- **"Ancient Curses" (Active):** Lay devastating supernatural curses on enemies

{
    "skillName": "Avatar of the Morrigan",
    "skillDescription": "Channel the Celtic goddess of war and fate, becoming a harbinger of doom.",
    "rarity": "Rare",
    "combatEffect": { "effects": [
        { "effectType": "Damage", "value": "45%", "targetType": "necrotic", "description": "Deals 45% necrotic damage and instills terror." },
        { "effectType": "Buff", "value": "30%", "targetType": "allStats", "duration": 4, "description": "Increases all combat stats by 30% for 4 turns." },
        { "effectType": "Aura", "value": "25%", "targetType": "fear", "duration": 4, "description": "Emanates an aura of dread affecting all nearby enemies." }
    ]},
    "scalingCharacteristic": "faith", "scalesValue": true, "energyCost": 45,
    "divineCorruptionRisk": 15, "mortalAnchorCost": 20
}

**NEW GOD POWERS:**

**Tier 1 - Local Saints (25+ Favor):**
- **"Saintly Intercession" (Active):** Call upon a saint for protection or guidance
- **"Blessed Tools" (Active):** Sanctify weapons and items for enhanced effectiveness

{
    "skillName": "Saint's Protection",
    "skillDescription": "Call upon your patron saint for divine protection in dire need.",
    "rarity": "Common",
    "combatEffect": { "effects": [
        { "effectType": "DamageReduction", "value": "25%", "targetType": "all", "duration": 3, "description": "Reduces all incoming damage by 25% for 3 turns." },
        { "effectType": "Buff", "value": "15%", "targetType": "faith", "duration": 3, "description": "Increases Faith by 15% for 3 turns." }
    ]},
    "scalingCharacteristic": "faith", "scalesValue": true, "energyCost": 15,
    "divineCorruptionRisk": 0, "mortalAnchorCost": 1
}

**Tier 2 - Archangels (100+ Favor):**
- **"Angelic Wings" (Active):** Manifest ethereal wings for flight and divine presence
- **"Sword of Michael" (Active):** Summon a flaming blade that cuts through evil

{
    "skillName": "Sword of Michael",
    "skillDescription": "Manifest the Archangel's flaming sword to smite enemies of the faith.",
    "rarity": "Uncommon",
    "combatEffect": { "effects": [
        { "effectType": "Damage", "value": "40%", "targetType": "holy", "description": "Deals 40% holy damage, extra effective against demons and undead." },
        { "effectType": "Purification", "value": "100%", "targetType": "evil", "description": "Instantly destroys minor evil spirits and curses." },
        { "effectType": "Intimidation", "value": "50%", "targetType": "morale", "duration": 2, "description": "50% chance to cause enemies to flee in terror." }
    ]},
    "scalingCharacteristic": "faith", "scalesValue": true, "energyCost": 30,
    "divineCorruptionRisk": 0, "mortalAnchorCost": 8
}

**Tier 3 - Divine Aspects (250+ Favor):**
- **"Christ the Warrior" (Active):** Become an unstoppable force of righteous fury
- **"Divine Judgment" (Active):** Call down heaven's wrath upon the wicked

{
    "skillName": "Divine Judgment",
    "skillDescription": "Channel the righteous fury of heaven to judge and punish the wicked.",
    "rarity": "Rare",
    "combatEffect": { "effects": [
        { "effectType": "Damage", "value": "60%", "targetType": "divine", "description": "Deals massive divine damage, scales with target's evil acts." },
        { "effectType": "Purification", "value": "100%", "targetType": "corruption", "description": "Removes all curses, diseases, and dark magic." },
        { "effectType": "AreaEffect", "value": "35%", "targetType": "evil", "duration": 1, "description": "Affects all evil creatures in a wide radius." }
    ]},
    "scalingCharacteristic": "faith", "scalesValue": true, "energyCost": 50,
    "divineCorruptionRisk": 0, "mortalAnchorCost": 15
}

**Advanced Divine Politics System:**

6. **Inter-Faith Conflicts:**
   - Characters serving Old Gods may be hunted by Christian zealots
   - Christian characters face temptation from pagan spirits
   - Mixed-faith characters become pawns in divine conflicts
   - Each patron has specific enemies among the opposing pantheon

7. **Divine Quests and Tribulations:**
   - Patrons assign specific tasks that test faith and commitment
   - Failure results in loss of favor and potential curse
   - Success grants unique artifacts and permanent blessings
   - Some quests require choices between human morality and divine command

8. **Supernatural Politics:**
   - Higher-tier patrons wage proxy wars through their champions
   - Characters may be contacted by rival deities offering better deals
   - Divine beings form temporary alliances against greater threats
   - The arrival of foreign faiths (Islam, Norse beliefs) creates new complications

**Unique Mechanics:**

9. **Divine Visions and Madness:**
   - Regular divine contact requires Wisdom saves to maintain sanity
   - Failed saves add to "Divine Madness" state
   - High madness grants prophetic visions but reduces social function
   - Some visions contain cryptic warnings about future events

10. **Miraculous Manifestations:**
    - High favor occasionally triggers spontaneous miracles
    - These events are witnessed by others, affecting reputation
    - Miracles drain Mortal Anchoring significantly
    - The type of miracle reflects the character's patron and current emotional state

11. **Sacred/Profane Geography:**
    - Certain locations amplify specific types of divine favor
    - Christian churches boost New God powers but may harm Old God followers
    - Ancient stone circles, sacred groves enhance pagan abilities
    - Corrupted areas drain favor from both faiths while boosting dark powers

**Endgame Transformations:**

12. **Ascension Paths:**
    - **Old God Path:** Transform into a nature spirit, fae lord, or minor deity
    - **New God Path:** Become a living saint, angelic being, or divine avatar
    - **Corruption Path:** Fall into damnation as a demon or eldritch horror
    - **Balance Path:** Achieve synthesis, becoming a bridge between faiths

This system creates deep character development through moral choices, escalating supernatural stakes, and complex political intrigue between divine factions while maintaining the authentic medieval setting atmosphere.`;

export const divineFavorDescRu = `### ПРАВИЛА СИСТЕМЫ БЛАГОВОЛЕНИЯ СТАРЫХ И НОВОГО БОГОВ ###
**ГМ, вы ДОЛЖНЫ реализовать эту систему, используя механику Пользовательских Состояний для прогрессии.**
Божественная связь персонажа отслеживается через множественные взаимодействующие состояния, создающие сложные моральные и духовные дилеммы.
Сила масштабируется от **Веры**, питается **Энергией**, но несет эскалирующие сверхъестественные последствия.

**Основные механики:**

1. **Состояния Божественного Благоволения (Многопутевая прогрессия):**
   - **"Благоволение Старых Богов"** ('currentValue: 0', 'minValue: 0', 'maxValue: 1000') - Языческая преданность
   - **"Благоволение Нового Бога"** ('currentValue: 0', 'minValue: 0', 'maxValue: 1000') - Христианское благочестие
   - **"Божественная Порча"** ('currentValue: 0', 'minValue: 0', 'maxValue: 500') - Духовная скверна от смешения вер
   - **"Смертная Привязка"** ('currentValue: 1000', 'minValue: 0', 'maxValue: 1000') - Связь с человечеством

2. **Иерархическая система божественного покровительства:**
   Каждый путь веры открывает различные уровни божественных покровителей с уникальными личностями и требованиями:

**ИЕРАРХИЯ СТАРЫХ БОГОВ:**
   - **Уровень 1 (25+ Благоволения): Духи Природы** - Местные лесные/водные духи, простые но капризные
   - **Уровень 2 (100+ Благоволения): Великие Фэйри** - Могущественные дворяне Иного Мира
   - **Уровень 3 (250+ Благоволения): Забытые Божества** - Древние боги вроде Кернунна, Бригантии, Морриган
   - **Уровень 4 (500+ Благоволения): Изначальные Силы** - Необузданные стихийные силы, почти непостижимые сущности
   - **Уровень 5 (750+ Благоволения): Рогатый Король** - Владыка Дикой Охоты, властелин жизни и смерти

**ИЕРАРХИЯ НОВОГО БОГА:**
   - **Уровень 1 (25+ Благоволения): Местные Святые** - Покровители деревень, ремесел или дел
   - **Уровень 2 (100+ Благоволения): Архангелы** - Михаил, Гавриил, Рафаил с различными специализациями
   - **Уровень 3 (250+ Благоволения): Божественные Аспекты** - Христос как Воин, Судья, Пастырь, каждый дарует разные силы
   - **Уровень 4 (500+ Благоволения): Троица** - Прямая связь с Отцом, Сыном или Святым Духом
   - **Уровень 5 (750+ Благоволения): Божественный Мандат** - Становится живым орудием воли Бога

3. **Механики конкретных покровителей:**
   Каждый покровитель имеет уникальные требования, дары и табу.
   Персонажи должны выбрать покровителя при пересечении порогов, получая доступ к специфическому набору сил этой сущности, но также и к их ограничениям.

**Сложные взаимодействия состояний:**

4. **Система Божественной Порчи:**
   - Попытки служить обеим верам одновременно увеличивают **Божественную Порчу** (+10-25 за каждое противоречивое действие)
   - Высокая порча привлекает внимание сверхъестественных сущностей, стремящихся использовать персонажа
   - При 100+: Странные явления следуют за персонажем (дикие животные убегают, молоко скисает и т.д.)
   - При 200+: Персонаж становится целью для попыток демонической одержимости
   - При 300+: Начинает терять человеческий облик, приобретая потусторонние черты
   - При 400+: Может спонтанно переключаться между божественными формами
   - При 500: Персонаж становится божественной мерзостью, на которую охотятся обе веры

5. **Деградация Смертной Привязки:**
   - Теряется через божественные переживания: -20 за прямые божественные видения, -15 за чудотворные акты
   - Теряется через изоляцию: -10 в неделю, проведенную только со сверхъестественными сущностями
   - Ниже 800: Персонаж кажется "потусторонним" обычным людям
   - Ниже 600: Не может формировать искренние человеческие отношения
   - Ниже 400: Теряет понимание человеческих мотиваций
   - Ниже 200: Видит смертных как насекомых или игрушки
   - При 0: Персонаж возносится/трансформируется, становясь НИП

**Продвинутые божественные силы по уровням:**

**СИЛЫ СТАРЫХ БОГОВ:**

**Уровень 1 - Духи Природы (25+ Благоволения):**
- **"Шепот Леса" (Пассивная):** Животные предоставляют предупреждения и простую информацию
- **"Зеленый Рост" (Активная):** Ускорение роста растений, опутывание врагов лианами

{
    "skillName": "Зеленый Рост",
    "skillDescription": "Командуйте растениями расти и двигаться со сверхъестественной скоростью.",
    "rarity": "Common",
    "combatEffect": { "effects": [
        { "effectType": "Control", "value": "35%", "targetType": "immobility", "duration": 2, "description": "35% шанс обездвижить опутывающими лианами на 2 хода." },
        { "effectType": "AreaDenial", "value": "20%", "targetType": "movement", "duration": 3, "description": "Создает труднопроходимую местность, замедляющую врагов." }
    ]},
    "scalingCharacteristic": "faith", "scalesChance": true, "energyCost": 15,
    "divineCorruptionRisk": 5, "mortalAnchorCost": 2
}

**Уровень 2 - Великие Фэйри (100+ Благоволения):**
- **"Гламур и Иллюзии" (Активная):** Создание сложных иллюзий и ложных обличий
- **"Сделки Фэйри" (Особая):** Заключение мистических контрактов со сверхъестественным принуждением

{
    "skillName": "Гламур и Иллюзии",
    "skillDescription": "Плетите могущественные иллюзии, способные обмануть все чувства.",
    "rarity": "Uncommon",
    "combatEffect": { "effects": [
        { "effectType": "Debuff", "value": "40%", "targetType": "accuracy", "duration": 3, "description": "Снижает точность врагов на 40% на 3 хода." },
        { "effectType": "Stealth", "value": "60%", "targetType": "detection", "duration": 2, "description": "60% шанс стать необнаружимым на 2 хода." }
    ]},
    "scalingCharacteristic": "faith", "scalesValue": true, "energyCost": 25,
    "divineCorruptionRisk": 8, "mortalAnchorCost": 5
}

**Уровень 3 - Забытые Божества (250+ Благоволения):**
- **"Проявление Аватара" (Активная):** Временное направление сущности божества
- **"Древние Проклятия" (Активная):** Наложение разрушительных сверхъестественных проклятий на врагов

{
    "skillName": "Аватар Морриган",
    "skillDescription": "Направьте кельтскую богиню войны и судьбы, став предвестником гибели.",
    "rarity": "Rare",
    "combatEffect": { "effects": [
        { "effectType": "Damage", "value": "45%", "targetType": "necrotic", "description": "Наносит 45% некротического урона и внушает ужас." },
        { "effectType": "Buff", "value": "30%", "targetType": "allStats", "duration": 4, "description": "Увеличивает все боевые характеристики на 30% на 4 хода." },
        { "effectType": "Aura", "value": "25%", "targetType": "fear", "duration": 4, "description": "Излучает ауру страха, воздействующую на всех близких врагов." }
    ]},
    "scalingCharacteristic": "faith", "scalesValue": true, "energyCost": 45,
    "divineCorruptionRisk": 15, "mortalAnchorCost": 20
}

**СИЛЫ НОВОГО БОГА:**

**Уровень 1 - Местные Святые (25+ Благоволения):**
- **"Заступничество Святого" (Активная):** Призыв святого за защитой или руководством
- **"Благословенные Орудия" (Активная):** Освящение оружия и предметов для повышенной эффективности

{
    "skillName": "Защита Святого",
    "skillDescription": "Призовите своего святого покровителя за божественной защитой в крайней нужде.",
    "rarity": "Common",
    "combatEffect": { "effects": [
        { "effectType": "DamageReduction", "value": "25%", "targetType": "all", "duration": 3, "description": "Снижает весь входящий урон на 25% на 3 хода." },
        { "effectType": "Buff", "value": "15%", "targetType": "faith", "duration": 3, "description": "Увеличивает Веру на 15% на 3 хода." }
    ]},
    "scalingCharacteristic": "faith", "scalesValue": true, "energyCost": 15,
    "divineCorruptionRisk": 0, "mortalAnchorCost": 1
}

**Уровень 2 - Архангелы (100+ Благоволения):**
- **"Ангельские Крылья" (Активная):** Проявление эфирных крыльев для полета и божественного присутствия
- **"Меч Михаила" (Активная):** Призыв пламенного клинка, рассекающего зло

{
    "skillName": "Меч Михаила",
    "skillDescription": "Проявите пламенный меч Архангела для поражения врагов веры.",
    "rarity": "Uncommon",
    "combatEffect": { "effects": [
        { "effectType": "Damage", "value": "40%", "targetType": "holy", "description": "Наносит 40% святого урона, особенно эффективен против демонов и нежити." },
        { "effectType": "Purification", "value": "100%", "targetType": "evil", "description": "Мгновенно уничтожает малых злых духов и проклятия." },
        { "effectType": "Intimidation", "value": "50%", "targetType": "morale", "duration": 2, "description": "50% шанс заставить врагов бежать в ужасе." }
    ]},
    "scalingCharacteristic": "faith", "scalesValue": true, "energyCost": 30,
    "divineCorruptionRisk": 0, "mortalAnchorCost": 8
}

**Уровень 3 - Божественные Аспекты (250+ Благоволения):**
- **"Христос-Воин" (Активная):** Становление неостановимой силой праведной ярости
- **"Божественный Суд" (Активная):** Призыв небесного гнева на нечестивых

{
    "skillName": "Божественный Суд",
    "skillDescription": "Направьте праведный гнев небес для суда и наказания нечестивых.",
    "rarity": "Rare",
    "combatEffect": { "effects": [
        { "effectType": "Damage", "value": "60%", "targetType": "divine", "description": "Наносит массивный божественный урон, масштабируется с злыми деяниями цели." },
        { "effectType": "Purification", "value": "100%", "targetType": "corruption", "description": "Удаляет все проклятия, болезни и темную магию." },
        { "effectType": "AreaEffect", "value": "35%", "targetType": "evil", "duration": 1, "description": "Воздействует на всех злых существ в широком радиусе." }
    ]},
    "scalingCharacteristic": "faith", "scalesValue": true, "energyCost": 50,
    "divineCorruptionRisk": 0, "mortalAnchorCost": 15
}

**Продвинутая система божественной политики:**

6. **Межконфессиональные конфликты:**
   - Персонажи, служащие Старым Богам, могут преследоваться христианскими фанатиками
   - Христианские персонажи сталкиваются с искушениями языческих духов
   - Персонажи смешанной веры становятся пешками в божественных конфликтах
   - Каждый покровитель имеет конкретных врагов среди противоположного пантеона

7. **Божественные квесты и испытания:**
   - Покровители назначают конкретные задачи, испытывающие веру и преданность
   - Неудача приводит к потере благоволения и потенциальному проклятию
   - Успех дарует уникальные артефакты и постоянные благословения
   - Некоторые квесты требуют выбора между человеческой моралью и божественным повелением

8. **Сверхъестественная политика:**
   - Покровители высшего уровня ведут прокси-войны через своих чемпионов
   - Персонажи могут быть контактированы соперничающими божествами, предлагающими лучшие сделки
   - Божественные существа формируют временные союзы против больших угроз
   - Прибытие чужеродных вер (ислам, норвежские верования) создает новые осложнения

**Уникальные механики:**

9. **Божественные видения и безумие:**
   - Регулярный божественный контакт требует проверок Мудрости для сохранения рассудка
   - Неудачные проверки добавляют к состоянию "Божественное Безумие"
   - Высокое безумие дарует пророческие видения, но снижает социальное функционирование
   - Некоторые видения содержат загадочные предупреждения о будущих событиях

10. **Чудотворные проявления:**
    - Высокое благоволение иногда вызывает спонтанные чудеса
    - Эти события свидетельствуются другими, влияя на репутацию
    - Чудеса значительно истощают Смертную Привязку
    - Тип чуда отражает покровителя персонажа и текущее эмоциональное состояние

11. **Священная/Профанная география:**
    - Определенные места усиливают конкретные типы божественного благоволения
    - Христианские церкви усиливают силы Нового Бога, но могут вредить последователям Старых Богов
    - Древние каменные круги, священные рощи усиливают языческие способности
    - Оскверненные области истощают благоволение обеих вер, усиливая темные силы

**Финальные трансформации:**

12. **Пути вознесения:**
    - **Путь Старых Богов:** Превращение в духа природы, лорда фэйри или малое божество
    - **Путь Нового Бога:** Становление живым святым, ангельским существом или божественным аватаром
    - **Путь Порчи:** Падение в проклятие как демон или эльдритчский ужас
    - **Путь Баланса:** Достижение синтеза, становление мостом между верами

Эта система создает глубокое развитие персонажа через моральные выборы, эскалирующие сверхъестественные ставки и сложные политические интриги между божественными фракциями, сохраняя при этом аутентичную атмосферу средневекового сеттинга.`;