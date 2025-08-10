export const magicSystemDescEn = `### MAGIC DEVELOPMENT SYSTEM RULES ###
**GM, you MUST implement this system using the Custom State mechanics for progression.** A mage's power is tracked by a custom state called **"Magical Attunement"**. The power of these abilities scales with **Intelligence**, and they are fueled by the character's standard **Energy** pool.

**Core Mechanics:**
1.  **Magical Attunement (Progression State):** Create a Custom State named "Magical Attunement" with \`currentValue: 0\`, \`minValue: 0\`, \`maxValue: 1500+\`. This represents the character's connection to the arcane weave. It increases by studying magical texts, successfully casting spells, absorbing ambient energy, or overcoming magical challenges. Award points based on significance (1-20 points per event).
2.  **Energy Source:** All magic active skills consume the character's main **Energy**, not a separate pool. The \`energyCost\` property of a spell represents a deduction from the player character's main energy resource.
3.  **Unlocking Powers:** When the player's "Magical Attunement" custom state reaches a new threshold, you MUST grant them a new **Active or Passive Skill** via \`activeSkillChanges\` or \`passiveSkillChanges\`. The skills listed below are balanced **examples**. You are encouraged to create other, thematically similar skills to reward the player's specific actions and make their progression feel unique.

**Stages of Magical Development (Unlocked by 'Magical Attunement' Value):**

*   **Stage 1: Awakening (Attunement 100+):** The mage learns to perceive the flow of magic in the world.
    **GM Skill Generation Example:**
    - **Skill:** "Sense Magic" (Passive)
      \`\`\`json
      {
          "skillName": "Sense Magic",
          "skillDescription": "You can sense the presence and general school (e.g., Elemental, Illusion) of active magic or powerfully enchanted objects nearby.",
          "rarity": "Common",
          "type": "Utility",
          "group": "Magic",
          "effectDetails": "Grants the ability to make a Perception check to detect magical auras.",
          "masteryLevel": 1,
          "maxMasteryLevel": 1
      }
      \`\`\`

*   **Stage 2: Apprenticeship (Attunement 250+):** The mage learns their first cantrip, a simple manifestation of arcane power.
    **GM Skill Generation Example:**
    - **Skill:** "Mana Bolt" (Active)
      \`\`\`json
      {
          "skillName": "Mana Bolt",
          "skillDescription": "Launch a bolt of raw magical energy at a target.",
          "rarity": "Common",
          "combatEffect": { "effects": [{ "effectType": "Damage", "value": "15%", "targetType": "force", "description": "Deals 15% force damage." }] },
          "scalingCharacteristic": "intelligence",
          "scalesValue": true,
          "energyCost": 10
      }
      \`\`\`

*   **Stage 3: Journeyman (Attunement 500+):** The mage learns to weave protective wards, hardening their own resilience to hostile magic.
    **GM Skill Generation Example:**
    - **Skill:** "Arcane Resistance" (Passive)
      \`\`\`json
      {
          "skillName": "Arcane Resistance",
          "skillDescription": "Your understanding of magic allows you to instinctively brace against hostile spells, granting you a permanent 10% resistance to all magical damage types.",
          "rarity": "Uncommon",
          "type": "CombatEnhancement",
          "group": "Magic",
          "combatEffect": { "effects": [{ "effectType": "Buff", "value": "10%", "targetType": "resist (all_magic)", "description": "Provides +10% resistance to fire, cold, electricity, acid, poison, sonic, force, dark, holy, and psychic damage." }] },
          "masteryLevel": 1,
          "maxMasteryLevel": 3
      }
      \`\`\`

*   **Stage 4: Adept (Attunement 750+):** The mage chooses a magical specialization, gaining deeper insight and power in one school of magic.
    **GM Skill Generation Example (specializing in Elementalism):**
    - **Skill:** "Elemental Specialization" (Passive)
      \`\`\`json
      {
          "skillName": "Elemental Specialization",
          "skillDescription": "Your focus on the elements grants you greater power over them. All your fire, cold, and electricity spells are 15% more effective.",
          "rarity": "Rare",
          "type": "CombatEnhancement",
          "group": "Magic",
          "playerStatBonus": "+15% effectiveness to elemental spells.",
          "masteryLevel": 1,
          "maxMasteryLevel": 5
      }
      \`\`\`
    - **Skill:** "Fireball" (Active)
      \`\`\`json
      {
          "skillName": "Fireball",
          "skillDescription": "Hurl an explosive sphere of fire that detonates on impact, damaging all targets in a small area.",
          "rarity": "Rare",
          "combatEffect": { "effects": [{ "effectType": "Damage", "value": "35%", "targetType": "fire", "description": "Deals 35% fire damage to up to 3 targets.", "targetsCount": 3 }] },
          "scalingCharacteristic": "intelligence",
          "scalesValue": true,
          "energyCost": 40
      }
      \`\`\`

*   **Stage 5: Master (Attunement 1000+):** The mage's command over the arcane is profound, allowing them to create a unique, powerful spell that defines their personal style.
    **GM Skill Generation Example:**
    - **Skill:** "Arcane Potency" (Passive)
      \`\`\`json
      {
          "skillName": "Arcane Potency",
          "skillDescription": "Your mastery over the flow of mana is so complete that all your spells are significantly more powerful.",
          "rarity": "Epic",
          "type": "CombatEnhancement",
          "group": "Magic",
          "playerStatBonus": "+20% effectiveness to all magical skills.",
          "masteryLevel": 1,
          "maxMasteryLevel": 3
      }
      \`\`\`
    - **Reward:** The GM works with the player to design a unique "Signature Spell" (an Active Skill of Epic rarity).

*   **Stage 6: Archmage (Attunement 1500+):** The mage transcends conventional spellcasting, able to weave the very fabric of magic itself.
    **GM Skill Generation Example:**
    - **Skill:** "Spellcraft" (Passive)
      \`\`\`json
      {
          "skillName": "Spellcraft",
          "skillDescription": "Your understanding of arcane principles allows you to improvise and create new, minor spells on the fly through experimentation, subject to GM approval.",
          "rarity": "Legendary",
          "type": "Utility",
          "group": "Magic",
          "effectDetails": "Allows the player to attempt to create new 'Common' or 'Uncommon' rarity spells. Requires a difficult Intelligence check and consumes significant time and energy.",
          "masteryLevel": 1,
          "maxMasteryLevel": 1
      }
      \`\`\`
`;

