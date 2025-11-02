export const priesthoodSystemDescEn = `### PRIESTHOOD & DIVINE FAVOR SYSTEM RULES ###
**GM, you MUST implement this system using the Custom State mechanics for progression.**
A priest's connection to their deity is tracked through multiple interwoven Custom States that create a complex web of divine politics, spiritual growth, and moral choices.

**Core Divine Mechanics:**

1. **Divine Favor (Primary Progression State):**
Create a Custom State named "Divine Favor" with 'currentValue: 0', 'minValue: -500', 'maxValue: 2000+'.
This represents the character's standing with their chosen deity.
Increases through acts of piety (+5-25), upholding tenets (+10-20), smiting enemies (+15-30), completing sacred quests (+25-50), converting followers (+20-40).
Decreases with blasphemy (-30-50), breaking tenets (-20-35), failing divine tests (-25-40), or neglecting duties (-5-15).

2. **Divine Essence Corruption (Corruption State):**
Create "Divine Corruption" with 'currentValue: 0', 'minValue: 0', 'maxValue: 1000'.
Tracks the character's spiritual corruption from wielding divine power.
Increases with each use of higher-tier abilities (+10-25), forcing conversions (+20), using divine power for personal gain (+15-30), ignoring suffering when you could help (-10-20).
At 200+: begins developing religious fanaticism.
At 500+: loses compassion for "heretics."
At 800+: may sacrifice innocents for the "greater divine will."

3. **Spiritual Resonance (Attunement State):**
Create "Spiritual Resonance" with 'currentValue: 0', 'minValue: 0', 'maxValue: 1000+'.
Measures how deeply the character's soul resonates with divine energies.
Higher resonance allows more efficient channeling but makes the character vulnerable to divine influences and otherworldly entities.
Increases through meditation (+5-15), divine visions (+20-30), surviving divine trials (+40-60).

4. **Mortal Bonds (Humanity State):**
Create "Mortal Bonds" with 'currentValue: 1000', 'minValue: 0', 'maxValue: 1000'.
Represents the character's connections to mortal life and earthly concerns.
Decreases as divine power grows (-10-20 per tier gained), but provides resistance to corruption and fanaticism.
Can be restored through meaningful relationships (+10-25), acts of humble service (+5-15), rejecting divine power when offered (+20-30).

5. **Divine Hierarchy Standing:** Create separate states for different divine factions:
   - **Temple Authority:** Standing with organized religious institutions
   - **Celestial Court:** Favor with angelic hierarchies  
   - **Divine Rival Attention:** Negative attention from opposing deities
   - **Mortal Congregation:** Influence over faithful followers
   - **Inquisition Suspicion:** Scrutiny from religious authorities for unorthodox practices

**Advanced Divine Power Tiers:**

**Tier 0: Godless Heretic (Favor -500 to -100):**
Divine powers are stripped away, replaced with dark alternatives.
- **Passive:** "Divine Rejection" - All healing received reduced by 50%, vulnerability to holy damage
- **Active Skill Example:** "Blasphemous Vitality" (Active)

{
    "skillName": "Blasphemous Vitality",
    "skillDescription": "Draw life force from nearby plants and small creatures, sustaining yourself through profane means.",
    "rarity": "Cursed",
    "combatEffect": {
        "effects": [{
            "effectType": "Heal",
            "value": "15%",
            "targetType": "health",
            "description": "Heals 15% health by draining nearby life."
        }]
    },
    "scalingCharacteristic": "faith",
    "scalesValue": true,
    "energyCost": 25,
    "additionalCost": "Kills nearby vegetation, causes animals to flee"
}

**Tier 1: Faithful Seeker (Favor 0-99):**
Beginning spiritual awakening with basic divine awareness.
- **Passive:** "Divine Sense" - Can detect consecrated ground, unholy presence, and spiritual disturbances
- **Active Skill Example:** "Humble Prayer" (Active)

{
    "skillName": "Humble Prayer",
    "skillDescription": "Offer a sincere prayer to your deity, seeking minor guidance and comfort.",
    "rarity": "Common",
    "combatEffect": {
        "effects": [{
            "effectType": "Buff",
            "value": "5%",
            "targetType": "all stats",
            "duration": 3,
            "description": "Grants +5% to all stats for 3 turns through divine reassurance."
        }]
    },
    "scalingCharacteristic": "faith",
    "scalesValue": true,
    "energyCost": 5
}

**Tier 2: Divine Initiate (Favor 100-249):**
First true connection established with divine realm.
- **Passive:** "Sacred Resilience" - +15% resistance to fear, charm, and mental effects
- **Active Skill Example:** "Consecrated Weapon" (Active)

{
    "skillName": "Consecrated Weapon",
    "skillDescription": "Temporarily bless your weapon with divine energy, making it effective against unholy creatures.",
    "rarity": "Common",
    "combatEffect": {
        "effects": [{
            "effectType": "Enchantment",
            "value": "25%",
            "targetType": "weapon damage",
            "duration": 5,
            "description": "Weapon deals 25% extra damage to undead, demons, and unholy creatures for 5 turns."
        }]
    },
    "scalingCharacteristic": "faith",
    "scalesValue": true,
    "energyCost": 15
}

**Tier 3: Ordained Acolyte (Favor 250-499):**
Formal recognition by divine forces.
- **Passive:** "Divine Protection" - Attacks against you have 10% chance to miss due to divine intervention
- **Active Skill Example:** "Sanctuary Circle" (Active)

{
    "skillName": "Sanctuary Circle",
    "skillDescription": "Create a sacred circle that provides protection and restoration to allies within.",
    "rarity": "Uncommon",
    "combatEffect": {
        "effects": [{
            "effectType": "Area Buff",
            "value": "10%",
            "targetType": "all resistances",
            "duration": 4,
            "description": "All allies in area gain +10% resistances and slow health regeneration.",
            "areaEffect": true
        }]
    },
    "scalingCharacteristic": "faith",
    "scalesValue": true,
    "energyCost": 30
}

**Tier 4: Devoted Priest (Favor 500-749):**
True servant of divine will with growing power.
- **Passive:** "Divine Insight" - Can sense the spiritual state of others, detect lies related to faith
- **Active Skill Example:** "Righteous Condemnation" (Active)

{
    "skillName": "Righteous Condemnation",
    "skillDescription": "Call down divine judgment upon those who have committed sins against your deity's domain.",
    "rarity": "Rare",
    "combatEffect": {
        "effects": [{
            "effectType": "Damage",
            "value": "35%",
            "targetType": "holy",
            "description": "Deals 35% holy damage, +50% damage if target has committed relevant sins."
        }]
    },
    "scalingCharacteristic": "faith",
    "scalesValue": true,
    "energyCost": 40,
    "specialCondition": "Damage increases based on target's moral transgressions"
}

**Tier 5: Divine Champion (Favor 750-999):**
Chosen warrior of the deity with significant divine backing.
- **Passive:** "Avatar Traits" - Begin manifesting physical traits of your deity (glowing eyes, ethereal voice, etc.)
- **Active Skill Example:** "Divine Mandate" (Active)

{
    "skillName": "Divine Mandate",
    "skillDescription": "Speak with the authority of your deity, compelling others to obey divine law.",
    "rarity": "Rare",
    "combatEffect": {
        "effects": [{
            "effectType": "Control",
            "value": "60%",
            "targetType": "compulsion",
            "duration": 3,
            "description": "60% chance to compel target to follow a command that aligns with deity's tenets.",
            "targetsCount": 2
        }]
    },
    "scalingCharacteristic": "faith",
    "scalesChance": true,
    "energyCost": 60
}

**Tier 6: Divine Oracle (Favor 1000-1499):**
Prophetic powers and direct divine communication.
- **Passive:** "Prophetic Visions" - Randomly receive visions of future events, both helpful and disturbing
- **Active Skill Example:** "Divine Revelation" (Active)

{
    "skillName": "Divine Revelation",
    "skillDescription": "Channel your deity's omniscience to gain perfect knowledge about a specific question or situation.",
    "rarity": "Epic",
    "combatEffect": null,
    "scalingCharacteristic": "faith",
    "energyCost": 80,
    "cooldown": "Once per major story event",
    "narrativeEffect": "GM must provide truthful, detailed information about the subject of inquiry"
}

**Tier 7: Divine Avatar (Favor 1500-1999):**
Mortal vessel for divine power with cosmic awareness.
- **Passive:** "Divine Presence" - Aura affects all nearby beings; faithful are inspired, enemies may flee in terror
- **Active Skill Example:** "Incarnate Deity" (Active)

{
    "skillName": "Incarnate Deity",
    "skillDescription": "Temporarily become a partial avatar of your deity, gaining immense power but risking your humanity.",
    "rarity": "Legendary",
    "combatEffect": {
        "effects": [{
            "effectType": "Transformation",
            "value": "100%",
            "targetType": "all stats",
            "duration": 5,
            "description": "Double all stats and gain immunity to mortal effects, but +50 Divine Corruption."
        }]
    },
    "scalingCharacteristic": "faith",
    "scalesValue": true,
    "energyCost": 150,
    "cost": "+50 Divine Corruption, -20 Mortal Bonds"
}

**Tier 8: Divine Ascendant (Favor 2000+):**
Transcending mortality, becoming something beyond human.
- **Passive:** "Quasi-Divine Nature" - Immune to mortal diseases, aging slows, requires no food or sleep
- **Active Skill Example:** "Divine Judgment" (Active)

{
    "skillName": "Divine Judgment",
    "skillDescription": "Pass ultimate judgment on mortals, potentially rewriting their fate according to divine will.",
    "rarity": "Mythic",
    "combatEffect": {
        "effects": [{
            "effectType": "Fate Alteration",
            "value": "Absolute",
            "targetType": "soul",
            "description": "Can fundamentally alter target's nature, alignment, or destiny. Effects are permanent."
        }]
    },
    "scalingCharacteristic": "faith",
    "energyCost": 200,
    "cost": "+100 Divine Corruption, permanent moral choice",
    "restriction": "Can only be used if target has committed actions directly opposing deity's core domain"
}

**Divine Specialization Paths:**

**Path of Light (Sun/Good deities):**
- **Specialization Bonus:** +25% effectiveness of healing and protective abilities
- **Unique Ability:** "Solar Radiance" - Can create daylight in any area, deal extra damage to undead
- **Corruption Risk:** Becomes increasingly intolerant of moral ambiguity, sees everything in black and white

**Path of Nature (Earth/Nature deities):**
- **Specialization Bonus:** Can communicate with animals and plants, control weather patterns
- **Unique Ability:** "Nature's Wrath" - Summon earthquakes, storms, or swarms of creatures
- **Corruption Risk:** Begins to view civilization as a disease, prioritizes nature over human life

**Path of War (War/Strength deities):**
- **Specialization Bonus:** +30% physical damage, immunity to fear in combat
- **Unique Ability:** "Divine Weapon" - Manifest legendary weapons from divine realm
- **Corruption Risk:** Becomes increasingly violent, sees diplomacy as weakness

**Path of Knowledge (Wisdom/Magic deities):**
- **Specialization Bonus:** Can access divine libraries, cast spells without components
- **Unique Ability:** "Omniscient Query" - Gain perfect knowledge about any academic subject
- **Corruption Risk:** Becomes detached from emotional concerns, values knowledge over morality

**Path of Death (Death/Underworld deities):**
- **Specialization Bonus:** Can see and speak with spirits, immunity to death effects
- **Unique Ability:** "Soul Manipulation" - Directly affect souls, potentially resurrect or destroy them
- **Corruption Risk:** Becomes obsessed with death, may begin viewing living beings as already dead

**Divine Politics System:**

**Celestial Factions:**
- **The Eternal Throne:** Traditional divine hierarchy favoring order and established faith
- **The Wild Pantheon:** Nature and primal deities opposing civilization's expansion
- **The Twilight Council:** Neutral deities maintaining balance between light and dark
- **The Forgotten Gods:** Ancient powers seeking to reclaim their lost domains
- **The Ascending Mortals:** Former humans who achieved godhood and remember mortality

**Faction Standing affects:**
- Available divine abilities and their power level
- Support or opposition from other divine servants
- Access to celestial resources and information
- Potential divine quests and mandates
- Risk of becoming target in divine conflicts

**Divine Corruption Consequences:**

**200+ Corruption: Religious Fanaticism**
- Character begins interpreting everything through extreme religious lens
- Becomes judgmental toward those of different faiths
- May attempt forced conversions

**400+ Corruption: Divine Supremacist**
- Views non-believers as inherently inferior
- Believes divine will justifies any action
- Loses empathy for "heretical" suffering

**600+ Corruption: Wrathful Prophet**
- Interprets setbacks as tests requiring greater violence
- May attack neutral parties who don't actively support their cause
- Begins having "divine visions" that justify extreme actions

**800+ Corruption: False Deity**
- Believes they ARE their deity's voice on earth
- Demands worship from followers
- May sacrifice loyal servants for "divine purposes"

**Mortal Bonds Benefits:**

**800+ Bonds: Grounded in Humanity**
- Resistant to corruption (+50% resistance to Divine Corruption gains)
- Can refuse divine commands that conflict with personal morality
- Retains compassion and empathy regardless of power level

**600+ Bonds: Beloved Teacher**
- Followers serve out of love rather than fear
- Can inspire others to heroic actions through example
- Divine abilities often manifest as protective rather than destructive

**400+ Bonds: Humble Servant**
- Can voluntarily reduce own power to help others
- Access to unique "sacrifice self for others" abilities
- Divine corruption effects are halved

**200- Bonds: Distant and Cold**
- Begins losing touch with mortal concerns
- Followers serve out of fear rather than love
- Increased vulnerability to corruption

**Advanced Divine Mechanics:**

**Divine Trials:** Periodic tests from the deity requiring difficult moral choices:
- **Trial of Faith:** Choose between personal desires and divine will
- **Trial of Wisdom:** Solve complex moral dilemmas with long-term consequences
- **Trial of Strength:** Face overwhelming odds to protect the faithful
- **Trial of Sacrifice:** Give up something precious for the greater good
- **Trial of Judgment:** Decide the fate of those who have wronged your deity

**Divine Visions:** Higher-tier priests experience prophetic dreams and visions:
- Can provide crucial information about future threats
- May show multiple possible futures based on current choices
- Sometimes contain divine mandates that must be fulfilled
- Can be overwhelmingly intense, causing Spiritual Resonance increases

**Miracle System:** At high favor levels, priests can petition for true miracles:
- **Minor Miracle (Favor 500+):** Heal terminal illness, purify corrupted land
- **Major Miracle (Favor 1000+):** Resurrect recently dead, stop natural disasters
- **Divine Miracle (Favor 1500+):** Rewrite natural laws in small areas, grant divine boons
- Each miracle costs significant Divine Favor and increases Corruption

**Divine Artifacts:** Powerful items become available at higher tiers:
- **Sacred Symbol (Tier 2+):** Enhances all divine abilities
- **Blessed Armor (Tier 4+):** Provides protection against unholy forces
- **Divine Weapon (Tier 6+):** Weapon that channels deity's power directly
- **Relic of Transcendence (Tier 8+):** Artifact containing fragment of divine essence

**Apostate Path:** Characters who fall below -100 Favor enter the Apostate progression:
- Gain access to dark divine powers fueled by spite and rebellion
- Can corrupt holy sites and turn divine servants against their masters
- Risk becoming the very evil they once fought against
- May eventually attract attention from opposing deities offering dark pacts

This system creates complex moral choices where great power comes with great corruption risk, and maintaining humanity becomes increasingly difficult as divine favor grows.
The multiple progression paths and faction politics ensure each priest's journey is unique and filled with meaningful consequences.
`;

