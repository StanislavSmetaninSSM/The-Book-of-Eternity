export const cultivationSystemDescEn = `### CULTIVATION SYSTEM RULES ###
**GM, you MUST implement this system using the Custom State mechanics for progression.** A cultivator's power is tracked by a custom state called **"Cultivation"**. The power of these abilities scales with **Wisdom**, and they are fueled by the character's standard **Energy** pool.

**Core Mechanics:**
1.  **Cultivation (Progression State):** Create a Custom State named "Cultivation" with \`currentValue: 0\`, \`minValue: 0\`, \`maxValue: 1500+\`. This represents the character's stage of spiritual and physical refinement. It increases through meditation, absorbing spiritual energy (Qi), consuming pills, or comprehending Daos. Award points based on significance (1-20 points per event).
2.  **Energy Source:** All cultivation active skills consume the character's main **Energy**, not a separate pool. The \`energyCost\` property of a skill represents a deduction from the player character's main energy resource.
3.  **Unlocking Powers:** When the player's "Cultivation" custom state reaches a new threshold, you MUST grant them a new **Active or Passive Skill** via \`activeSkillChanges\` or \`passiveSkillChanges\`. The skills listed below are balanced **examples**. You are encouraged to create other, thematically similar skills to reward the player's specific actions and make their progression feel unique.

**Stages of Cultivation (Unlocked by 'Cultivation' Value):**
*   **Stage 1 (Cultivation 100+): Qi Condensation.** The cultivator learns to sense and gather the world's spiritual energy (Qi).
    **GM Skill Generation Example:**
    - **Skill:** "Qi Sense" (Passive)
      \`\`\`json
      {
          "skillName": "Qi Sense",
          "skillDescription": "You can now faintly sense the flow of Qi in living beings and the environment, allowing you to gauge the general power level of others.",
          "rarity": "Common",
          "type": "Utility",
          "group": "Cultivation",
          "effectDetails": "Grants the ability to make a Wisdom check to determine if another being is significantly more or less powerful.",
          "masteryLevel": 1,
          "maxMasteryLevel": 1
      }
      \`\`\`

*   **Stage 2 (Cultivation 250+): Foundation Establishment.** The cultivator forms a stable foundation, allowing for external projection of Qi.
    **GM Skill Generation Example:**
    - **Skill:** "Spiritual Sword" (Active)
      \`\`\`json
      {
          "skillName": "Spiritual Sword",
          "skillDescription": "Condense your Qi into a shimmering, ethereal blade and launch it at a foe.",
          "rarity": "Uncommon",
          "combatEffect": { "effects": [{ "effectType": "Damage", "value": "20%", "targetType": "force", "description": "Deals 20% force damage that ignores most physical armor." }] },
          "scalingCharacteristic": "wisdom",
          "scalesValue": true,
          "energyCost": 15
      }
      \`\`\`

*   **Stage 3 (Cultivation 500+): Core Formation.** A Golden Core (Jindan) forms, a potent source of refined energy. This enables more complex techniques, such as flight.
    **GM Skill Generation Example:**
    - **Skill:** "Sword Flight" (Active)
      \`\`\`json
      {
          "skillName": "Sword Flight",
          "skillDescription": "Channel Qi through your weapon, allowing you to stand upon it and fly at great speed for a sustained period.",
          "rarity": "Rare",
          "combatEffect": null,
          "scalingCharacteristic": "wisdom",
          "energyCost": 10
      }
      \`\`\`

*   **Stage 4 (Cultivation 750+): Nascent Soul.** The cultivator's soul evolves, gaining its own consciousness and the ability to exist briefly outside the body.
    **GM Skill Generation Example:**
    - **Skill:** "Nascent Soul Guardian" (Passive)
      \`\`\`json
      {
          "skillName": "Nascent Soul Guardian",
          "skillDescription": "Your evolved soul can protect you from a single fatal blow. Once per day, when you would be reduced to 0 health, you instead survive with 1 health.",
          "rarity": "Rare",
          "type": "Utility",
          "group": "Cultivation",
          "masteryLevel": 1,
          "maxMasteryLevel": 1
      }
      \`\`\`

*   **Stage 5 (Cultivation 1000+): Spirit Severing.** The cultivator severs their mortal attachments, achieving a higher state of comprehension and power, allowing for devastating area-of-effect techniques.
    **GM Skill Generation Example:**
    - **Skill:** "Myriad Sword Rain" (Active)
      \`\`\`json
      {
          "skillName": "Myriad Sword Rain",
          "skillDescription": "Summon a rain of countless spiritual sword phantoms to strike all enemies in an area.",
          "rarity": "Epic",
          "combatEffect": { "effects": [{ "effectType": "Damage", "value": "40%", "targetType": "force", "description": "Deals 40% force damage to up to 5 targets.", "targetsCount": 5 }] },
          "scalingCharacteristic": "wisdom",
          "scalesValue": true,
          "energyCost": 60
      }
      \`\`\`

*   **Stage 6 (Cultivation 1500+): Dao Ancestor.** The cultivator comprehends a fundamental law of the universe, becoming a true master of their own Dao.
    **GM Skill Generation Example:**
    - **Skill:** "World Law: [Domain]" (Active)
      \`\`\`json
      {
          "skillName": "World Law: Sword",
          "skillDescription": "You impose your will upon reality, manifesting a fundamental law of the Sword Dao. For a short time, all your attacks are guaranteed critical hits.",
          "rarity": "Legendary",
          "combatEffect": { "effects": [{ "effectType": "Buff", "value": "100%", "targetType": "critical_chance_override", "duration": 3, "description": "For 3 turns, all of your attacks are automatic Critical Successes." }] },
          "scalingCharacteristic": "wisdom",
          "energyCost": 150
      }
      \`\`\`
`;

