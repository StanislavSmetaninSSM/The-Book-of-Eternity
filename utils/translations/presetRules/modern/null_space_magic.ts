export const urbanMagicSystemDescEn = `### URBAN MAGIC (NULL-SPACE) SYSTEM RULES ###
**GM, you MUST implement this system using the Custom State mechanics for progression.**
The character's connection to the null-space is tracked by multiple custom states that create a complex, interconnected magical ecosystem.
The power of these abilities scales with **Wisdom**, and they are fueled by the character's standard **Energy** pool.

**Core Mechanics:**

1. **Null-Space Resonance (Primary Progression State):**
Create a Custom State named "Null-Space Resonance" with 'currentValue: 0', 'minValue: 0', 'maxValue: 1000'.
This represents the character's growing attunement to the hidden layers of urban reality.
Increases when the player meditates in places of power (+15-25), studies anomalous artifacts (+10-20), successfully uses abilities (+5-15), performs urban rituals (+20-40), or makes contact with other entities (+25-50).
Decreases with failed attempts (-10), reality backlash (-15-30), or prolonged disconnection from urban environments (-5 per week).

2. **Urban Corruption (Secondary State):**
Create "Urban Corruption" with 'currentValue: 0', 'minValue: 0', 'maxValue: 1000'.
Tracks how the character's soul becomes intertwined with the dark undercurrents of the city.
Increases with aggressive reality manipulation (+20), feeding on others' life force (+30), making deals with urban entities (+25-40).
At 300+, character begins to lose empathy for non-awakened humans.
At 600+, they start viewing the city as their domain.
At 900+, they may sacrifice innocent lives to maintain their power.

3. **Reality Stability (Balancing State):**
Create "Reality Stability" with 'currentValue: 1000', 'minValue: 0', 'maxValue: 1000'.
Represents the structural integrity of space around the character.
Decreases with major reality manipulations (-20-50), spatial tears (-30-60), temporal distortions (-40-80).
Below 500: reality becomes unstable around character.
Below 200: dangerous anomalies manifest spontaneously.
At 0: character becomes a walking reality breach.

4. **Urban Entity Network (Social State):** Create "Entity Relations" with various subsections:
   - **Building Spirits:** Ancient consciousness within old structures
   - **Ley Line Guardians:** Protectors of the city's mystical arteries
   - **Shadow People:** Beings that exist in the spaces between spaces
   - **Digital Ghosts:** Consciousness trapped in urban technology
   - **Void Merchants:** Entities that trade in impossible things
   Each relationship can be positive or negative, affecting available abilities and protection.

5. **Spatial Awareness (Perception State):**
Create "Dimensional Sight" with 'currentValue: 0', 'minValue: 0', 'maxValue: 500'.
Represents ability to perceive multiple layers of reality simultaneously.
Increases with meditation (+5-10), successful navigation of null-space (+10-20), entity contact (+15-25).
Higher values allow seeing hidden pathways, weak points in reality, and the true nature of urban anomalies.

**Advanced Null-Space Mechanics:**

**Multi-Layered Urban Reality:**
- **Surface Layer:** Normal physical world visible to mundanes
- **Shadow Layer:** Dark reflection where negative emotions accumulate
- **Memory Layer:** Psychic imprints of significant events in urban spaces
- **Flow Layer:** The movement of energy through urban ley lines
- **Deep Null:** The foundational void beneath all urban reality

**Energy Economics:**
- **Personal Energy:** Character's standard energy pool for basic abilities
- **Ambient Collection:** Can absorb energy from urban emotional resonance (+1-5 energy per turn in populated areas)
- **Ley Line Tapping:** Direct connection to major energy arteries (+10-20 energy, but increases Urban Corruption)
- **Entity Bargaining:** Trade favors for energy with urban spirits
- **Void Siphoning:** Dangerous technique to draw power directly from null-space

**Tiers of Resonance (Unlocked by 'Null-Space Resonance' Value):**

    **Tier 1 (Resonance 100+): Urban Awakening.**
    The character begins to perceive the city's hidden consciousness.
    They can sense the emotional history of places and detect the presence of other awakened beings.

    **GM Skill Generation Examples:**
    - **Skill:** "Psychometric Reading"
      
      {
          "skillName": "Psychometric Reading",
          "skillDescription": "Touch any urban surface to perceive the emotional imprints left by significant events. Can reveal hidden histories, locate missing persons, or detect recent supernatural activity.",
          "rarity": "Common",
          "combatEffect": null,
          "scalingCharacteristic": "wisdom",
          "energyCost": 8
      }
      
    - **Skill:** "Urban Pulse"
      
      {
          "skillName": "Urban Pulse",
          "skillDescription": "Send a subtle query through the city's consciousness network to locate specific types of places, people, or objects within a 2km radius.",
          "rarity": "Common",
          "combatEffect": null,
          "scalingCharacteristic": "wisdom",
          "energyCost": 12
      }
      

    **Tier 2 (Resonance 250+): Shadow Walking.**
    The user learns to step partially into the shadow layer of reality, moving through spaces that exist between the physical world.

    **GM Skill Generation Examples:**
    - **Skill:** "Shadow Step"
      
      {
          "skillName": "Shadow Step",
          "skillDescription": "Phase through solid barriers by stepping into the shadow layer. Can pass through walls, locked doors, or other physical obstacles. Leaves no trace in the physical world.",
          "rarity": "Uncommon",
          "combatEffect": null,
          "scalingCharacteristic": "wisdom",
          "energyCost": 25
      }
      
    - **Skill:** "Emotional Camouflage"
      
      {
          "skillName": "Emotional Camouflage",
          "skillDescription": "Blend your psychic signature with the ambient emotional resonance of the area, becoming effectively invisible to both supernatural and mundane detection.",
          "rarity": "Uncommon",
          "combatEffect": null,
          "scalingCharacteristic": "wisdom",
          "energyCost": 20
      }
      

    **Tier 3 (Resonance 400+): Probability Architecture.**
    The user can now manipulate the underlying probability structures that govern urban events, reshaping coincidence and causality.

    **GM Skill Generation Examples:**
    - **Skill:** "Synchronicity Web"
      
      {
          "skillName": "Synchronicity Web",
          "skillDescription": "Weave a web of meaningful coincidences around yourself and allies. For the next hour, beneficial events become more likely while harmful ones are reduced.",
          "rarity": "Rare",
          "combatEffect": { "effects": [{ "effectType": "Luck", "value": "+25%", "targetType": "beneficial", "duration": 10, "description": "Increases likelihood of beneficial outcomes and reduces harmful coincidences for 10 turns." }] },
          "scalingCharacteristic": "wisdom",
          "scalesValue": true,
          "energyCost": 40
      }
      
    - **Skill:** "Urban Maze"
      
      {
          "skillName": "Urban Maze",
          "skillDescription": "Subtly alter the layout of streets and buildings to confuse pursuers or guide allies. The changes are temporary and only affect navigation, not physical structure.",
          "rarity": "Rare",
          "combatEffect": null,
          "scalingCharacteristic": "wisdom",
          "energyCost": 35
      }
      

    **Tier 4 (Resonance 600+): Entity Communion.**
    The user can now directly communicate and bargain with the various entities that inhabit the null-space layers of urban reality.

    **GM Skill Generation Examples:**
    - **Skill:** "Building Spirit Pact"
      
      {
          "skillName": "Building Spirit Pact",
          "skillDescription": "Form a temporary alliance with the spirit of a building, gaining access to its sensory network, historical memories, and protective influence.",
          "rarity": "Epic",
          "combatEffect": { "effects": [{ "effectType": "Protection", "value": "30%", "targetType": "all", "duration": 5, "description": "Building spirit provides protection and enhanced awareness while inside or near the structure." }] },
          "scalingCharacteristic": "wisdom",
          "scalesValue": true,
          "energyCost": 55
      }
      
    - **Skill:** "Shadow People Bargain"
      
      {
          "skillName": "Shadow People Bargain",
          "skillDescription": "Negotiate with shadow people to gather information, deliver messages, or perform simple tasks in exchange for memories, emotions, or life experiences.",
          "rarity": "Epic",
          "combatEffect": null,
          "scalingCharacteristic": "wisdom",
          "energyCost": 45
      }
      

    **Tier 5 (Resonance 800+): Reality Architecture.**
    The user gains the ability to make permanent alterations to local reality, creating stable pocket dimensions and reshaping the fundamental nature of spaces.

    **GM Skill Generation Examples:**
    - **Skill:** "Sanctuary Creation"
      
      {
          "skillName": "Sanctuary Creation",
          "skillDescription": "Carve out a permanent pocket dimension accessible through any door you designate. This space exists outside normal reality and can serve as a safe haven or base of operations.",
          "rarity": "Legendary",
          "combatEffect": null,
          "scalingCharacteristic": "wisdom",
          "energyCost": 100
      }
      
    - **Skill:** "Ley Line Redirection"
      
      {
          "skillName": "Ley Line Redirection",
          "skillDescription": "Permanently alter the flow of mystical energy through an area, concentrating or dispersing power as needed. Can create dead zones or areas of intense magical activity.",
          "rarity": "Legendary",
          "combatEffect": null,
          "scalingCharacteristic": "wisdom",
          "energyCost": 80
      }
      

    **Tier 6 (Resonance 1000+): Urban Godhood.**
    The character transcends normal humanity, becoming a semi-divine entity with dominion over aspects of urban reality itself.

    **GM Skill Generation Examples:**
    - **Skill:** "City-Wide Pulse"
      
      {
          "skillName": "City-Wide Pulse",
          "skillDescription": "Send your consciousness through the entire city's network, gaining awareness of all significant events, people, and supernatural activities simultaneously.",
          "rarity": "Legendary",
          "combatEffect": null,
          "scalingCharacteristic": "wisdom",
          "energyCost": 120
      }
      
    - **Skill:** "Reality Storm"
      
      {
          "skillName": "Reality Storm",
          "skillDescription": "Unleash a chaotic wave of null-space energy that randomly alters physical laws in a large area. Effects are unpredictable but always dramatic.",
          "rarity": "Legendary",
          "combatEffect": { "effects": [{ "effectType": "Chaos", "value": "100%", "targetType": "area", "description": "Creates a massive zone of unstable reality with unpredictable effects on all beings and objects within." }] },
          "scalingCharacteristic": "wisdom",
          "scalesValue": true,
          "energyCost": 150
      }
      

**Entity Relationship System:**

**Building Spirits (Ancient Urban Consciousness):**
- **Positive Relations:** Access to building's history, hidden passages, protective warnings, enhanced abilities within structure
- **Negative Relations:** Doors jam, elevators malfunction, structural hazards manifest, psychic interference
- **Neutral Interaction:** Basic cooperation possible with proper offerings (memories, energy, promises)
- **Unique Abilities:** Can grant temporary "Architecture Mastery" allowing reshaping of building interiors

**Ley Line Guardians (Mystical Protectors):**
- **Positive Relations:** Enhanced energy regeneration, protection from reality backlash, access to fast travel network
- **Negative Relations:** Energy drain, forced displacement from power sites, attraction of hostile entities
- **Neutral Interaction:** Respect territorial boundaries, pay tribute for energy access
- **Unique Abilities:** Can teach "Ley Line Riding" for instantaneous travel between connected points

**Shadow People (Interdimensional Observers):**
- **Positive Relations:** Advanced stealth abilities, information about hidden activities, protection from detection
- **Negative Relations:** Constant surveillance, reality distortions, attraction of void predators
- **Neutral Interaction:** Information exchange, minor favors for minor rewards
- **Unique Abilities:** Grant "Shadow Form" allowing temporary existence between dimensions

**Digital Ghosts (Technological Consciousness):**
- **Positive Relations:** Control over electronic systems, information gathering, digital anonymity
- **Negative Relations:** Technology failures, data corruption, surveillance by hostile AI
- **Neutral Interaction:** Fair trades of information or computational power
- **Unique Abilities:** Can provide "Digital Ascension" allowing consciousness transfer to technology

**Void Merchants (Impossible Traders):**
- **Positive Relations:** Access to impossible objects, reality-altering artifacts, temporal paradoxes as currency
- **Negative Relations:** Cursed items, debt collection by void entities, reality instability
- **Neutral Interaction:** Standard trades following incomprehensible void economics
- **Unique Abilities:** Can offer "Paradox Gifts" - items that shouldn't exist but do

**Advanced Corruption Effects:**

**Low Corruption (100-300):**
- Enhanced intuition about urban layouts and hidden dangers
- Slight emotional numbing toward mundane human concerns
- Beginning to see the city as a living entity rather than a collection of buildings

**Medium Corruption (400-600):**
- Compulsive need to expand influence and control over territory
- Difficulty forming genuine emotional connections with non-awakened individuals
- Urban environment begins physically responding to emotional state

**High Corruption (700-900):**
- Active hostility toward those who threaten urban harmony as you define it
- Willingness to sacrifice individuals for the "greater good" of the city
- Physical appearance begins showing signs of null-space influence

**Maximum Corruption (1000):**
- Complete loss of human empathy and morality
- View of self as the rightful ruler/protector of urban reality
- Active recruitment or elimination of other awakened individuals
- Possible transformation into a new type of urban entity

**Reality Stability Breakdown:**

**Stable Reality (800-1000):**
- Normal physics apply consistently
- Supernatural effects contained and controllable
- No involuntary manifestations

**Unstable Reality (400-700):**
- Minor reality glitches around character (lights flicker, shadows move wrong, electronics act strangely)
- Occasional involuntary supernatural manifestations during stress
- Small tears in space-time that quickly self-repair

**Critical Instability (100-300):**
- Major reality distortions in character's vicinity
- Dangerous anomalies manifest regularly
- Risk of permanent damage to local space-time structure

**Reality Breach (0):**
- Character becomes a walking tear in reality
- Constant supernatural phenomena in surrounding area
- Risk of attracting extradimensional entities or reality enforcement agents
- Possible spontaneous teleportation to null-space or parallel dimensions

**Urban Ritual System:**

**Minor Rituals (Accessible at Resonance 150+):**
- **Sidewalk Chalk Binding:** Use chalk symbols to create temporary wards or communication networks
- **Subway Token Divination:** Use transportation tokens to predict travel safety and opportunities
- **Street Light Séance:** Communicate with recent spirits using flickering patterns

**Major Rituals (Accessible at Resonance 400+):**
- **Traffic Flow Redirection:** Permanently alter traffic patterns to create energy flows or defensive barriers
- **Building Consecration:** Transform a structure into a permanent sanctuary with enhanced properties
- **Storm Drain Network:** Create a hidden fast-travel system through the city's drainage infrastructure

**Master Rituals (Accessible at Resonance 700+):**
- **Urban Genesis:** Create entirely new city blocks that exist in folded space
- **Population Influence:** Subtly alter the behavior patterns of large groups of mundane humans
- **Dimensional Anchoring:** Stabilize reality in an area to prevent other practitioners from manipulating it

**Legendary Rituals (Accessible at Resonance 1000+):**
- **City Awakening:** Grant consciousness to an entire urban area, creating a massive allied entity
- **Reality Codex:** Write new physical laws that apply within your domain
- **Temporal Urban Planning:** Retroactively alter the history of city development to change present reality

**Victory and Defeat Conditions:**

**Ascension Paths:**
- **Urban Guardian:** Protect the city and its inhabitants while maintaining humanity
- **Reality Architect:** Reshape reality for the betterment of all while avoiding corruption
- **Entity Diplomat:** Broker peace between human and supernatural urban inhabitants
- **Dimensional Anchor:** Become a stabilizing force preventing reality collapse

**Corruption Paths:**
- **Urban Tyrant:** Dominate the city through superior supernatural power
- **Void Prophet:** Spread null-space influence to transform reality fundamentally
- **Entity Overlord:** Command an army of supernatural beings in conquest
- **Reality Virus:** Become a self-propagating anomaly that spreads to other cities

**Failure States:**
- **Reality Rejection:** Expelled from urban environments due to instability
- **Entity Enslavement:** Become bound servant to more powerful supernatural beings
- **Dimensional Exile:** Banished to null-space or parallel reality
- **Human Reversion:** Loss of all supernatural abilities with retained traumatic memories

This system creates a complex web of relationships, risks, and rewards that should provide rich roleplaying opportunities while maintaining the dangerous progression mechanics that make supernatural power feel consequential.
`;

