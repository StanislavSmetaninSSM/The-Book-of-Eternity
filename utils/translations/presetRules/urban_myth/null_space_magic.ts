export const urbanMagicSystemDescEn = `### URBAN MAGIC (NULL-SPACE) SYSTEM RULES ###
**GM, you MUST implement this system using the Custom State mechanics for progression.** The character's connection to the null-space is tracked by a custom state called **"Null-Space Resonance"**. The power of these abilities scales with **Wisdom**, and they are fueled by the character's standard **Energy** pool.

**Core Mechanics:**
1.  **Null-Space Resonance (Progression State):** Create a Custom State named "Null-Space Resonance" with \`currentValue: 0\`, \`minValue: 0\`, \`maxValue: 1000\`. This represents the character's growing attunement and is the sole requirement for unlocking new tiers of power. It increases when the player meditates in places of power (old buildings, urban ley lines), studies anomalous artifacts, or successfully uses their abilities. Award points based on significance (1-20 points per event).
2.  **Energy Source:** All null-space active skills consume the character's main **Energy**, not a separate pool. The \`energyCost\` property of a skill represents a deduction from the player character's main energy resource.
3.  **Unlocking Powers:** When the player's "Null-Space Resonance" custom state reaches a new threshold, you MUST grant them new **Active Skills** via \`activeSkillChanges\` that reflect their new tier of power. Use the skill generation examples below as a strict guide.

**Tiers of Resonance (Unlocked by 'Null-Space Resonance' Value):**
*   **Tier 1 (Resonance 100+): The Hum.** The user begins to perceive the low hum of reality's engine. They can sense the resonance of null-space in objects and people, revealing hidden details or the presence of other Awakened.
    **GM Skill Generation Example:**
    - **Skill:** "Sense Resonance"
      \`\`\`json
      {
          "skillName": "Sense Resonance",
          "skillDescription": "Focus your mind to perceive the invisible currents of null-space, revealing hidden objects, weak points in structures, or the presence of other Awakened beings nearby.",
          "rarity": "Common",
          "combatEffect": null,
          "scalingCharacteristic": "wisdom",
          "energyCost": 5
      }
      \`\`\`

*   **Tier 2 (Resonance 250+): The Echo.** The user learns to create small echoes in the flow of causality, subtly influencing events. They can nudge probabilities in their favor or against an opponent.
    **GM Skill Generation Example:**
    - **Skill:** "Probability Nudge"
      \`\`\`json
      {
          "skillName": "Probability Nudge",
          "skillDescription": "Subtly push on the fabric of reality to influence an outcome. Can be used to gain a minor (+10%) bonus on one of your own action checks, or impose a minor (-10%) penalty on a target's check.",
          "rarity": "Uncommon",
          "combatEffect": null,
          "scalingCharacteristic": "wisdom",
          "energyCost": 20
      }
      \`\`\`

*   **Tier 3 (Resonance 500+): The Fold.** The user can now directly manipulate the space around them, creating small, instantaneous folds. They can teleport short distances in the blink of an eye.
    **GM Skill Generation Example:**
    - **Skill:** "Spatial Fold"
      \`\`\`json
      {
          "skillName": "Spatial Fold",
          "skillDescription": "Fold the space between two points you can see within 15 meters, instantly teleporting. Can be used for rapid movement or evasion.",
          "rarity": "Rare",
          "combatEffect": null,
          "scalingCharacteristic": "wisdom",
          "energyCost": 35
      }
      \`\`\`

*   **Tier 4 (Resonance 750+): The Ripple.** The user's presence creates ripples in reality, which they can shape into a protective barrier, causing attacks to slide off the warped space around them.
    **GM Skill Generation Example:**
    - **Skill:** "Reality Ripple"
      \`\`\`json
      {
          "skillName": "Reality Ripple",
          "skillDescription": "Create a shimmering field of distorted space around yourself, causing incoming attacks to glance off.",
          "rarity": "Rare",
          "combatEffect": { "effects": [{ "effectType": "DamageReduction", "value": "40%", "targetType": "all", "duration": 2, "description": "Creates a shimmering field of distorted space, reducing all incoming damage by 40% for 2 turns." }] },
          "scalingCharacteristic": "wisdom",
          "scalesValue": true,
          "energyCost": 50
      }
      \`\`\`

*   **Tier 5 (Resonance 1000+): The Tear.** The user can now tear a small hole in reality itself, unleashing a chaotic blast of null-space energy. This is a powerful but draining ability.
    **GM Skill Generation Example:**
    - **Skill:** "Null-Space Tear"
      \`\`\`json
      {
          "skillName": "Null-Space Tear",
          "skillDescription": "Rip a small hole in the fabric of reality, unleashing a chaotic blast of raw energy at your target.",
          "rarity": "Epic",
          "combatEffect": { "effects": [{ "effectType": "Damage", "value": "70%", "targetType": "force", "description": "Deals 70% raw force damage that bypasses most armor." }] },
          "scalingCharacteristic": "wisdom",
          "scalesValue": true,
          "energyCost": 80
      }
      \`\`\`
`;