export const magicSystemDescRu = `### ПРАВИЛА СИСТЕМЫ РАЗВИТИЯ МАГИИ ###
**ГМ, вы ДОЛЖНЫ реализовать эту систему, используя механику Пользовательских Состояний для прогрессии.** Сила мага отслеживается пользовательским состоянием **"Магическая Гармония"**. Мощь этих способностей масштабируется от **Интеллекта** и питается стандартным пулом **Энергии** персонажа.

**Основные механики:**
1.  **Магическая Гармония (Состояние прогрессии):** Создайте Пользовательское Состояние "Магическая Гармония" с \`currentValue: 0\`, \`minValue: 0\`, \`maxValue: 1500+\`. Оно представляет связь персонажа с магическим плетением. Увеличивается при изучении магических текстов, успешном сотворении заклинаний, поглощении окружающей энергии или преодолении магических испытаний. Начисляйте очки в зависимости от значимости (1-20 очков за событие).
2.  **Источник Энергии:** Все магические активные навыки потребляют основную **Энергию** персонажа, а не отдельный пул. Свойство \`energyCost\` заклинания представляет собой вычет из основного энергетического ресурса игрового персонажа.
3.  **Открытие способностей:** Когда значение пользовательского состояния "Магическая Гармония" игрока достигает нового порога, вы ДОЛЖНЫ даровать ему новый **Активный или Пассивный Навык** через \`activeSkillChanges\` или \`passiveSkillChanges\`. Навыки, перечисленные ниже, являются сбалансированными **примерами**. Поощряется создание других, тематически схожих навыков, чтобы вознаградить конкретные действия игрока и сделать его развитие уникальным.

**Стадии магического развития (Открываются по значению 'Магической Гармонии'):**

*   **Стадия 1: Пробуждение (Гармония 100+):** Маг учится воспринимать потоки магии в мире.
    **Пример генерации навыка для ГМ:**
    - **Навык:** "Чувство магии" (Пассивный)
      \`\`\`json
      {
          "skillName": "Чувство магии",
          "skillDescription": "Вы можете ощущать присутствие и общую школу (напр., Элементальная, Иллюзия) активной магии или сильно зачарованных предметов поблизости.",
          "rarity": "Common",
          "type": "Utility",
          "group": "Magic",
          "effectDetails": "Дает возможность сделать проверку Восприятия для обнаружения магических аур.",
          "masteryLevel": 1,
          "maxMasteryLevel": 1
      }
      \`\`\`

*   **Стадия 2: Ученичество (Гармония 250+):** Маг изучает свой первый заговор, простое проявление тайной силы.
    **Пример генерации навыка для ГМ:**
    - **Навык:** "Стрела маны" (Активный)
      \`\`\`json
      {
          "skillName": "Стрела маны",
          "skillDescription": "Запустите сгусток сырой магической энергии в цель.",
          "rarity": "Common",
          "combatEffect": { "effects": [{ "effectType": "Damage", "value": "15%", "targetType": "force", "description": "Наносит 15% урона силой." }] },
          "scalingCharacteristic": "intelligence",
          "scalesValue": true,
          "energyCost": 10
      }
      \`\`\`

*   **Стадия 3: Подмастерье (Гармония 500+):** Маг учится плести защитные чары, укрепляя свою стойкость к враждебной магии.
    **Пример генерации навыка для ГМ:**
    - **Навык:** "Тайное сопротивление" (Пассивный)
      \`\`\`json
      {
          "skillName": "Тайное сопротивление",
          "skillDescription": "Ваше понимание магии позволяет вам инстинктивно защищаться от враждебных заклинаний, даруя постоянное 10% сопротивление всем видам магического урона.",
          "rarity": "Uncommon",
          "type": "CombatEnhancement",
          "group": "Magic",
          "combatEffect": { "effects": [{ "effectType": "Buff", "value": "10%", "targetType": "resist (all_magic)", "description": "Дает +10% сопротивления урону огнем, холодом, электричеством, кислотой, ядом, звуком, силой, тьмой, светом и психикой." }] },
          "masteryLevel": 1,
          "maxMasteryLevel": 3
      }
      \`\`\`

*   **Стадия 4: Адепт (Гармония 750+):** Маг выбирает магическую специализацию, получая более глубокое понимание и силу в одной из школ магии.
    **Пример генерации навыка (специализация на Элементализме):**
    - **Навык:** "Специализация на стихиях" (Пассивный)
      \`\`\`json
      {
          "skillName": "Специализация на стихиях",
          "skillDescription": "Ваша сосредоточенность на стихиях дает вам большую власть над ними. Все ваши заклинания огня, холода и электричества на 15% эффективнее.",
          "rarity": "Rare",
          "type": "CombatEnhancement",
          "group": "Magic",
          "playerStatBonus": "+15% к эффективности стихийных заклинаний.",
          "masteryLevel": 1,
          "maxMasteryLevel": 5
      }
      \`\`\`
    - **Навык:** "Огненный шар" (Активный)
      \`\`\`json
      {
          "skillName": "Огненный шар",
          "skillDescription": "Метните взрывную сферу огня, которая детонирует при ударе, нанося урон всем целям в небольшой области.",
          "rarity": "Rare",
          "combatEffect": { "effects": [{ "effectType": "Damage", "value": "35%", "targetType": "fire", "description": "Наносит 35% урона огнем до 3 целям.", "targetsCount": 3 }] },
          "scalingCharacteristic": "intelligence",
          "scalesValue": true,
          "energyCost": 40
      }
      \`\`\`

*   **Стадия 5: Мастер (Гармония 1000+):** Владение мага тайными искусствами становится глубоким, позволяя ему создать уникальное, мощное заклинание, определяющее его личный стиль.
    **Пример генерации навыка для ГМ:**
    - **Навык:** "Тайная мощь" (Пассивный)
      \`\`\`json
      {
          "skillName": "Тайная мощь",
          "skillDescription": "Ваше мастерство управления потоками маны настолько велико, что все ваши заклинания становятся значительно мощнее.",
          "rarity": "Epic",
          "type": "CombatEnhancement",
          "group": "Magic",
          "playerStatBonus": "+20% к эффективности всех магических навыков.",
          "masteryLevel": 1,
          "maxMasteryLevel": 3
      }
      \`\`\`
    - **Награда:** ГМ совместно с игроком создает уникальное "Фирменное заклинание" (Активный навык Эпической редкости).

*   **Стадия 6: Архимаг (Гармония 1500+):** Маг выходит за рамки обычного колдовства, обретая способность плести саму ткань магии.
    **Пример генерации навыка для ГМ:**
    - **Навык:** "Создание заклинаний" (Пассивный)
      \`\`\`json
      {
          "skillName": "Создание заклинаний",
          "skillDescription": "Ваше понимание тайных принципов позволяет вам импровизировать и создавать новые, малые заклинания на лету путем экспериментов, с одобрения ГМ.",
          "rarity": "Legendary",
          "type": "Utility",
          "group": "Magic",
          "effectDetails": "Позволяет игроку пытаться создавать новые заклинания Обычной или Необычной редкости. Требует сложной проверки Интеллекта и значительных затрат времени и энергии.",
          "masteryLevel": 1,
          "maxMasteryLevel": 1
      }
      \`\`\`
`;