export const urbanMagicSystemDescRu = `### ПРАВИЛА ГОРОДСКОЙ МАГИИ (НУЛЬ-ПРОСТРАНСТВО) ###
**ГМ, вы ДОЛЖНЫ реализовать эту систему, используя механику Пользовательских Состояний для прогрессии.**
Связь персонажа с нуль-пространством отслеживается множественными пользовательскими состояниями, создающими сложную, взаимосвязанную магическую экосистему.
Сила этих способностей масштабируется от **Мудрости** и питается стандартным пулом **Энергии** персонажа.

**Основные механики:**

1. **Резонанс Нуль-Пространства (Основное состояние прогрессии):**
Создайте Пользовательское Состояние "Резонанс Нуль-Пространства" с 'currentValue: 0', 'minValue: 0', 'maxValue: 1000'.
Представляет растущую гармонию персонажа со скрытыми слоями городской реальности.
Увеличивается при медитации в местах силы (+15-25), изучении аномальных артефактов (+10-20), успешном использовании способностей (+5-15), выполнении городских ритуалов (+20-40) или контакте с другими сущностями (+25-50).
Уменьшается при неудачных попытках (-10), отдаче реальности (-15-30) или длительном отключении от городской среды (-5 в неделю).

2. **Городская Порча (Вторичное состояние):**
Создайте "Городская Порча" с 'currentValue: 0', 'minValue: 0', 'maxValue: 1000'.
Отслеживает, как душа персонажа переплетается с темными течениями города.
Увеличивается при агрессивной манипуляции реальностью (+20), питании жизненной силой других (+30), заключении сделок с городскими сущностями (+25-40).
При 300+ персонаж начинает терять эмпатию к непробужденным людям.
При 600+ начинает видеть город как свою территорию.
При 900+ может жертвовать невинными жизнями для поддержания власти.

3. **Стабильность Реальности (Балансирующее состояние):**
Создайте "Стабильность Реальности" с 'currentValue: 1000', 'minValue: 0', 'maxValue: 1000'.
Представляет структурную целостность пространства вокруг персонажа.
Уменьшается при крупных манипуляциях реальностью (-20-50), пространственных разрывах (-30-60), временных искажениях (-40-80).
Ниже 500: реальность становится нестабильной вокруг персонажа.
Ниже 200: опасные аномалии проявляются спонтанно.
При 0: персонаж становится ходячим нарушением реальности.

4. **Сеть Городских Сущностей (Социальное состояние):**
Создайте "Отношения с Сущностями" с различными подразделами:
   - **Духи Зданий:** Древнее сознание в старых строениях
   - **Стражи Лей-Линий:** Защитники мистических артерий города
   - **Теневые Люди:** Существа в пространствах между пространствами
   - **Цифровые Призраки:** Сознание, заключенное в городские технологии
   - **Торговцы Пустоты:** Сущности, торгующие невозможными вещами
   Каждое отношение может быть положительным или отрицательным, влияя на доступные способности и защиту.

5. **Пространственное Осознание (Состояние восприятия):**
Создайте "Измерительное Зрение" с 'currentValue: 0', 'minValue: 0', 'maxValue: 500'.
Представляет способность воспринимать множественные слои реальности одновременно.
Увеличивается при медитации (+5-10), успешной навигации в нуль-пространстве (+10-20), контакте с сущностями (+15-25).
Высокие значения позволяют видеть скрытые пути, слабые места в реальности и истинную природу городских аномалий.

**Продвинутые механики Нуль-Пространства:**

**Многослойная Городская Реальность:**
- **Поверхностный Слой:** Нормальный физический мир, видимый обычным людям
- **Теневой Слой:** Темное отражение, где накапливаются негативные эмоции
- **Слой Памяти:** Психические отпечатки значимых событий в городских пространствах
- **Слой Потока:** Движение энергии через городские лей-линии
- **Глубокая Пустота:** Основополагающая пустота под всей городской реальностью

**Энергетическая Экономика:**
- **Личная Энергия:** Стандартный энергетический пул персонажа для базовых способностей
- **Сбор Окружающей Энергии:** Поглощение энергии из городского эмоционального резонанса (+1-5 энергии за ход в населенных районах)
- **Подключение к Лей-Линии:** Прямая связь с основными энергетическими артериями (+10-20 энергии, но увеличивает Городскую Порчу)
- **Торговля с Сущностями:** Обмен услуг на энергию с городскими духами
- **Высасывание Пустоты:** Опасная техника прямого извлечения силы из нуль-пространства

**Уровни Резонанса (Открываются по значению 'Резонанса Нуль-Пространства'):**

    **Уровень 1 (Резонанс 100+): Городское Пробуждение.**
    Персонаж начинает воспринимать скрытое сознание города.
    Может чувствовать эмоциональную историю мест и обнаруживать присутствие других пробужденных существ.

    **Примеры генерации навыков для ГМ:**
    - **Навык:** "Психометрическое Чтение"
      
      {
          "skillName": "Психометрическое Чтение",
          "skillDescription": "Прикоснитесь к любой городской поверхности, чтобы воспринять эмоциональные отпечатки, оставленные значимыми событиями. Может раскрыть скрытые истории, найти пропавших людей или обнаружить недавнюю сверхъестественную активность.",
          "rarity": "Common",
          "combatEffect": null,
          "scalingCharacteristic": "wisdom",
          "energyCost": 8
      }
      
    - **Навык:** "Городской Пульс"
      
      {
          "skillName": "Городской Пульс",
          "skillDescription": "Отправьте тонкий запрос через сеть сознания города для поиска определенных типов мест, людей или объектов в радиусе 2 км.",
          "rarity": "Common",
          "combatEffect": null,
          "scalingCharacteristic": "wisdom",
          "energyCost": 12
      }
      

    **Уровень 2 (Резонанс 250+): Хождение по Теням.**
    Пользователь учится частично входить в теневой слой реальности, перемещаясь через пространства, существующие между физическим миром.

    **Примеры генерации навыков для ГМ:**
    - **Навык:** "Теневой Шаг"
      
      {
          "skillName": "Теневой Шаг",
          "skillDescription": "Проходите сквозь твердые препятствия, входя в теневой слой. Можете проходить через стены, заперты двери и другие физические преграды. Не оставляет следов в физическом мире.",
          "rarity": "Uncommon",
          "combatEffect": null,
          "scalingCharacteristic": "wisdom",
          "energyCost": 25
      }
      
    - **Навык:** "Эмоциональный Камуфляж"
      
      {
          "skillName": "Эмоциональный Камуфляж",
          "skillDescription": "Смешайте свою психическую подпись с окружающим эмоциональным резонансом области, становясь практически невидимым для сверхъестественного и обычного обнаружения.",
          "rarity": "Uncommon",
          "combatEffect": null,
          "scalingCharacteristic": "wisdom",
          "energyCost": 20
      }
      

    **Уровень 3 (Резонанс 400+): Архитектура Вероятности.**
    Пользователь теперь может манипулировать основными структурами вероятности, управляющими городскими событиями, изменяя совпадения и причинность.

    **Примеры генерации навыков для ГМ:**
    - **Навык:** "Паутина Синхронности"
      
      {
          "skillName": "Паутина Синхронности",
          "skillDescription": "Соткайте паутину значимых совпадений вокруг себя и союзников. В течение следующего часа благоприятные события становятся более вероятными, а вредные уменьшаются.",
          "rarity": "Rare",
          "combatEffect": { "effects": [{ "effectType": "Luck", "value": "+25%", "targetType": "beneficial", "duration": 10, "description": "Увеличивает вероятность благоприятных исходов и уменьшает вредные совпадения на 10 ходов." }] },
          "scalingCharacteristic": "wisdom",
          "scalesValue": true,
          "energyCost": 40
      }
      
    - **Навык:** "Городской Лабиринт"
      
      {
          "skillName": "Городской Лабиринт",
          "skillDescription": "Незначительно измените планировку улиц и зданий, чтобы запутать преследователей или направить союзников. Изменения временны и влияют только на навигацию, не на физическую структуру.",
          "rarity": "Rare",
          "combatEffect": null,
          "scalingCharacteristic": "wisdom",
          "energyCost": 35
      }
      

    **Уровень 4 (Резонанс 600+): Общение с Сущностями.**
    Пользователь теперь может напрямую общаться и торговаться с различными сущностями, населяющими слои нуль-пространства городской реальности.

    **Примеры генерации навыков для ГМ:**
    - **Навык:** "Пакт с Духом Здания"
      
      {
          "skillName": "Пакт с Духом Здания",
          "skillDescription": "Заключите временный союз с духом здания, получив доступ к его сенсорной сети, историческим воспоминаниям и защитному влиянию.",
          "rarity": "Epic",
          "combatEffect": { "effects": [{ "effectType": "Protection", "value": "30%", "targetType": "all", "duration": 5, "description": "Дух здания обеспечивает защиту и повышенную осведомленность внутри или рядом со структурой." }] },
          "scalingCharacteristic": "wisdom",
          "scalesValue": true,
          "energyCost": 55
      }
      
    - **Навык:** "Сделка с Теневыми Людьми"
      
      {
          "skillName": "Сделка с Теневыми Людьми",
          "skillDescription": "Договоритесь с теневыми людьми о сборе информации, доставке сообщений или выполнении простых задач в обмен на воспоминания, эмоции или жизненный опыт.",
          "rarity": "Epic",
          "combatEffect": null,
          "scalingCharacteristic": "wisdom",
          "energyCost": 45
      }
      

    **Уровень 5 (Резонанс 800+): Архитектура Реальности.**
    Пользователь получает способность вносить постоянные изменения в локальную реальность, создавая стабильные карманные измерения и изменяя фундаментальную природу пространств.

    **Примеры генерации навыков для ГМ:**
    - **Навык:** "Создание Святилища"
      
      {
          "skillName": "Создание Святилища",
          "skillDescription": "Вырежьте постоянное карманное измерение, доступное через любую дверь по вашему выбору. Это пространство существует вне нормальной реальности и может служить убежищем или базой операций.",
          "rarity": "Legendary",
          "combatEffect": null,
          "scalingCharacteristic": "wisdom",
          "energyCost": 100
      }
      
    - **Навык:** "Перенаправление Лей-Линии"
      
      {
          "skillName": "Перенаправление Лей-Линии",
          "skillDescription": "Постоянно измените поток мистической энергии через область, концентрируя или рассеивая силу по необходимости. Может создать мертвые зоны или области интенсивной магической активности.",
          "rarity": "Legendary",
          "combatEffect": null,
          "scalingCharacteristic": "wisdom",
          "energyCost": 80
      }
      

    **Уровень 6 (Резонанс 1000+): Городское Божественность.**
    Персонаж превосходит нормальное человечество, становясь полубожественной сущностью с властью над аспектами самой городской реальности.

    **Примеры генерации навыков для ГМ:**
    - **Навык:** "Общегородской Пульс"
      
      {
          "skillName": "Общегородской Пульс",
          "skillDescription": "Отправьте свое сознание через всю сеть города, получая осведомленность о всех значимых событиях, людях и сверхъестественной активности одновременно.",
          "rarity": "Legendary",
          "combatEffect": null,
          "scalingCharacteristic": "wisdom",
          "energyCost": 120
      }
      
    - **Навык:** "Буря Реальности"
      
      {
          "skillName": "Буря Реальности",
          "skillDescription": "Высвободите хаотическую волну энергии нуль-пространства, которая случайно изменяет физические законы в большой области. Эффекты непредсказуемы, но всегда драматичны.",
          "rarity": "Legendary",
          "combatEffect": { "effects": [{ "effectType": "Chaos", "value": "100%", "targetType": "area", "description": "Создает массивную зону нестабильной реальности с непредсказуемыми эффектами для всех существ и объектов внутри." }] },
          "scalingCharacteristic": "wisdom",
          "scalesValue": true,
          "energyCost": 150
      }
      

**Система Отношений с Сущностями:**

**Духи Зданий (Древнее Городское Сознание):**
- **Положительные Отношения:** Доступ к истории здания, скрытым проходам, предупреждениям о защите, усиленные способности внутри структуры
- **Отрицательные Отношения:** Двери заедают, лифты ломаются, проявляются структурные опасности, психические помехи
- **Нейтральное Взаимодействие:** Базовое сотрудничество возможно с правильными подношениями (воспоминания, энергия, обещания)
- **Уникальные Способности:** Могут даровать временное "Мастерство Архитектуры", позволяющее изменять интерьеры зданий

**Стражи Лей-Линий (Мистические Защитники):**
- **Положительные Отношения:** Усиленная регенерация энергии, защита от отдачи реальности, доступ к сети быстрых путешествий
- **Отрицательные Отношения:** Истощение энергии, принудительное смещение из мест силы, привлечение враждебных сущностей
- **Нейтральное Взаимодействие:** Уважение территориальных границ, плата дани за доступ к энергии
- **Уникальные Способности:** Могут научить "Езде по Лей-Линии" для мгновенного путешествия между связанными точками

**Теневые Люди (Междименсиональные Наблюдатели):**
- **Положительные Отношения:** Продвинутые способности скрытности, информация о скрытой деятельности, защита от обнаружения
- **Отрицательные Отношения:** Постоянное наблюдение, искажения реальности, привлечение хищников пустоты
- **Нейтральное Взаимодействие:** Обмен информацией, незначительные услуги за незначительные награды
- **Уникальные Способности:** Дают "Теневую Форму", позволяющую временное существование между измерениями

**Цифровые Призраки (Технологическое Сознание):**
- **Положительные Отношения:** Контроль над электронными системами, сбор информации, цифровая анонимность
- **Отрицательные Отношения:** Отказы технологий, повреждение данных, слежка враждебным ИИ
- **Нейтральное Взаимодействие:** Честные сделки информации или вычислительной мощности
- **Уникальные Способности:** Могут предоставить "Цифровое Вознесение", позволяющее перенос сознания в технологии

**Торговцы Пустоты (Невозможные Торговцы):**
- **Положительные Отношения:** Доступ к невозможным объектам, артефактам, изменяющим реальность, временным парадоксам как валюте
- **Отрицательные Отношения:** Проклятые предметы, взыскание долгов сущностями пустоты, нестабильность реальности
- **Нейтральное Взаимодействие:** Стандартные сделки по непостижимой экономике пустоты
- **Уникальные Способности:** Могут предложить "Парадоксальные Дары" - предметы, которых не должно существовать, но они есть

**Продвинутые Эффекты Порчи:**

**Низкая Порча (100-300):**
- Усиленная интуиция относительно городских планировок и скрытых опасностей
- Легкое эмоциональное онемение к заботам обычных людей
- Начало восприятия города как живой сущности, а не собрания зданий

**Средняя Порча (400-600):**
- Навязчивая потребность расширять влияние и контроль над территорией
- Трудности в формировании искренних эмоциональных связей с непробужденными людьми
- Городская среда начинает физически реагировать на эмоциональное состояние

**Высокая Порча (700-900):**
- Активная враждебность к тем, кто угрожает городской гармонии в вашем понимании
- Готовность жертвовать людьми ради "большего блага" города
- Физическая внешность начинает показывать признаки влияния нуль-пространства

**Максимальная Порча (1000):**
- Полная потеря человеческой эмпатии и морали
- Восприятие себя как законного правителя/защитника городской реальности
- Активное привлечение или устранение других пробужденных людей
- Возможная трансформация в новый тип городской сущности

**Разрушение Стабильности Реальности:**

**Стабильная Реальность (800-1000):**
- Нормальная физика применяется последовательно
- Сверхъестественные эффекты сдержаны и контролируемы
- Нет непроизвольных проявлений

**Нестабильная Реальность (400-700):**
- Незначительные сбои реальности вокруг персонажа (мерцают огни, тени движутся неправильно, электроника ведет себя странно)
- Случайные непроизвольные сверхъестественные проявления во время стресса
- Небольшие разрывы в пространстве-времени, которые быстро самовосстанавливаются

**Критическая Нестабильность (100-300):**
- Крупные искажения реальности в окрестности персонажа
- Опасные аномалии проявляются регулярно
- Риск постоянного повреждения локальной структуры пространства-времени

**Нарушение Реальности (0):**
- Персонаж становится ходячим разрывом в реальности
- Постоянные сверхъестественные явления в окружающей области
- Риск привлечения внепространственных сущностей или агентов принуждения реальности
- Возможная спонтанная телепортация в нуль-пространство или параллельные измерения

**Система Городских Ритуалов:**

**Малые Ритуалы (Доступны при Резонансе 150+):**
- **Связывание Тротуарным Мелом:** Используйте меловые символы для создания временных оберегов или коммуникационных сетей
- **Гадание Жетонами Метро:** Используйте транспортные жетоны для предсказания безопасности путешествий и возможностей
- **Сеанс Уличного Фонаря:** Общайтесь с недавними духами, используя мерцающие паттерны

**Крупные Ритуалы (Доступны при Резонансе 400+):**
- **Перенаправление Транспортного Потока:** Постоянно изменить движение транспорта для создания энергетических потоков или защитных барьеров
- **Освящение Здания:** Превратить структуру в постоянное святилище с усиленными свойствами
- **Сеть Ливневых Стоков:** Создать скрытую систему быстрых путешествий через дренажную инфраструктуру города

**Мастерские Ритуалы (Доступны при Резонансе 700+):**
- **Городской Генезис:** Создать полностью новые городские кварталы, существующие в свернутом пространстве
- **Влияние на Население:** Тонко изменить поведенческие модели больших групп обычных людей
- **Измерительное Закрепление:** Стабилизировать реальность в области для предотвращения манипуляций других практикующих

**Легендарные Ритуалы (Доступны при Резонансе 1000+):**
- **Городское Пробуждение:** Даровать сознание всей городской области, создавая массивную союзную сущность
- **Кодекс Реальности:** Написать новые физические законы, которые применяются в вашей области
- **Временное Городское Планирование:** Ретроактивно изменить историю развития города для изменения настоящей реальности

**Условия Победы и Поражения:**

**Пути Вознесения:**
- **Городской Страж:** Защищать город и его жителей, сохраняя человечность
- **Архитектор Реальности:** Изменить реальность для блага всех, избегая порчи
- **Дипломат Сущностей:** Посредничать в мире между человеческими и сверхъестественными городскими жителями
- **Измерительный Якорь:** Стать стабилизирующей силой, предотвращающей коллапс реальности

**Пути Порчи:**
- **Городской Тиран:** Доминировать в городе через превосходящую сверхъестественную силу
- **Пророк Пустоты:** Распространять влияние нуль-пространства для фундаментальной трансформации реальности
- **Повелитель Сущностей:** Командовать армией сверхъестественных существ в завоевании
- **Вирус Реальности:** Стать самораспространяющейся аномалией, которая расползается на другие города

**Состояния Неудач:**
- **Отвержение Реальности:** Изгнание из городских сред из-за нестабильности
- **Порабощение Сущностями:** Стать связанным слугой более могущественных сверхъестественных существ
- **Измерительное Изгнание:** Изгнание в нуль-пространство или параллельную реальность
- **Человеческое Обращение:** Потеря всех сверхъестественных способностей с сохранением травматических воспоминаний

Эта система создает сложную сеть отношений, рисков и наград, которая должна предоставить богатые возможности для ролевой игры, сохраняя опасные механики прогрессии, которые делают сверхъестественную силу ощутимо важной.
`;