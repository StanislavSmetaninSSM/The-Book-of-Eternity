export const priesthoodSystemDescEn = `### PRIESTHOOD & DIVINE FAVOR SYSTEM RULES ###
**GM, you MUST implement this system using the Custom State mechanics for progression.** A priest's connection to their deity is tracked by a custom state called **"Divine Favor"**. The power of these abilities scales with **Faith**, and they are fueled by the character's standard **Energy** pool.

**Core Mechanics:**
1.  **Divine Favor (Progression State):** Create a Custom State named "Divine Favor" with \`currentValue: 0\`, \`minValue: 0\`, \`maxValue: 1000+\`. This represents the character's standing with their chosen deity. It increases through acts of piety, upholding the deity's tenets, smiting their enemies, and completing sacred quests. Award points based on significance (1-20 points per event). Actions that displease the deity will decrease this value.
2.  **Energy Source:** All divine active skills consume the character's main **Energy**, not a separate pool. The \`energyCost\` property of a spell represents a deduction from the player character's main energy resource.
3.  **Unlocking Powers:** When the player's "Divine Favor" custom state reaches a new threshold, you MUST grant them a new **Active or Passive Skill** via \`activeSkillChanges\` or \`passiveSkillChanges\`. If their Favor drops below a threshold, they lose access to the skill(s) of that tier. The skills listed below are balanced **examples**. You are encouraged to create other, thematically similar skills to reward the player's specific actions and make their progression feel unique to their chosen deity.

**Tiers of Divine Favor (Unlocked by 'Divine Favor' Value):**

*   **Tier 1: Initiate (Favor 100+):** The deity's presence is a subtle warmth, offering minor boons and protection.
    **GM Skill Generation Example:**
    - **Skill:** "Blessing of Fortitude" (Active)
      \`\`\`json
      {
          "skillName": "Blessing of Fortitude",
          "skillDescription": "You channel a prayer to grant yourself or an ally a minor boost to resilience, briefly hardening their resolve.",
          "rarity": "Common",
          "combatEffect": { "effects": [{ "effectType": "Buff", "value": "10%", "targetType": "resist (all)", "duration": 2, "description": "Grants +10% resistance to all damage for 2 turns." }] },
          "scalingCharacteristic": "faith",
          "scalesValue": true,
          "energyCost": 10
      }
      \`\`\`

*   **Tier 2: Acolyte (Favor 250+):** The deity's power flows more freely, allowing for acts of restoration.
    **GM Skill Generation Example:**
    - **Skill:** "Lesser Healing Light" (Active)
      \`\`\`json
      {
          "skillName": "Lesser Healing Light",
          "skillDescription": "A gentle, holy light envelops a target, mending minor wounds.",
          "rarity": "Uncommon",
          "combatEffect": { "effects": [{ "effectType": "Heal", "value": "20%", "targetType": "health", "description": "Restores 20% health." }] },
          "scalingCharacteristic": "faith",
          "scalesValue": true,
          "energyCost": 20
      }
      \`\`\`

*   **Tier 3: Priest (Favor 500+):** The character becomes a true conduit, able to channel divine authority to repel forces anathema to their deity.
    **GM Skill Generation Example (for a sun/light deity):**
    - **Skill:** "Turn Undead" (Active)
      \`\`\`json
      {
          "skillName": "Turn Undead",
          "skillDescription": "You present your holy symbol and chant a prayer of banishment, forcing nearby undead to recoil in terror.",
          "rarity": "Rare",
          "combatEffect": { "effects": [{ "effectType": "Control", "value": "75%", "targetType": "fear", "duration": 2, "description": "75% chance to inflict Fear on up to 3 undead targets for 2 turns.", "targetsCount": 3 }] },
          "scalingCharacteristic": "faith",
          "scalesChance": true,
          "energyCost": 40
      }
      \`\`\`

*   **Tier 4: Champion (Favor 750+):** The deity's power can be channeled into righteous fury, smiting down the unworthy.
    **GM Skill Generation Example:**
    - **Skill:** "Divine Smite" (Active)
      \`\`\`json
      {
          "skillName": "Divine Smite",
          "skillDescription": "Imbue your weapon with holy energy and strike a foe with divine judgment.",
          "rarity": "Rare",
          "combatEffect": { "effects": [{ "effectType": "Damage", "value": "40%", "targetType": "holy", "description": "Deals 40% holy damage." }] },
          "scalingCharacteristic": "faith",
          "scalesValue": true,
          "energyCost": 50
      }
      \`\`\`

*   **Tier 5: Chosen Hand (Favor 1000+):** The character acts as a direct extension of their deity's will, capable of calling down small miracles.
    **GM Skill Generation Example:**
    - **Skill:** "Divine Intervention" (Active)
      \`\`\`json
      {
          "skillName": "Divine Intervention",
          "skillDescription": "Once per major story arc, you can beseech your deity for direct aid. The result is a powerful, narrative-driven miracle that can turn the tide of a desperate situation, subject to GM interpretation.",
          "rarity": "Legendary",
          "combatEffect": null,
          "scalingCharacteristic": "faith",
          "energyCost": 200
      }
      \`\`\`
`;

