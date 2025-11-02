export const oldMagicDescEn = `### OLD MAGIC OF ALBION SYSTEM RULES ###
**GM, you MUST implement this system using the Custom State mechanics for progression.**
The character's connection to the primal magic of the land is tracked through multiple interwoven custom states that represent different aspects of their bond with Albion's ancient power.

**Core Custom States:**

1. **Awen (Primary Progression):**
Create Custom State "Awen" with 'currentValue: 0', 'minValue: 0', 'maxValue: 1500'.
Divine inspiration from the land itself. Increases through: sacred rituals (+15-30), protecting ancient sites (+20-40), communing with spirits (+10-25), defeating supernatural threats (+25-50), restoring blighted lands (+30-60).
Decreases with: desecrating holy sites (-50), using dark magic (-30), betraying druidic oaths (-40), pollution of sacred places (-25).

2. **Land Harmony (Attunement State):**
Create "Land Harmony" with 'currentValue: 0', 'minValue: -500', 'maxValue: 1000'.
Measures synchronization with natural cycles.
Positive values grant nature-based bonuses, negative values cause nature to actively oppose the character.
Affected by seasonal observances, animal treatment, environmental care, and violation of natural laws.

3. **Ancestral Favor (Spiritual State):**
Create "Ancestral Favor" with 'currentValue: 0', 'minValue: 0', 'maxValue: 800'.
Connection to the spirits of ancient druids and Celtic heroes.
Increases through honoring traditions (+10-20), seeking wisdom from elders (+15), performing heroic deeds (+20-35), upholding ancient laws (+10-15).
Grants access to ancestral knowledge and spiritual guidance.

4. **Wyrd Sight (Mystical Perception):**
Create "Wyrd Sight" with 'currentValue: 0', 'minValue: 0', 'maxValue: 600'.
Ability to perceive the supernatural threads of fate and magic.
Develops through mystical experiences, prophetic dreams, encounters with otherworldly beings, and studying ancient prophecies.

5. **Stone Circle Attunement (Location Binding):** Create multiple states for major sacred sites:
   - **Stonehenge Resonance:** Connection to the Great Circle
   - **Glastonbury Resonance:** Bond with the Isle of Apples
   - **Camlann Resonance:** Link to Arthur's final battlefield
   - **Merlin's Cave Resonance:** Attunement to the wizard's sanctuary
   Each location grants unique abilities and knowledge when sufficiently attuned.

**Energy Sources:** 
- **Primary:** Character's main Energy pool
- **Sacred Grove Energy:** Special energy pool (max 50) that regenerates only at sacred sites
- **Moonlight Energy:** Bonus energy during specific lunar phases
- **Seasonal Energy:** Enhanced power during Celtic festivals (Samhain, Beltane, etc.)

**Hierarchical Progression Tiers:**

**Tier 1: The Awakening (Awen 50+, Land Harmony 50+)**
*The first stirrings of the old blood awakening...*

{
    "skillName": "Whispers of the Green",
    "skillDescription": "Place your hand upon the earth and hear the faint whispers of growing things. Learn the health of plants, the presence of toxins in soil, or the emotional resonance of a place.",
    "rarity": "Common",
    "combatEffect": null,
    "scalingCharacteristic": "wisdom", 
    "energyCost": 8,
    "requiresNaturalSetting": true
}

{
    "skillName": "Beast Speech",
    "skillDescription": "Speak with common animals (birds, mammals, reptiles) in simple concepts. They are not compelled to help but may share basic observations about recent events.",
    "rarity": "Common",
    "combatEffect": null,
    "scalingCharacteristic": "wisdom",
    "energyCost": 12,
    "duration": "10 minutes"
}

**Tier 2: The Recognition (Awen 150+, Ancestral Favor 100+)**
*The land begins to know you as one of its own...*

{
    "skillName": "Bramble Ward",
    "skillDescription": "Cause thorny vines and brambles to surge from the ground, creating a protective barrier or entangling foes. The plants are semi-intelligent and will defend their creator.",
    "rarity": "Uncommon",
    "combatEffect": {
        "effects": [
            {
                "effectType": "Control",
                "value": "60%",
                "targetType": "entanglement",
                "duration": 2,
                "description": "60% chance to entangle target for 2 turns, reducing movement and attack accuracy"
            }
        ]
    },
    "scalingCharacteristic": "wisdom",
    "scalesChance": true,
    "energyCost": 25
}

{
    "skillName": "Forest's Eyes",
    "skillDescription": "See through the eyes of any plant or tree within a mile radius. Gain perfect surveillance of an area and detect hidden threats or track quarry through woodland.",
    "rarity": "Uncommon", 
    "combatEffect": null,
    "scalingCharacteristic": "wisdom",
    "energyCost": 20,
    "duration": "5 minutes per Wisdom point"
}

**Tier 3: The Acceptance (Awen 300+, Land Harmony 200+, Wyrd Sight 100+)**
*You are acknowledged as a true child of Albion...*

{
    "skillName": "Stone's Endurance", 
    "skillDescription": "Your flesh takes on the durability of ancient megaliths, becoming resistant to both physical and magical damage while retaining flexibility.",
    "rarity": "Rare",
    "combatEffect": {
        "effects": [
            {
                "effectType": "DamageReduction", 
                "value": "35%",
                "targetType": "all",
                "duration": 4,
                "description": "Reduces all damage by 35% for 4 turns, immunity to poison and disease"
            }
        ]
    },
    "scalingCharacteristic": "wisdom",
    "scalesValue": true,
    "energyCost": 45
}

{
    "skillName": "Summon Will O' Wisps",
    "skillDescription": "Call forth spectral lights that can illuminate darkness, reveal hidden paths, confuse enemies, or guide allies. These ancient spirits obey your will but maintain their mischievous nature.",
    "rarity": "Rare",
    "combatEffect": {
        "effects": [
            {
                "effectType": "Control",
                "value": "45%", 
                "targetType": "confusion",
                "duration": 3,
                "description": "45% chance to confuse multiple enemies, causing them to attack randomly"
            }
        ]
    },
    "scalingCharacteristic": "wisdom",
    "scalesChance": true,
    "energyCost": 35,
    "targetsCount": 4
}

**Tier 4: The Communion (Awen 500+, Ancestral Favor 300+, Any Stone Circle Resonance 150+)**
*The spirits of the ancient druids whisper their secrets to you...*

{
    "skillName": "Invoke the Wild Hunt",
    "skillDescription": "Call upon the spectral riders of the Wild Hunt to charge across the battlefield. Ghostly Celtic warriors mounted on phantom steeds assault your enemies with otherworldly fury.",
    "rarity": "Epic",
    "combatEffect": {
        "effects": [
            {
                "effectType": "Damage",
                "value": "80%",
                "targetType": "spectral",
                "description": "Spectral cavalry charge dealing 80% spectral damage to up to 5 targets, ignoring armor"
            },
            {
                "effectType": "Control",
                "value": "70%",
                "targetType": "fear",
                "duration": 2,
                "description": "70% chance to cause terror, reducing enemy accuracy and morale"
            }
        ]
    },
    "scalingCharacteristic": "wisdom",
    "scalesValue": true,
    "energyCost": 70,
    "targetsCount": 5,
    "requiresOpen": "battlefield or moor"
}

{
    "skillName": "Druidic Shapeshifting",
    "skillDescription": "Transform into a powerful creature of the British Isles: great stag, massive bear, cunning wolf, or soaring eagle. Retain human intelligence while gaining animal abilities.",
    "rarity": "Epic",
    "combatEffect": {
        "effects": [
            {
                "effectType": "Enhancement",
                "value": "100%",
                "targetType": "physical_stats",
                "duration": 6,
                "description": "Doubles physical capabilities, grants animal-specific abilities (flight, enhanced senses, natural weapons)"
            }
        ]
    },
    "scalingCharacteristic": "wisdom",
    "scalesValue": true,
    "energyCost": 60,
    "duration": "10 minutes per Wisdom point"
}

**Tier 5: The Mastery (Awen 750+, All Resonances 200+, Wyrd Sight 400+)**
*You become a living conduit for the ancient power of the land...*

{
    "skillName": "Awaken the Sleeping Giant",
    "skillDescription": "Rouse a massive earth elemental from the landscape itself - a living hill or mountain that rises to defend the land. This titanic being fights with geological fury.",
    "rarity": "Legendary",
    "combatEffect": {
        "effects": [
            {
                "effectType": "Summon",
                "value": "300%",
                "targetType": "earth_titan",
                "duration": 5,
                "description": "Summons a colossal earth elemental with 300% of summoner's health, causes earthquake attacks"
            }
        ]
    },
    "scalingCharacteristic": "wisdom",
    "scalesValue": true, 
    "energyCost": 100,
    "requiresOpen": "natural outdoor setting",
    "cooldown": "once per lunar month"
}

{
    "skillName": "Call the Morrigan",
    "skillDescription": "Invoke the triple goddess of war, fate, and death. She appears as three ravens that bring prophecy, a spectral woman who heals or harms, or a blood-soaked crow that devours enemies.",
    "rarity": "Legendary", 
    "combatEffect": {
        "effects": [
            {
                "effectType": "Divine",
                "value": "variable",
                "targetType": "fate_alteration", 
                "description": "Prophecy: reveals hidden truths; Healing: restores all health and cures ailments; War: deals devastating damage to all enemies"
            }
        ]
    },
    "scalingCharacteristic": "wisdom",
    "energyCost": 120,
    "requiresHigh": "Ancestral Favor 500+",
    "cooldown": "once per season"
}

**Tier 6: The Transcendence (Awen 1000+, Master of All States)**
*You become one with the eternal spirit of Albion itself...*

{
    "skillName": "Become the Land",
    "skillDescription": "Temporarily merge your consciousness with the landscape for miles around. Control weather, reshape terrain, command all natural creatures, and perceive everything within your domain.",
    "rarity": "Mythic",
    "combatEffect": {
        "effects": [
            {
                "effectType": "Domain_Control",
                "value": "absolute",
                "targetType": "landscape",
                "duration": 3,
                "description": "Complete control over natural environment within 5 mile radius - weather, terrain, animals, plants all obey your will"
            }
        ]
    },
    "scalingCharacteristic": "wisdom",
    "energyCost": 150,
    "specialRequirement": "must be performed at a Major Stone Circle",
    "cooldown": "once per year"
}

**Tier 7: The Legend (Awen 1500+, Mythic Resonance)**
*You transcend mortality to become a living myth...*

{
    "skillName": "Eternal Guardian Awakening",
    "skillDescription": "Transform permanently into an eternal guardian of Albion, gaining immortality but binding your existence to the land's protection. You become a figure of legend.",
    "rarity": "Transcendent",
    "combatEffect": {
        "effects": [
            {
                "effectType": "Transcendence",
                "value": "permanent",
                "targetType": "immortal_guardian",
                "description": "Become immortal guardian spirit, immune to aging and death, but bound to protect the land for eternity"
            }
        ]
    },
    "scalingCharacteristic": "wisdom",
    "energyCost": 200,
    "permanentTransformation": true,
    "requirement": "willing sacrifice of mortal existence"
}

**Sacred Site Specific Abilities:**

**Stonehenge Powers:**
- **Temporal Sight:** See past and future events at the circle
- **Celestial Alignment:** Channel astronomical power during eclipses and solstices
- **Portal of Ages:** Open rifts in time (extremely dangerous)

**Glastonbury Powers:**
- **Avalon's Mist:** Create healing mists that cure diseases and restore youth
- **Arthur's Call:** Summon the ghost of the Once and Future King in dire need
- **Isle of Apples:** Transform any fruit into magical healing sustenance

**Camlann Powers:**
- **Warrior's Lament:** Channel the grief and rage of fallen heroes
- **Battle Echo:** Replay legendary conflicts as spectral reinforcements
- **Honor's Price:** Gain power through noble sacrifice

**Merlin's Cave Powers:**
- **Wizard's Wisdom:** Access Merlin's accumulated knowledge
- **Crystal Visions:** Scry across great distances and into other realms
- **Enchantment Mastery:** Create powerful magical artifacts

**Druidic Orders and Traditions:**

**Order of the Golden Bough:** Masters of healing and protection magic
**Order of the Silver Sickle:** Specialists in combat and war magic
**Order of the Copper Cauldron:** Keepers of transformation and mystery
**Order of the Iron Oak:** Guardians of sacred groves and ancient sites
**Order of the Jade Serpent:** Scholars of prophecy and divination

**Seasonal Festivals and Power Cycles:**

**Samhain (October 31):** Death magic enhanced, communion with spirits easier, +50% to Ancestral Favor gains
**Yule (Winter Solstice):** Endurance magic strengthened, protection spells last longer
**Imbolc (February 1):** Healing magic enhanced, purification rituals more effective
**Beltane (May 1):** Growth and fertility magic at peak power, +30% to all nature-based abilities
**Lughnasadh (August 1):** Harvest magic empowered, craft and creation spells enhanced

**Mystical Creatures and Alliances:**

**Sacred Animals:**
- **Red Dragon of Wales:** Ancient symbol of sovereignty and power
- **White Hart:** Mystical deer that appears to test worthiness
- **Ravens of the Tower:** Prophetic birds linked to Britain's fate
- **Salmon of Knowledge:** Wise fish that grants understanding
- **Boar of the Forest:** Fierce guardian of the wildwood

**Otherworldly Allies:**
- **Seelie Court:** Noble fae who aid those who respect nature
- **Unseelie Court:** Dark fae who punish those who harm the land
- **Bean Sidhe:** Death spirits who serve as omens and messengers
- **Cu Sidhe:** Great fairy hounds that hunt supernatural threats
- **Dullahan:** Headless horsemen who deliver fate's judgments

**Advanced Ritual Magic:**

**The Great Working:** Massive rituals requiring multiple druids, affecting entire regions
**Geas Binding:** Place powerful magical obligations on individuals or bloodlines
**Sanctuary Creation:** Establish new sacred sites with unique properties
**Ley Line Manipulation:** Redirect the flow of earth's magical energy
**Seasonal Sovereignty:** Temporarily claim dominion over natural cycles

**Corruption and Dark Paths:**

**Shadow Druidism:** Those who corrupt natural magic for personal gain
- Powers grow faster but at terrible cost to Land Harmony
- Eventually transforms practitioners into unnatural abominations
- Opposed by all legitimate druidic orders

**Roman Curse Legacy:** Lingering supernatural wounds from the conquest
- Ancient battlefields tainted with imperial magic
- Cursed artifacts from the legions still corrupt the land
- Some druids seek revenge through dark pacts

**Saxon Blight:** Foreign magic that poisons British soil
- Represents the ongoing struggle between native and invading cultures
- Creates dead zones where old magic cannot function
- Requires great sacrifice to cleanse

This system creates a deep connection between character and land, with power that grows through harmony rather than domination.
The multiple progression tracks allow for diverse character builds while maintaining thematic coherence with Arthurian legend and Celtic mythology.`;

