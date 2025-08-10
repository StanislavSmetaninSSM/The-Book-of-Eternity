export const oldMagicDescEn = `### OLD MAGIC OF ALBION SYSTEM RULES ###
**GM, you MUST implement this system using the Custom State mechanics for progression.** The character's connection to the primal magic of the land is tracked by a custom state called **"Awen"**. The power of these abilities scales with **Wisdom**, and they are fueled by the character's standard **Energy** pool.

**Core Mechanics:**
1.  **Awen (Progression State):** Create a Custom State named "Awen" with \`currentValue: 0\`, \`minValue: 0\`, \`maxValue: 1000\`. "Awen" represents divine inspiration from the land itself. It increases through acts in harmony with the old ways: communing with nature, performing ancient rites, protecting sacred groves, or defeating unnatural blights. Award points based on significance (1-20 points per event).
2.  **Energy Source:** All Old Magic active skills consume the character's main **Energy**, not a separate pool.
3.  **Unlocking Powers:** When the player's "Awen" custom state reaches a new threshold, you MUST grant them a new **Active Skill** via \`activeSkillChanges\` that reflects their new tier of power. The skills listed below are balanced **examples** of what you should generate. You are encouraged to create other, thematically similar skills to reward the player's specific actions and make their progression feel unique.

**Tiers of Awen (Unlocked by 'Awen' Value):**
*   **Tier 1 (Awen 100+): The Whisper.** The user can hear the whispers of the land, sensing its state and the presence of life.
    **GM Skill Generation Example:**
    - **Skill:** "Sense the Land"
      \`\`\`json
      {
          "skillName": "Sense the Land",
          "skillDescription": "Quiet your mind and listen to the land, gaining a general sense of the health of the local ecosystem, the presence of significant creatures (beast or man), or the direction of the nearest source of fresh water.",
          "rarity": "Common",
          "combatEffect": null,
          "scalingCharacteristic": "wisdom",
          "energyCost": 5
      }
      \`\`\`

*   **Tier 2 (Awen 250+): The Voice.** The user can subtly influence the natural world, coaxing it to reveal its secrets or hinder foes.
    **GM Skill Generation Example:**
    - **Skill:** "Grasping Roots"
      \`\`\`json
      {
          "skillName": "Grasping Roots",
          "skillDescription": "Urge the roots and vines from the earth to temporarily ensnare a target's feet.",
          "rarity": "Uncommon",
          "combatEffect": { "effects": [{ "effectType": "Control", "value": "50%", "targetType": "immobility", "duration": 1, "description": "50% chance to make the target immobile for 1 turn." }] },
          "scalingCharacteristic": "wisdom",
          "scalesChance": true,
          "energyCost": 20
      }
      \`\`\`

*   **Tier 3 (Awen 500+): The Hand.** The user can now channel the resilience of nature into themselves, hardening their skin like bark or healing minor wounds with poultices of moss and dew.
    **GM Skill Generation Example:**
    - **Skill:** "Barkskin"
      \`\`\`json
      {
          "skillName": "Barkskin",
          "skillDescription": "Your skin temporarily takes on the resilience of ancient oak, absorbing blows.",
          "rarity": "Rare",
          "combatEffect": { "effects": [{ "effectType": "DamageReduction", "value": "25%", "targetType": "all", "duration": 3, "description": "Reduces all incoming damage by 25% for 3 turns." }] },
          "scalingCharacteristic": "wisdom",
          "scalesValue": true,
          "energyCost": 35
      }
      \`\`\`

*   **Tier 4 (Awen 750+): The Heart.** The user's connection deepens, allowing them to speak with beasts or see through the eyes of a bird, communing directly with the wild heart of Albion.
    **GM Skill Generation Example:**
    - **Skill:** "Speak with Beasts"
      \`\`\`json
      {
          "skillName": "Speak with Beasts",
          "skillDescription": "For a short time, you can understand and communicate with a single natural animal, asking it simple questions about what it has seen or sensed. Its intelligence is not enhanced.",
          "rarity": "Rare",
          "combatEffect": null,
          "scalingCharacteristic": "wisdom",
          "energyCost": 40
      }
      \`\`\`
      
*   **Tier 5 (Awen 1000+): The Storm.** The user becomes a conduit for the raw, untamed power of the land itself, able to call upon the fury of the storm.
    **GM Skill Generation Example:**
    - **Skill:** "Summon Storm"
      \`\`\`json
      {
          "skillName": "Summon Storm",
          "skillDescription": "Call upon the heavens to unleash a localized storm of crackling lightning and driving rain, striking your foes.",
          "rarity": "Epic",
          "combatEffect": { "effects": [{ "effectType": "Damage", "value": "60%", "targetType": "electricity", "description": "Calls down a lightning strike on up to 3 targets, dealing 60% electricity damage to each.", "targetsCount": 3 }] },
          "scalingCharacteristic": "wisdom",
          "scalesValue": true,
          "energyCost": 80
      }
      \`\`\`
`;