export const priesthoodSystemDescRu = `### ПРАВИЛА СИСТЕМЫ ЖРЕЧЕСТВА И БОЖЕСТВЕННОГО БЛАГОВОЛЕНИЯ ###
**ГМ, вы ДОЛЖНЫ реализовать эту систему, используя механику Пользовательских Состояний для прогрессии.** Связь жреца с божеством отслеживается пользовательским состоянием **"Божественное Благоволение"**. Сила этих способностей масштабируется от **Веры** и питается стандартным пулом **Энергии** персонажа.

**Основные механики:**
1.  **Божественное Благоволение (Состояние прогрессии):** Создайте Пользовательское Состояние "Божественное Благоволение" с \`currentValue: 0\`, \`minValue: 0\`, \`maxValue: 1000+\`. Оно представляет положение персонажа перед избранным божеством. Увеличивается через акты благочестия, соблюдение заповедей божества, уничтожение его врагов и выполнение священных квестов. Начисляйте очки в зависимости от значимости (1-20 очков за событие). Действия, неугодные божеству, будут уменьшать это значение.
2.  **Источник Энергии:** Все божественные активные навыки потребляют основную **Энергию** персонажа, а не отдельный пул. Свойство \`energyCost\` заклинания представляет собой вычет из основного энергетического ресурса игрового персонажа.
3.  **Открытие способностей:** Когда значение пользовательского состояния "Божественное Благоволение" игрока достигает нового порога, вы ДОЛЖНЫ даровать ему новый **Активный или Пассивный Навык** через \`activeSkillChanges\` или \`passiveSkillChanges\`. Если его Благоволение падает ниже порога, он теряет доступ к навыку(ам) этого уровня. Навыки, перечисленные ниже, являются сбалансированными **примерами**. Поощряется создание других, тематически схожих навыков, чтобы вознаградить конкретные действия игрока и сделать его развитие уникальным для избранного им божества.

**Уровни Божественного Благоволения (Открываются по значению 'Божественного Благоволения'):**

*   **Уровень 1: Послушник (Благоволение 100+):** Присутствие божества — это едва ощутимое тепло, дарующее незначительные блага и защиту.
    **Пример генерации навыка для ГМ:**
    - **Навык:** "Благословение Стойкости" (Активный)
      \`\`\`json
      {
          "skillName": "Благословение Стойкости",
          "skillDescription": "Вы возносите молитву, чтобы даровать себе или союзнику незначительное усиление стойкости, на короткое время укрепляя его волю.",
          "rarity": "Common",
          "combatEffect": { "effects": [{ "effectType": "Buff", "value": "10%", "targetType": "resist (all)", "duration": 2, "description": "Дает +10% сопротивления всему урону на 2 хода." }] },
          "scalingCharacteristic": "faith",
          "scalesValue": true,
          "energyCost": 10
      }
      \`\`\`

*   **Уровень 2: Аколит (Благоволение 250+):** Сила божества течет свободнее, позволяя совершать акты восстановления.
    **Пример генерации навыка для ГМ:**
    - **Навык:** "Малый Исцеляющий Свет" (Активный)
      \`\`\`json
      {
          "skillName": "Малый Исцеляющий Свет",
          "skillDescription": "Мягкий, святой свет окутывает цель, залечивая незначительные раны.",
          "rarity": "Uncommon",
          "combatEffect": { "effects": [{ "effectType": "Heal", "value": "20%", "targetType": "health", "description": "Восстанавливает 20% здоровья." }] },
          "scalingCharacteristic": "faith",
          "scalesValue": true,
          "energyCost": 20
      }
      \`\`\`

*   **Уровень 3: Жрец (Благоволение 500+):** Персонаж становится истинным проводником, способным направлять божественную власть, чтобы изгонять силы, враждебные его божеству.
    **Пример генерации навыка (для бога солнца/света):**
    - **Навык:** "Изгнание нежити" (Активный)
      \`\`\`json
      {
          "skillName": "Изгнание нежити",
          "skillDescription": "Вы представляете свой святой символ и произносите молитву изгнания, заставляя ближайшую нежить отступать в ужасе.",
          "rarity": "Rare",
          "combatEffect": { "effects": [{ "effectType": "Control", "value": "75%", "targetType": "fear", "duration": 2, "description": "75% шанс наложить Страх на до 3 целей-нежити на 2 хода.", "targetsCount": 3 }] },
          "scalingCharacteristic": "faith",
          "scalesChance": true,
          "energyCost": 40
      }
      \`\`\`

*   **Уровень 4: Чемпион (Благоволение 750+):** Сила божества может быть направлена в праведный гнев, карая недостойных.
    **Пример генерации навыка для ГМ:**
    - **Навык:** "Божественная Кара" (Активный)
      \`\`\`json
      {
          "skillName": "Божественная Кара",
          "skillDescription": "Наполните свое оружие святой энергией и поразите врага божественным судом.",
          "rarity": "Rare",
          "combatEffect": { "effects": [{ "effectType": "Damage", "value": "40%", "targetType": "holy", "description": "Наносит 40% святого урона." }] },
          "scalingCharacteristic": "faith",
          "scalesValue": true,
          "energyCost": 50
      }
      \`\`\`

*   **Уровень 5: Десница (Благоволение 1000+):** Персонаж действует как прямое продолжение воли своего божества, способный призывать малые чудеса.
    **Пример генерации навыка для ГМ:**
    - **Навык:** "Божественное Вмешательство" (Активный)
      \`\`\`json
      {
          "skillName": "Божественное Вмешательство",
          "skillDescription": "Один раз за крупную сюжетную арку вы можете взмолиться своему божеству о прямой помощи. Результатом будет мощное, сюжетно-ориентированное чудо, способное переломить ход отчаянной ситуации, на усмотрение ГМ.",
          "rarity": "Legendary",
          "combatEffect": null,
          "scalingCharacteristic": "faith",
          "energyCost": 200
      }
      \`\`\`
`;