export const cultivationSystemDescRu = `### ПРАВИЛА СИСТЕМЫ КУЛЬТИВАЦИИ ###
**ГМ, вы ДОЛЖНЫ реализовать эту систему, используя механику Пользовательских Состояний для прогрессии.** Сила культиватора отслеживается пользовательским состоянием **"Культивация"**. Мощь этих способностей масштабируется от **Мудрости** и питается стандартным пулом **Энергии** персонажа.

**Основные механики:**
1.  **Культивация (Состояние прогрессии):** Создайте Пользовательское Состояние "Культивация" с \`currentValue: 0\`, \`minValue: 0\`, \`maxValue: 1500+\`. Оно представляет собой стадию духовного и физического совершенствования персонажа. Увеличивается через медитацию, поглощение духовной энергии (Ци), употребление пилюль или постижение Дао. Начисляйте очки в зависимости от значимости (1-20 очков за событие).
2.  **Источник Энергии:** Все активные навыки культивации потребляют основную **Энергию** персонажа, а не отдельный пул. Свойство \`energyCost\` навыка представляет собой вычет из основного энергетического ресурса игрового персонажа.
3.  **Открытие способностей:** Когда значение пользовательского состояния "Культивация" игрока достигает нового порога, вы ДОЛЖНЫ даровать ему новый **Активный или Пассивный Навык** через \`activeSkillChanges\` или \`passiveSkillChanges\`. Навыки, перечисленные ниже, являются сбалансированными **примерами**. Поощряется создание других, тематически схожих навыков, чтобы вознаградить конкретные действия игрока и сделать его развитие уникальным.

**Стадии Культивации (Открываются по значению 'Культивации'):**
*   **Стадия 1 (Культивация 100+): Уплотнение Ци.** Культиватор учится ощущать и собирать духовную энергию мира (Ци).
    **Пример генерации навыка для ГМ:**
    - **Навык:** "Чувство Ци" (Пассивный)
      \`\`\`json
      {
          "skillName": "Чувство Ци",
          "skillDescription": "Теперь вы можете слабо ощущать поток Ци в живых существах и окружающей среде, что позволяет вам оценивать общий уровень силы других.",
          "rarity": "Common",
          "type": "Utility",
          "group": "Cultivation",
          "effectDetails": "Дает возможность сделать проверку Мудрости, чтобы определить, является ли другое существо значительно более или менее могущественным.",
          "masteryLevel": 1,
          "maxMasteryLevel": 1
      }
      \`\`\`

*   **Стадия 2 (Культивация 250+): Создание Основы.** Культиватор формирует стабильную основу, позволяющую внешне проецировать Ци.
    **Пример генерации навыка для ГМ:**
    - **Навык:** "Духовный Меч" (Активный)
      \`\`\`json
      {
          "skillName": "Духовный Меч",
          "skillDescription": "Сконцентрируйте свою Ци в мерцающий, эфирный клинок и запустите его во врага.",
          "rarity": "Uncommon",
          "combatEffect": { "effects": [{ "effectType": "Damage", "value": "20%", "targetType": "force", "description": "Наносит 20% урона силой, который игнорирует большинство физических доспехов." }] },
          "scalingCharacteristic": "wisdom",
          "scalesValue": true,
          "energyCost": 15
      }
      \`\`\`

*   **Стадия 3 (Культивация 500+): Формирование Ядра.** Формируется Золотое Ядро (Цзиньдань), мощный источник очищенной энергии. Это позволяет использовать более сложные техники, такие как полет.
    **Пример генерации навыка для ГМ:**
    - **Навык:** "Полет на Мече" (Активный)
      \`\`\`json
      {
          "skillName": "Полет на Мече",
          "skillDescription": "Направьте Ци через свое оружие, что позволит вам стоять на нем и летать с большой скоростью в течение длительного времени.",
          "rarity": "Rare",
          "combatEffect": null,
          "scalingCharacteristic": "wisdom",
          "energyCost": 10
      }
      \`\`\`

*   **Стадия 4 (Культивация 750+): Зарождающаяся Душа.** Душа культиватора эволюционирует, обретая собственное сознание и способность ненадолго существовать вне тела.
    **Пример генерации навыка для ГМ:**
    - **Навык:** "Хранитель Зарождающейся Души" (Пассивный)
      \`\`\`json
      {
          "skillName": "Хранитель Зарождающейся Души",
          "skillDescription": "Ваша развитая душа может защитить вас от одного смертельного удара. Раз в день, когда ваше здоровье должно было упасть до 0, вы выживаете с 1 единицей здоровья.",
          "rarity": "Rare",
          "type": "Utility",
          "group": "Cultivation",
          "masteryLevel": 1,
          "maxMasteryLevel": 1
      }
      \`\`\`

*   **Стадия 5 (Культивация 1000+): Отсечение Духа.** Культиватор отсекает свои смертные привязанности, достигая более высокого состояния понимания и силы, что позволяет использовать разрушительные техники по площади.
    **Пример генерации навыка для ГМ:**
    - **Навык:** "Дождь Мириады Мечей" (Активный)
      \`\`\`json
      {
          "skillName": "Дождь Мириады Мечей",
          "skillDescription": "Призовите дождь из бесчисленных фантомов духовных мечей, чтобы поразить всех врагов в области.",
          "rarity": "Epic",
          "combatEffect": { "effects": [{ "effectType": "Damage", "value": "40%", "targetType": "force", "description": "Наносит 40% урона силой до 5 целям.", "targetsCount": 5 }] },
          "scalingCharacteristic": "wisdom",
          "scalesValue": true,
          "energyCost": 60
      }
      \`\`\`

*   **Стадия 6 (Культивация 1500+): Предок Дао.** Культиватор постигает фундаментальный закон вселенной, становясь истинным мастером своего собственного Дао.
    **Пример генерации навыка для ГМ:**
    - **Навык:** "Закон Мира: [Домен]" (Активный)
      \`\`\`json
      {
          "skillName": "Закон Мира: Меч",
          "skillDescription": "Вы навязываете свою волю реальности, проявляя фундаментальный закон Дао Меча. На короткое время все ваши атаки гарантированно становятся критическими ударами.",
          "rarity": "Legendary",
          "combatEffect": { "effects": [{ "effectType": "Buff", "value": "100%", "targetType": "critical_chance_override", "duration": 3, "description": "В течение 3 ходов все ваши атаки являются автоматическими Критическими Успехами." }] },
          "scalingCharacteristic": "wisdom",
          "energyCost": 150
      }
      \`\`\`
`;