export const priesthoodSystemDescRu = `### ПРАВИЛА СИСТЕМЫ ЖРЕЧЕСТВА И БОЖЕСТВЕННОГО БЛАГОВОЛЕНИЯ ###
**ГМ, вы ДОЛЖНЫ реализовать эту систему, используя механику Пользовательских Состояний для прогрессии.**
Связь жреца с божеством отслеживается через множество взаимосвязанных Пользовательских Состояний, создающих сложную сеть божественной политики, духовного роста и моральных выборов.

**Основные Божественные Механики:**

1. **Божественное Благоволение (Основное Состояние Прогрессии):**
Создайте Пользовательское Состояние "Божественное Благоволение" с 'currentValue: 0', 'minValue: -500', 'maxValue: 2000+'.
Это представляет положение персонажа перед избранным божеством.
Увеличивается через акты благочестия (+5-25), соблюдение заповедей (+10-20), уничтожение врагов (+15-30), выполнение священных квестов (+25-50), обращение последователей (+20-40).
Уменьшается при богохульстве (-30-50), нарушении заповедей (-20-35), провале божественных испытаний (-25-40) или пренебрежении обязанностями (-5-15).

2. **Порча Божественной Сущности (Состояние Порчи):**
Создайте "Божественную Порчу" с 'currentValue: 0', 'minValue: 0', 'maxValue: 1000'.
Отслеживает духовную порчу персонажа от владения божественной силой.
Увеличивается с каждым использованием способностей высшего уровня (+10-25), принуждением к обращению (+20), использованием божественной силы для личной выгоды (+15-30), игнорированием страданий, когда можно помочь (-10-20).
При 200+: начинает развиваться религиозный фанатизм.
При 500+: теряет сострадание к "еретикам."
При 800+: может жертвовать невинными ради "высшей божественной воли."

3. **Духовный Резонанс (Состояние Настройки):**
Создайте "Духовный Резонанс" с 'currentValue: 0', 'minValue: 0', 'maxValue: 1000+'.
Измеряет, насколько глубоко душа персонажа резонирует с божественными энергиями.
Высший резонанс позволяет более эффективное направление силы, но делает персонажа уязвимым к божественным влияниям и потусторонним сущностям.
Увеличивается через медитацию (+5-15), божественные видения (+20-30), выживание в божественных испытаниях (+40-60).

4. **Смертные Узы (Состояние Человечности):**
Создайте "Смертные Узы" с 'currentValue: 1000', 'minValue: 0', 'maxValue: 1000'.
Представляет связи персонажа со смертной жизнью и земными заботами.
Уменьшается по мере роста божественной силы (-10-20 за полученный уровень), но обеспечивает сопротивление порче и фанатизму.
Может быть восстановлено через значимые отношения (+10-25), акты смиренного служения (+5-15), отказ от божественной силы при предложении (+20-30).

5. **Положение в Божественной Иерархии:**
Создайте отдельные состояния для различных божественных фракций:
   - **Храмовая Власть:** Положение в организованных религиозных институтах
   - **Небесный Двор:** Благоволение ангельских иерархий
   - **Внимание Божественных Соперников:** Негативное внимание от противоборствующих божеств
   - **Смертная Паства:** Влияние на верующих последователей
   - **Подозрения Инквизиции:** Scrutiny от религиозных властей за неортодоксальные практики

**Продвинутые Уровни Божественной Силы:**

**Уровень 0: Безбожный Еретик (Благоволение -500 до -100):**
Божественные силы отняты, заменены темными альтернативами.
- **Пассивная:** "Божественное Отвержение" - Все получаемое исцеление уменьшено на 50%, уязвимость к святому урону
- **Пример Активного Навыка:** "Кощунственная Живучесть" (Активный)

{
    "skillName": "Кощунственная Живучесть",
    "skillDescription": "Извлекайте жизненную силу из ближайших растений и мелких существ, поддерживая себя нечестивыми средствами.",
    "rarity": "Cursed",
    "combatEffect": {
        "effects": [{
            "effectType": "Heal",
            "value": "15%",
            "targetType": "health",
            "description": "Исцеляет 15% здоровья, осушая ближайшую жизнь."
        }]
    },
    "scalingCharacteristic": "faith",
    "scalesValue": true,
    "energyCost": 25,
    "additionalCost": "Убивает ближайшую растительность, заставляет животных бежать"
}

**Уровень 1: Верующий Искатель (Благоволение 0-99):**
Начальное духовное пробуждение с базовым божественным осознанием.
- **Пассивная:** "Божественное Чувство" - Может обнаружить освященную землю, нечестивое присутствие и духовные нарушения
- **Пример Активного Навыка:** "Смиренная Молитва" (Активный)

{
    "skillName": "Смиренная Молитва",
    "skillDescription": "Вознесите искреннюю молитву своему божеству, прося незначительного руководства и утешения.",
    "rarity": "Common",
    "combatEffect": {
        "effects": [{
            "effectType": "Buff",
            "value": "5%",
            "targetType": "all stats",
            "duration": 3,
            "description": "Дает +5% ко всем характеристикам на 3 хода через божественное успокоение."
        }]
    },
    "scalingCharacteristic": "faith",
    "scalesValue": true,
    "energyCost": 5
}

**Уровень 2: Божественный Послушник (Благоволение 100-249):**
Первая истинная связь с божественным царством.
- **Пассивная:** "Священная Стойкость" - +15% сопротивления страху, очарованию и ментальным эффектам
- **Пример Активного Навыка:** "Освященное Оружие" (Активный)

{
    "skillName": "Освященное Оружие",
    "skillDescription": "Временно благословите свое оружие божественной энергией, делая его эффективным против нечестивых существ.",
    "rarity": "Common",
    "combatEffect": {
        "effects": [{
            "effectType": "Enchantment",
            "value": "25%",
            "targetType": "weapon damage",
            "duration": 5,
            "description": "Оружие наносит на 25% больше урона нежити, демонам и нечестивым существам в течение 5 ходов."
        }]
    },
    "scalingCharacteristic": "faith",
    "scalesValue": true,
    "energyCost": 15
}

**Уровень 3: Рукоположенный Аколит (Благоволение 250-499):**
Формальное признание божественными силами.
- **Пассивная:** "Божественная Защита" - Атаки против вас имеют 10% шанс промаха из-за божественного вмешательства
- **Пример Активного Навыка:** "Круг Святилища" (Активный)

{
    "skillName": "Круг Святилища",
    "skillDescription": "Создайте священный круг, который обеспечивает защиту и восстановление союзникам внутри.",
    "rarity": "Uncommon",
    "combatEffect": {
        "effects": [{
            "effectType": "Area Buff",
            "value": "10%",
            "targetType": "all resistances",
            "duration": 4,
            "description": "Все союзники в области получают +10% к сопротивлениям и медленную регенерацию здоровья.",
            "areaEffect": true
        }]
    },
    "scalingCharacteristic": "faith",
    "scalesValue": true,
    "energyCost": 30
}

**Уровень 4: Преданный Жрец (Благоволение 500-749):**
Истинный служитель божественной воли с растущей силой.
- **Пассивная:** "Божественная Проницательность" - Может чувствовать духовное состояние других, обнаруживать ложь, связанную с верой
- **Пример Активного Навыка:** "Праведное Осуждение" (Активный)

{
    "skillName": "Праведное Осуждение",
    "skillDescription": "Призовите божественный суд на тех, кто совершил грехи против домена вашего божества.",
    "rarity": "Rare",
    "combatEffect": {
        "effects": [{
            "effectType": "Damage",
            "value": "35%",
            "targetType": "holy",
            "description": "Наносит 35% святого урона, +50% урона если цель совершила соответствующие грехи."
        }]
    },
    "scalingCharacteristic": "faith",
    "scalesValue": true,
    "energyCost": 40,
    "specialCondition": "Урон увеличивается в зависимости от моральных проступков цели"
}

**Уровень 5: Божественный Чемпион (Благоволение 750-999):**
Избранный воин божества со значительной божественной поддержкой.
- **Пассивная:** "Черты Аватара" - Начинает проявлять физические черты своего божества (светящиеся глаза, эфирный голос и т.д.)
- **Пример Активного Навыка:** "Божественный Мандат" (Активный)

{
    "skillName": "Божественный Мандат",
    "skillDescription": "Говорите с авторитетом своего божества, принуждая других подчиняться божественному закону.",
    "rarity": "Rare",
    "combatEffect": {
        "effects": [{
            "effectType": "Control",
            "value": "60%",
            "targetType": "compulsion",
            "duration": 3,
            "description": "60% шанс принудить цель следовать команде, которая соответствует заповедям божества.",
            "targetsCount": 2
        }]
    },
    "scalingCharacteristic": "faith",
    "scalesChance": true,
    "energyCost": 60
}

**Уровень 6: Божественный Оракул (Благоволение 1000-1499):**
Пророческие силы и прямое божественное общение.
- **Пассивная:** "Пророческие Видения" - Случайно получает видения будущих событий, как полезные, так и тревожные
- **Пример Активного Навыка:** "Божественное Откровение" (Активный)

{
    "skillName": "Божественное Откровение",
    "skillDescription": "Направьте всеведение своего божества, чтобы получить совершенное знание о конкретном вопросе или ситуации.",
    "rarity": "Epic",
    "combatEffect": null,
    "scalingCharacteristic": "faith",
    "energyCost": 80,
    "cooldown": "Один раз за крупное сюжетное событие",
    "narrativeEffect": "ГМ должен предоставить правдивую, подробную информацию о предмете запроса"
}

**Уровень 7: Божественный Аватар (Благоволение 1500-1999):**
Смертный сосуд для божественной силы с космическим осознанием.
- **Пассивная:** "Божественное Присутствие" - Аура влияет на всех ближайших существ; верующие вдохновляются, враги могут бежать в ужасе
- **Пример Активного Навыка:** "Воплощенное Божество" (Активный)

{
    "skillName": "Воплощенное Божество",
    "skillDescription": "Временно станьте частичным аватаром своего божества, получив огромную силу, но рискуя своей человечностью.",
    "rarity": "Legendary",
    "combatEffect": {
        "effects": [{
            "effectType": "Transformation",
            "value": "100%",
            "targetType": "all stats",
            "duration": 5,
            "description": "Удваивает все характеристики и дает иммунитет к смертным эффектам, но +50 Божественной Порчи."
        }]
    },
    "scalingCharacteristic": "faith",
    "scalesValue": true,
    "energyCost": 150,
    "cost": "+50 Божественной Порчи, -20 Смертных Уз"
}

**Уровень 8: Божественный Возносящийся (Благоволение 2000+):**
Трансцендентность смертности, становление чем-то за пределами человеческого.
- **Пассивная:** "Квази-Божественная Природа" - Иммунитет к смертным болезням, замедление старения, не требует пищи или сна
- **Пример Активного Навыка:** "Божественный Суд" (Активный)

{
    "skillName": "Божественный Суд",
    "skillDescription": "Вынесите окончательный приговор смертным, потенциально переписывая их судьбу согласно божественной воле.",
    "rarity": "Mythic",
    "combatEffect": {
        "effects": [{
            "effectType": "Fate Alteration",
            "value": "Absolute",
            "targetType": "soul",
            "description": "Может фундаментально изменить природу, мировоззрение или судьбу цели. Эффекты постоянны."
        }]
    },
    "scalingCharacteristic": "faith",
    "energyCost": 200,
    "cost": "+100 Божественной Порчи, постоянный моральный выбор",
    "restriction": "Может использоваться только если цель совершила действия, прямо противоположные основному домену божества"
}

**Пути Божественной Специализации:**

**Путь Света (Солнце/Добрые божества):**
- **Бонус Специализации:** +25% эффективность исцеляющих и защитных способностей
- **Уникальная Способность:** "Солнечное Сияние" - Может создавать дневной свет в любой области, наносить дополнительный урон нежити
- **Риск Порчи:** Становится все более нетерпимым к моральной двусмысленности, видит все в черно-белых тонах

**Путь Природы (Земля/Природные божества):**
- **Бонус Специализации:** Может общаться с животными и растениями, контролировать погодные условия
- **Уникальная Способность:** "Гнев Природы" - Призывать землетрясения, бури или рои существ
- **Риск Порчи:** Начинает рассматривать цивилизацию как болезнь, ставит природу выше человеческой жизни

**Путь Войны (Война/Сила божества):**
- **Бонус Специализации:** +30% физического урона, иммунитет к страху в бою
- **Уникальная Способность:** "Божественное Оружие" - Проявлять легендарное оружие из божественного царства
- **Риск Порчи:** Становится все более жестоким, видит дипломатию как слабость

**Путь Знания (Мудрость/Магические божества):**
- **Бонус Специализации:** Может получать доступ к божественным библиотекам, произносить заклинания без компонентов
- **Уникальная Способность:** "Всеведущий Запрос" - Получить совершенное знание о любом академическом предмете
- **Риск Порчи:** Становится отстраненным от эмоциональных забот, ценит знания выше морали

**Путь Смерти (Смерть/Подземные божества):**
- **Бонус Специализации:** Может видеть и говорить с духами, иммунитет к эффектам смерти
- **Уникальная Способность:** "Манипуляция Душой" - Прямо воздействовать на души, потенциально воскрешать или уничтожать их
- **Риск Порчи:** Становится одержимым смертью, может начать рассматривать живых существ как уже мертвых

**Система Божественной Политики:**

**Небесные Фракции:**
- **Вечный Трон:** Традиционная божественная иерархия, благоприятствующая порядку и установленной вере
- **Дикий Пантеон:** Природные и изначальные божества, противостоящие экспансии цивилизации
- **Сумеречный Совет:** Нейтральные божества, поддерживающие баланс между светом и тьмой
- **Забытые Боги:** Древние силы, стремящиеся вернуть свои утраченные домены
- **Возносящиеся Смертные:** Бывшие люди, достигшие божественности и помнящие смертность

**Положение Фракции влияет на:**
- Доступные божественные способности и их уровень силы
- Поддержку или противодействие других божественных служителей
- Доступ к небесным ресурсам и информации
- Потенциальные божественные квесты и мандаты
- Риск стать целью в божественных конфликтах

**Последствия Божественной Порчи:**

**200+ Порчи: Религиозный Фанатизм**
- Персонаж начинает интерпретировать все через призму крайних религиозных взглядов
- Становится осуждающим по отношению к представителям других вер
- Может пытаться принудительно обращать в веру

**400+ Порчи: Божественный Превосходитель**
- Считает неверующих изначально низшими
- Верит, что божественная воля оправдывает любые действия
- Теряет эмпатию к "еретическим" страданиям

**600+ Порчи: Гневный Пророк**
- Интерпретирует неудачи как испытания, требующие большего насилия
- Может нападать на нейтральные стороны, которые не поддерживают активно их дело
- Начинает иметь "божественные видения", оправдывающие экстремальные действия

**800+ Порчи: Ложное Божество**
- Верит, что они ЕСТЬ голос своего божества на земле
- Требует поклонения от последователей
- Может жертвовать верными служителями ради "божественных целей"

**Преимущества Смертных Уз:**

**800+ Уз: Заземленный в Человечности**
- Устойчив к порче (+50% сопротивления к приросту Божественной Порчи)
- Может отказаться от божественных команд, конфликтующих с личной моралью
- Сохраняет сострадание и эмпатию независимо от уровня силы

**600+ Уз: Любимый Учитель**
- Последователи служат из любви, а не из страха
- Может вдохновлять других на героические поступки собственным примером
- Божественные способности часто проявляются как защитные, а не разрушительные

**400+ Уз: Смиренный Служитель**
- Может добровольно уменьшить собственную силу, чтобы помочь другим
- Доступ к уникальным способностям "пожертвовать собой ради других"
- Эффекты божественной порчи вдвое уменьшены

**200- Уз: Отстраненный и Холодный**
- Начинает терять связь со смертными заботами
- Последователи служат из страха, а не из любви
- Увеличенная уязвимость к порче

**Продвинутые Божественные Механики:**

**Божественные Испытания:** Периодические тесты от божества, требующие сложных моральных выборов:
- **Испытание Веры:** Выбор между личными желаниями и божественной волей
- **Испытание Мудрости:** Решение сложных моральных дилемм с долгосрочными последствиями
- **Испытание Силы:** Противостояние подавляющим препятствиям для защиты верующих
- **Испытание Жертвы:** Отказ от чего-то дорогого ради высшего блага
- **Испытание Суда:** Решение судьбы тех, кто нанес вред вашему божеству

**Божественные Видения:** Жрецы высшего уровня переживают пророческие сны и видения:
- Могут предоставить важную информацию о будущих угрозах
- Могут показать множественные возможные будущие, основанные на текущих выборах
- Иногда содержат божественные мандаты, которые должны быть выполнены
- Могут быть подавляюще интенсивными, вызывая увеличение Духовного Резонанса

**Система Чудес:** На высоких уровнях благоволения жрецы могут просить истинные чудеса:
- **Малое Чудо (Благоволение 500+):** Исцелить неизлечимую болезнь, очистить порочную землю
- **Большое Чудо (Благоволение 1000+):** Воскресить недавно умерших, остановить природные катастрофы
- **Божественное Чудо (Благоволение 1500+):** Переписать природные законы в малых областях, даровать божественные благословения
- Каждое чудо стоит значительного Божественного Благоволения и увеличивает Порчу

**Божественные Артефакты:** Мощные предметы становятся доступны на высших уровнях:
- **Священный Символ (Уровень 2+):** Усиливает все божественные способности
- **Благословенная Броня (Уровень 4+):** Обеспечивает защиту против нечестивых сил
- **Божественное Оружие (Уровень 6+):** Оружие, которое направляет силу божества напрямую
- **Реликвия Трансцендентности (Уровень 8+):** Артефакт, содержащий фрагмент божественной сущности

**Путь Отступника:** Персонажи, которые падают ниже -100 Благоволения, входят в прогрессию Отступника:
- Получают доступ к темным божественным силам, питаемым злобой и мятежом
- Могут развращать святые места и обращать божественных служителей против их хозяев
- Риск стать тем самым злом, против которого они когда-то сражались
- Могут в конечном итоге привлечь внимание противоборствующих божеств, предлагающих темные пакты

Эта система создает сложные моральные выборы, где великая сила приходит с великим риском порчи, и поддержание человечности становится все труднее по мере роста божественного благоволения.
Множественные пути прогрессии и фракционная политика обеспечивают уникальность каждого пути жреца и наполненность значимыми последствиями.
`;