export const oldMagicDescRu = `### ПРАВИЛА СИСТЕМЫ ДРЕВНЕЙ МАГИИ АЛЬБИОНА ###
**ГМ, вы ДОЛЖНЫ реализовать эту систему, используя механику Пользовательских Состояний для прогрессии.**
Связь персонажа с первобытной магией земли отслеживается через множество переплетенных пользовательских состояний, представляющих различные аспекты их связи с древней силой Альбиона.

**Основные Пользовательские Состояния:**

1. **Авен (Основная прогрессия):**
Создайте Пользовательское Состояние "Авен" с 'currentValue: 0', 'minValue: 0', 'maxValue: 1500'.
Божественное вдохновение от самой земли.
Увеличивается через: священные ритуалы (+15-30), защиту древних мест (+20-40), общение с духами (+10-25), победу над сверхъестественными угрозами (+25-50), восстановление пораженных земель (+30-60).
Уменьшается при: осквернении святых мест (-50), использовании темной магии (-30), предательстве друидских клятв (-40), загрязнении священных мест (-25).

2. **Гармония Земли (Состояние настройки):**
Создайте "Гармония Земли" с 'currentValue: 0', 'minValue: -500', 'maxValue: 1000'.
Измеряет синхронизацию с природными циклами.
Положительные значения дают бонусы от природы, отрицательные заставляют природу активно противодействовать персонажу.
Влияет соблюдение сезонных обрядов, обращение с животными, забота об окружающей среде и нарушение природных законов.

3. **Благосклонность Предков (Духовное состояние):**
Создайте "Благосклонность Предков" с 'currentValue: 0', 'minValue: 0', 'maxValue: 800'.
Связь с духами древних друидов и кельтских героев.
Увеличивается через почитание традиций (+10-20), поиск мудрости у старейшин (+15), совершение героических деяний (+20-35), соблюдение древних законов (+10-15).
Дает доступ к знаниям предков и духовному руководству.

4. **Зрение Вирд (Мистическое восприятие):**
Создайте "Зрение Вирд" с 'currentValue: 0', 'minValue: 0', 'maxValue: 600'.
Способность воспринимать сверхъестественные нити судьбы и магии.
Развивается через мистические переживания, пророческие сны, встречи с потусторонними существами и изучение древних пророчеств.

5. **Настройка на Каменные Круги (Привязка к местам):** Создайте множественные состояния для основных священных мест:
   - **Резонанс Стоунхенджа:** Связь с Великим Кругом
   - **Резонанс Гластонбери:** Связь с Островом Яблок
   - **Резонанс Камланна:** Связь с последним полем битвы Артура
   - **Резонанс Пещеры Мерлина:** Настройка на святилище волшебника
   Каждое место дает уникальные способности и знания при достаточной настройке.

**Источники Энергии:**
- **Основной:** Основной пул Энергии персонажа
- **Энергия Священной Рощи:** Специальный пул энергии (макс. 50), восстанавливающийся только в священных местах
- **Лунная Энергия:** Бонусная энергия в определенные лунные фазы
- **Сезонная Энергия:** Усиленная сила во время кельтских фестивалей (Самайн, Белтейн и т.д.)

**Иерархическая Система Прогрессии:**

**Уровень 1: Пробуждение (Авен 50+, Гармония Земли 50+)**
*Первые проблески пробуждения древней крови...*

{
    "skillName": "Шепот Зелени",
    "skillDescription": "Положите руку на землю и услышьте слабый шепот растущих вещей. Узнайте о здоровье растений, присутствии токсинов в почве или эмоциональном резонансе места.",
    "rarity": "Common",
    "combatEffect": null,
    "scalingCharacteristic": "wisdom",
    "energyCost": 8,
    "requiresNaturalSetting": true
}

{
    "skillName": "Речь Зверей",
    "skillDescription": "Говорите с обычными животными (птицы, млекопитающие, рептилии) простыми концепциями. Они не обязаны помогать, но могут поделиться базовыми наблюдениями о недавних событиях.",
    "rarity": "Common",
    "combatEffect": null,
    "scalingCharacteristic": "wisdom",
    "energyCost": 12,
    "duration": "10 минут"
}

**Уровень 2: Признание (Авен 150+, Благосклонность Предков 100+)**
*Земля начинает узнавать в вас одного из своих...*

{
    "skillName": "Терновый Барьер",
    "skillDescription": "Заставьте колючие лианы и терновник подняться из земли, создавая защитный барьер или опутывая врагов. Растения полуразумны и будут защищать своего создателя.",
    "rarity": "Uncommon",
    "combatEffect": {
        "effects": [
            {
                "effectType": "Control",
                "value": "60%",
                "targetType": "entanglement",
                "duration": 2,
                "description": "60% шанс опутать цель на 2 хода, снижая движение и точность атак"
            }
        ]
    },
    "scalingCharacteristic": "wisdom",
    "scalesChance": true,
    "energyCost": 25
}

{
    "skillName": "Глаза Леса",
    "skillDescription": "Смотрите глазами любого растения или дерева в радиусе мили. Получите идеальное наблюдение за областью и обнаружите скрытые угрозы или выследите добычу через лесистую местность.",
    "rarity": "Uncommon",
    "combatEffect": null,
    "scalingCharacteristic": "wisdom",
    "energyCost": 20,
    "duration": "5 минут за очко Мудрости"
}

**Уровень 3: Принятие (Авен 300+, Гармония Земли 200+, Зрение Вирд 100+)**
*Вас признают истинным дитем Альбиона...*

{
    "skillName": "Выносливость Камня",
    "skillDescription": "Ваша плоть обретает прочность древних мегалитов, становясь устойчивой к физическому и магическому урону, сохраняя гибкость.",
    "rarity": "Rare",
    "combatEffect": {
        "effects": [
            {
                "effectType": "DamageReduction",
                "value": "35%",
                "targetType": "all",
                "duration": 4,
                "description": "Снижает весь урон на 35% на 4 хода, иммунитет к яду и болезням"
            }
        ]
    },
    "scalingCharacteristic": "wisdom",
    "scalesValue": true,
    "energyCost": 45
}

{
    "skillName": "Призыв Блуждающих Огней",
    "skillDescription": "Вызовите призрачные огни, способные освещать тьму, открывать скрытые пути, смущать врагов или направлять союзников. Эти древние духи повинуются вашей воле, но сохраняют озорную природу.",
    "rarity": "Rare",
    "combatEffect": {
        "effects": [
            {
                "effectType": "Control",
                "value": "45%",
                "targetType": "confusion",
                "duration": 3,
                "description": "45% шанс смутить нескольких врагов, заставляя их атаковать случайно"
            }
        ]
    },
    "scalingCharacteristic": "wisdom",
    "scalesChance": true,
    "energyCost": 35,
    "targetsCount": 4
}

**Уровень 4: Единение (Авен 500+, Благосклонность Предков 300+, Любой Резонанс Каменного Круга 150+)**
*Духи древних друидов шепчут вам свои секреты...*

{
    "skillName": "Призыв Дикой Охоты",
    "skillDescription": "Призовите призрачных всадников Дикой Охоты для атаки поля битвы. Призрачные кельтские воины на фантомных скакунах нападают на врагов с потусторонней яростью.",
    "rarity": "Epic",
    "combatEffect": {
        "effects": [
            {
                "effectType": "Damage",
                "value": "80%",
                "targetType": "spectral",
                "description": "Атака призрачной кавалерии, наносящая 80% призрачного урона 5 целям, игнорируя броню"
            },
            {
                "effectType": "Control",
                "value": "70%",
                "targetType": "fear",
                "duration": 2,
                "description": "70% шанс вызвать ужас, снижая точность и боевой дух врагов"
            }
        ]
    },
    "scalingCharacteristic": "wisdom",
    "scalesValue": true,
    "energyCost": 70,
    "targetsCount": 5,
    "requiresOpen": "поле битвы или болота"
}

{
    "skillName": "Друидическое Превращение",
    "skillDescription": "Превратитесь в могущественное существо Британских островов: великого оленя, массивного медведя, хитрого волка или парящего орла. Сохраните человеческий разум, получив способности животного.",
    "rarity": "Epic",
    "combatEffect": {
        "effects": [
            {
                "effectType": "Enhancement",
                "value": "100%",
                "targetType": "physical_stats",
                "duration": 6,
                "description": "Удваивает физические способности, дает специфичные для животного навыки (полет, усиленные чувства, природное оружие)"
            }
        ]
    },
    "scalingCharacteristic": "wisdom",
    "scalesValue": true,
    "energyCost": 60,
    "duration": "10 минут за очко Мудрости"
}

**Уровень 5: Мастерство (Авен 750+, Все Резонансы 200+, Зрение Вирд 400+)**
*Вы становитесь живым проводником древней силы земли...*

{
    "skillName": "Пробуждение Спящего Гиганта",
    "skillDescription": "Разбудите массивного элементаля земли из самого ландшафта - живой холм или гору, которая поднимается защищать землю. Это титаническое существо сражается с геологической яростью.",
    "rarity": "Legendary",
    "combatEffect": {
        "effects": [
            {
                "effectType": "Summon",
                "value": "300%",
                "targetType": "earth_titan",
                "duration": 5,
                "description": "Призывает колоссального элементаля земли со здоровьем 300% от призывателя, наносит атаки землетрясением"
            }
        ]
    },
    "scalingCharacteristic": "wisdom",
    "scalesValue": true,
    "energyCost": 100,
    "requiresOpen": "природная открытая местность",
    "cooldown": "раз в лунный месяц"
}

{
    "skillName": "Призыв Морриган",
    "skillDescription": "Призовите тройную богиню войны, судьбы и смерти. Она появляется как три ворона, приносящие пророчество, призрачная женщина, исцеляющая или вредящая, или окровавленная ворона, пожирающая врагов.",
    "rarity": "Legendary",
    "combatEffect": {
        "effects": [
            {
                "effectType": "Divine",
                "value": "variable",
                "targetType": "fate_alteration",
                "description": "Пророчество: раскрывает скрытые истины; Исцеление: восстанавливает все здоровье и лечит недуги; Война: наносит разрушительный урон всем врагам"
            }
        ]
    },
    "scalingCharacteristic": "wisdom",
    "energyCost": 120,
    "requiresHigh": "Благосклонность Предков 500+",
    "cooldown": "раз в сезон"
}

**Уровень 6: Трансцендентность (Авен 1000+, Мастер Всех Состояний)**
*Вы становитесь единым с вечным духом самого Альбиона...*

{
    "skillName": "Стать Землей",
    "skillDescription": "Временно слейте свое сознание с ландшафтом на мили вокруг. Контролируйте погоду, изменяйте рельеф, командуйте всеми природными существами и воспринимайте все в своих владениях.",
    "rarity": "Mythic",
    "combatEffect": {
        "effects": [
            {
                "effectType": "Domain_Control",
                "value": "absolute",
                "targetType": "landscape",
                "duration": 3,
                "description": "Полный контроль над природной средой в радиусе 5 миль - погода, рельеф, животные, растения повинуются вашей воле"
            }
        ]
    },
    "scalingCharacteristic": "wisdom",
    "energyCost": 150,
    "specialRequirement": "должно выполняться в Главном Каменном Круге",
    "cooldown": "раз в год"
}

**Уровень 7: Легенда (Авен 1500+, Мифический Резонанс)**
*Вы превосходите смертность, становясь живым мифом...*

{
    "skillName": "Пробуждение Вечного Стража",
    "skillDescription": "Навсегда превратитесь в вечного стража Альбиона, обретя бессмертие, но связав свое существование с защитой земли. Вы становитесь легендарной фигурой.",
    "rarity": "Transcendent",
    "combatEffect": {
        "effects": [
            {
                "effectType": "Transcendence",
                "value": "permanent",
                "targetType": "immortal_guardian",
                "description": "Становитесь бессмертным духом-хранителем, иммунным к старению и смерти, но связанным защищать землю вечно"
            }
        ]
    },
    "scalingCharacteristic": "wisdom",
    "energyCost": 200,
    "permanentTransformation": true,
    "requirement": "добровольная жертва смертного существования"
}

**Способности Конкретных Священных Мест:**

**Силы Стоунхенджа:**
- **Временное Зрение:** Видение прошлых и будущих событий в круге
- **Небесное Выравнивание:** Channeling астрономической силы во время затмений и солнцестояний
- **Портал Веков:** Открытие разрывов во времени (крайне опасно)

**Силы Гластонбери:**
- **Туман Авалона:** Создание целебных туманов, лечащих болезни и восстанавливающих молодость
- **Зов Артура:** Призыв призрака Короля Прошлого и Будущего в крайней нужде
- **Остров Яблок:** Превращение любых фруктов в магическую целебную пищу

**Силы Камланна:**
- **Плач Воина:** Channeling горя и ярости павших героев
- **Эхо Битвы:** Воспроизведение легендарных сражений как призрачных подкреплений
- **Цена Чести:** Получение силы через благородную жертву

**Силы Пещеры Мерлина:**
- **Мудрость Волшебника:** Доступ к накопленным знаниям Мерлина
- **Кристальные Видения:** Прорицание на большие расстояния и в другие миры
- **Мастерство Зачарований:** Создание мощных магических артефактов

**Друидические Ордена и Традиции:**

**Орден Золотой Ветви:** Мастера магии исцеления и защиты
**Орден Серебряного Серпа:** Специалисты по боевой и военной магии
**Орден Медного Котла:** Хранители магии превращений и тайн
**Орден Железного Дуба:** Стражи священных рощ и древних мест
**Орден Нефритового Змея:** Ученые пророчеств и прорицания

**Сезонные Фестивали и Циклы Силы:**

**Самайн (31 октября):** Магия смерти усилена, общение с духами легче, +50% к приросту Благосклонности Предков
**Йоль (Зимнее солнцестояние):** Магия выносливости усилена, защитные заклинания длятся дольше
**Имболк (1 февраля):** Магия исцеления усилена, ритуалы очищения более эффективны
**Белтейн (1 мая):** Магия роста и плодородия на пике силы, +30% ко всем способностям природы
**Лугнасад (1 августа):** Магия урожая усилена, заклинания ремесла и создания улучшены

**Мистические Существа и Союзы:**

**Священные Животные:**
- **Красный Дракон Уэльса:** Древний символ суверенитета и силы
- **Белый Олень:** Мистический олень, появляющийся для испытания достоинства
- **Вороны Тауэра:** Пророческие птицы, связанные с судьбой Британии
- **Лосось Знаний:** Мудрая рыба, дарующая понимание
- **Кабан Леса:** Свирепый страж дикой чащи

**Потусторонние Союзники:**
- **Двор Благих Фей:** Благородные феи, помогающие тем, кто уважает природу
- **Двор Злых Фей:** Темные феи, наказывающие тех, кто вредит земле
- **Банши:** Духи смерти, служащие как предзнаменования и посланники
- **Фейные Псы:** Великие волшебные гончие, охотящиеся на сверхъестественные угрозы
- **Дуллаханы:** Безголовые всадники, доставляющие приговоры судьбы

**Продвинутая Ритуальная Магия:**

**Великое Деяние:** Массивные ритуалы, требующие нескольких друидов, влияющие на целые регионы
**Связывание Геас:** Наложение мощных магических обязательств на индивидуумов или родословные
**Создание Святилищ:** Установление новых священных мест с уникальными свойствами
**Манипуляция Лей-линий:** Перенаправление потока магической энергии земли
**Сезонный Суверенитет:** Временное обладание господством над природными циклами

**Порча и Темные Пути:**

**Теневой Друидизм:** Те, кто развращает природную магию для личной выгоды
- Силы растут быстрее, но за ужасную цену Гармонии Земли
- В конечном итоге превращает практикующих в неестественных монстров
- Противостоят всем законным друидическим орденам

**Наследие Римского Проклятия:** Сохраняющиеся сверхъестественные раны от завоевания
- Древние поля битв, зараженные имперской магией
- Проклятые артефакты легионов все еще развращают землю
- Некоторые друиды ищут мести через темные пакты

**Саксонская Порча:** Чужая магия, отравляющая британскую почву
- Представляет продолжающуюся борьбу между местными и захватническими культурами
- Создает мертвые зоны, где старая магия не может функционировать
- Требует великой жертвы для очищения

Эта система создает глубокую связь между персонажем и землей, с силой, которая растет через гармонию, а не господство.
Множественные треки прогрессии позволяют создать разнообразные сборки персонажей, сохраняя тематическую связность с легендами о короле Артуре и кельтской мифологией.`;