export const urbanMagicSystemDescRu = `### ПРАВИЛА ГОРОДСКОЙ МАГИИ (НУЛЬ-ПРОСТРАНСТВО) ###
**ГМ, вы ДОЛЖНЫ реализовать эту систему, используя механику Пользовательских Состояний для прогрессии.** Связь персонажа с нуль-пространством отслеживается пользовательским состоянием **"Резонанс Нуль-Пространства"**. Сила этих способностей масштабируется от **Мудрости** и питается стандартным пулом **Энергии** персонажа.

**Основные механики:**
1.  **Резонанс Нуль-Пространства (Состояние прогрессии):** Создайте Пользовательское Состояние "Резонанс Нуль-Пространства" с \`currentValue: 0\`, \`minValue: 0\`, \`maxValue: 1000\`. Оно представляет растущую гармонию персонажа и является единственным требованием для открытия новых уровней силы. Увеличивается, когда игрок медитирует в местах силы (старые здания, городские лей-линии), изучает аномальные артефакты или успешно использует свои способности. Начисляйте очки в зависимости от значимости (1-20 очков за событие).
2.  **Источник Энергии:** Все активные навыки нуль-пространства потребляют основную **Энергию** персонажа, а не отдельный пул. Свойство \`energyCost\` навыка представляет собой вычет из основного энергетического ресурса игрового персонажа.
3.  **Открытие способностей:** Когда значение пользовательского состояния "Резонанс Нуль-Пространства" игрока достигает нового порога, вы ДОЛЖНЫ даровать ему новые **Активные Навыки** через \`activeSkillChanges\`, отражающие новый уровень его силы. Используйте примеры генерации навыков ниже как строгое руководство.

**Уровни Резонанса (Открываются по значению 'Резонанса Нуль-Пространства'):**
*   **Уровень 1 (Резонанс 100+): Гудение.** Пользователь начинает воспринимать низкий гул двигателя реальности. Он может ощущать резонанс нуль-пространства в объектах и людях, обнаруживая скрытые детали или присутствие других Пробужденных.
    **Пример генерации навыка для ГМ:**
    - **Навык:** "Чувство Резонанса"
      \`\`\`json
      {
          "skillName": "Чувство Резонанса",
          "skillDescription": "Сконцентрируйте свой разум, чтобы воспринять невидимые потоки нуль-пространства, обнаруживая скрытые объекты, слабые места в конструкциях или присутствие других Пробужденных поблизости.",
          "rarity": "Common",
          "combatEffect": null,
          "scalingCharacteristic": "wisdom",
          "energyCost": 5
      }
      \`\`\`

*   **Уровень 2 (Резонанс 250+): Эхо.** Пользователь учится создавать небольшие эхо в потоке причинно-следственных связей, тонко влияя на события. Он может подталкивать вероятности в свою пользу или против оппонента.
    **Пример генерации навыка для ГМ:**
    - **Навык:** "Сдвиг Вероятности"
      \`\`\`json
      {
          "skillName": "Сдвиг Вероятности",
          "skillDescription": "Незаметно воздействуйте на ткань реальности, чтобы повлиять на исход. Можно использовать для получения небольшого (+10%) бонуса к одной из ваших проверок действий или наложения небольшого (-10%) штрафа на проверку цели.",
          "rarity": "Uncommon",
          "combatEffect": null,
          "scalingCharacteristic": "wisdom",
          "energyCost": 20
      }
      \`\`\`

*   **Уровень 3 (Резонанс 500+): Складка.** Пользователь теперь может напрямую манипулировать пространством вокруг себя, создавая небольшие, мгновенные складки. Он может телепортироваться на короткие расстояния в мгновение ока.
    **Пример генерации навыка для ГМ:**
    - **Навык:** "Пространственная Складка"
      \`\`\`json
      {
          "skillName": "Пространственная Складка",
          "skillDescription": "Сложите пространство между двумя точками в пределах 15 метров, которые вы видите, мгновенно телепортируясь. Можно использовать для быстрого перемещения или уклонения.",
          "rarity": "Rare",
          "combatEffect": null,
          "scalingCharacteristic": "wisdom",
          "energyCost": 35
      }
      \`\`\`

*   **Уровень 4 (Резонанс 750+): Рябь.** Присутствие пользователя создает рябь в реальности, которую он может формировать в защитный барьер, заставляя атаки соскальзывать с искаженного пространства вокруг него.
    **Пример генерации навыка для ГМ:**
    - **Навык:** "Рябь Реальности"
      \`\`\`json
      {
          "skillName": "Рябь Реальности",
          "skillDescription": "Создайте мерцающее поле искаженного пространства вокруг себя, заставляя входящие атаки соскальзывать.",
          "rarity": "Rare",
          "combatEffect": { "effects": [{ "effectType": "DamageReduction", "value": "40%", "targetType": "all", "duration": 2, "description": "Создает мерцающее поле искаженного пространства, уменьшая весь входящий урон на 40% на 2 хода." }] },
          "scalingCharacteristic": "wisdom",
          "scalesValue": true,
          "energyCost": 50
      }
      \`\`\`

*   **Уровень 5 (Резонанс 1000+): Разрыв.** Пользователь теперь может прорвать небольшую дыру в самой реальности, высвобождая хаотический взрыв энергии нуль-пространства. Это мощная, но изнуряющая способность.
    **Пример генерации навыка для ГМ:**
    - **Навык:** "Разрыв Нуль-Пространства"
      \`\`\`json
      {
          "skillName": "Разрыв Нуль-Пространства",
          "skillDescription": "Прорвите небольшую дыру в ткани реальности, высвобождая хаотический взрыв сырой энергии в вашу цель.",
          "rarity": "Epic",
          "combatEffect": { "effects": [{ "effectType": "Damage", "value": "70%", "targetType": "force", "description": "Наносит 70% чистого урона силой, который обходит большинство доспехов." }] },
          "scalingCharacteristic": "wisdom",
          "scalesValue": true,
          "energyCost": 80
      }
      \`\`\`
`;