export const oldMagicDescRu = `### ПРАВИЛА СИСТЕМЫ ДРЕВНЕЙ МАГИИ АЛЬБИОНА ###
**ГМ, вы ДОЛЖНЫ реализовать эту систему, используя механику Пользовательских Состояний для прогрессии.** Связь персонажа с первобытной магией земли отслеживается пользовательским состоянием **"Авен"**. Сила этих способностей масштабируется от **Мудрости**, и они питаются стандартным пулом **Энергии** персонажа.

**Основные механики:**
1.  **Авен (Состояние прогрессии):** Создайте Пользовательское Состояние "Авен" с \`currentValue: 0\`, \`minValue: 0\`, \`maxValue: 1000\`. "Авен" представляет божественное вдохновение от самой земли. Увеличивается через действия в гармонии со старыми обычаями: общение с природой, выполнение древних обрядов, защита священных рощ или победа над неестественной порчей. Начисляйте очки в зависимости от значимости (1-20 очков за событие).
2.  **Источник Энергии:** Все активные навыки Древней Магии потребляют основную **Энергию** персонажа, а не отдельный пул.
3.  **Открытие способностей:** Когда значение пользовательского состояния "Авен" игрока достигает нового порога, вы ДОЛЖНЫ даровать ему новый **Активный Навык** через \`activeSkillChanges\`, отражающий новый уровень его силы. Навыки, перечисленные ниже, являются сбалансированными **примерами** того, что вы должны генерировать. Поощряется создание других, тематически схожих навыков, чтобы вознаградить конкретные действия игрока и сделать его развитие уникальным.

**Уровни Авена (Открываются по значению 'Авена'):**
*   **Уровень 1 (Авен 100+): Шепот.** Пользователь может слышать шепот земли, ощущая ее состояние и присутствие жизни.
    **Пример генерации навыка для ГМ:**
    - **Навык:** "Чувство Земли"
      \`\`\`json
      {
          "skillName": "Чувство Земли",
          "skillDescription": "Успокойте свой разум и прислушайтесь к земле, чтобы получить общее представление о здоровье местной экосистемы, присутствии значительных существ (зверей или людей) или направлении к ближайшему источнику пресной воды.",
          "rarity": "Common",
          "combatEffect": null,
          "scalingCharacteristic": "wisdom",
          "energyCost": 5
      }
      \`\`\`

*   **Уровень 2 (Авен 250+): Голос.** Пользователь может тонко влиять на мир природы, убеждая его раскрыть свои секреты или помешать врагам.
    **Пример генерации навыка для ГМ:**
    - **Навык:** "Хватающие Корни"
      \`\`\`json
      {
          "skillName": "Хватающие Корни",
          "skillDescription": "Побудите корни и лианы из земли временно опутать ноги цели.",
          "rarity": "Uncommon",
          "combatEffect": { "effects": [{ "effectType": "Control", "value": "50%", "targetType": "immobility", "duration": 1, "description": "50% шанс сделать цель неподвижной на 1 ход." }] },
          "scalingCharacteristic": "wisdom",
          "scalesChance": true,
          "energyCost": 20
      }
      \`\`\`

*   **Уровень 3 (Авен 500+): Рука.** Пользователь теперь может направлять стойкость природы в себя, делая свою кожу твердой, как кора, или исцеляя мелкие раны припарками из мха и росы.
    **Пример генерации навыка для ГМ:**
    - **Навык:** "Дубовая Кожа"
      \`\`\`json
      {
          "skillName": "Дубовая Кожа",
          "skillDescription": "Ваша кожа временно приобретает прочность древнего дуба, поглощая удары.",
          "rarity": "Rare",
          "combatEffect": { "effects": [{ "effectType": "DamageReduction", "value": "25%", "targetType": "all", "duration": 3, "description": "Снижает весь входящий урон на 25% на 3 хода." }] },
          "scalingCharacteristic": "wisdom",
          "scalesValue": true,
          "energyCost": 35
      }
      \`\`\`

*   **Уровень 4 (Авен 750+): Сердце.** Связь пользователя углубляется, позволяя ему говорить со зверями или видеть глазами птицы, общаясь напрямую с диким сердцем Альбиона.
    **Пример генерации навыка для ГМ:**
    - **Навык:** "Разговор со Зверями"
      \`\`\`json
      {
          "skillName": "Разговор со Зверями",
          "skillDescription": "На короткое время вы можете понимать и общаться с одним диким животным, задавая ему простые вопросы о том, что оно видело или чувствовало. Его интеллект не повышается.",
          "rarity": "Rare",
          "combatEffect": null,
          "scalingCharacteristic": "wisdom",
          "energyCost": 40
      }
      \`\`\`

*   **Уровень 5 (Авен 1000+): Шторм.** Пользователь становится проводником для сырой, необузданной силы самой земли, способным призывать ярость бури.
    **Пример генерации навыка для ГМ:**
    - **Навык:** "Призыв Бури"
      \`\`\`json
      {
          "skillName": "Призыв Бури",
          "skillDescription": "Призовите небеса, чтобы обрушить локальную бурю с трескучими молниями и проливным дождем на ваших врагов.",
          "rarity": "Epic",
          "combatEffect": { "effects": [{ "effectType": "Damage", "value": "60%", "targetType": "electricity", "description": "Призывает удар молнии по 3 целям, нанося каждой 60% урона электричеством.", "targetsCount": 3 }] },
          "scalingCharacteristic": "wisdom",
          "scalesValue": true,
          "energyCost": 80
      }
      \`\`\`
`;
